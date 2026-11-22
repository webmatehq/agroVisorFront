import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, list } from './api';
import { ParcelMap } from './Map';
import { Info, Refresh, TrendDown, TrendUp } from './Icons';

type Obs = {
  id: string; from_date: string; to_date: string; quality: string;
  ndvi_mean?: number | null; ndvi_min?: number | null; ndvi_max?: number | null; ndvi_median?: number | null; ndvi_stddev?: number | null;
  valid_fraction?: number | null; ndvi_histogram?: { low: number; high: number; count: number }[];
  ndvi_raster_url?: string | null; raster_url?: string | null; bounds?: number[] | null;
};

/** Plain-language vigor classes over NDVI. Orientative; colors match the map ramp. */
export const classes = [
  { key: 'bare', label: 'Suelo o vegetación escasa', short: 'Escasa', from: -1, to: 0.2, color: '#a4143c' },
  { key: 'low', label: 'Vigor bajo', short: 'Bajo', from: 0.2, to: 0.4, color: '#ffa21c' },
  { key: 'mid', label: 'Vigor moderado', short: 'Moderado', from: 0.4, to: 0.6, color: '#c4d600' },
  { key: 'high', label: 'Vigor alto', short: 'Alto', from: 0.6, to: 0.8, color: '#2fae6a' },
  { key: 'top', label: 'Vigor muy alto', short: 'Muy alto', from: 0.8, to: 1.01, color: '#00734f' },
];
export const classOf = (v: number) => classes.find(c => v >= c.from && v < c.to) || classes[classes.length - 1];

export const quality: Record<string, { label: string; tone: 'good' | 'caution' | 'bad' }> = {
  valid: { label: 'Imagen clara', tone: 'good' },
  low_coverage: { label: 'Nubes parciales', tone: 'caution' },
  no_data: { label: 'Nublado · sin imagen útil', tone: 'bad' },
};
export const usable = (o: Obs) => o.ndvi_mean != null && o.quality !== 'no_data';
export const dateLabel = (iso: string, withYear = false) => new Date(iso + 'T12:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) }).replace('.', '');
export const n3 = (v?: number | null) => (v == null ? '—' : Number(v).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

export function NdviView({ parcel, parcelName, geometry, latitude, writable }: {
  parcel: string; parcelName?: string; geometry: any; latitude?: number | null; writable: boolean;
}) {
  const q = useQueryClient();
  const [selected, setSelected] = useState('');
  const [layer, setLayer] = useState<'ndvi' | 'rgb'>('ndvi');
  const [jobId, setJobId] = useState('');
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const r = useQuery({ queryKey: ['ndvi', parcel], queryFn: () => api(`/parcels/${parcel}/ndvi`), enabled: !!parcel });
  const job = useQuery({
    queryKey: ['job', jobId], queryFn: () => api('/jobs/' + jobId), enabled: !!jobId,
    refetchInterval: query => (['completed', 'failed', 'obsolete'].includes(query.state.data?.status) ? false : 5000),
  });
  useEffect(() => { setSelected(''); setJobId(''); setFromDate(''); setToDate(''); setError(''); }, [parcel]);
  useEffect(() => {
    if (job.data?.status === 'completed') {
      q.invalidateQueries({ queryKey: ['ndvi', parcel] });
      q.invalidateQueries({ queryKey: ['dashboard-ndvi', parcel] });
    }
  }, [job.data?.status, parcel, q]);

  const observations: Obs[] = list(r.data);
  const timeline = useMemo(() => [...observations].reverse(), [observations]);
  const latestUsable = observations.find(usable);
  const obs = observations.find(o => o.id === selected) || latestUsable || observations[0];
  const previous = obs ? observations.slice(observations.indexOf(obs) + 1).find(usable) : undefined;
  const busy = !!jobId && !['completed', 'failed', 'obsolete'].includes(job.data?.status);

  if (!parcel) return <section className="card av-empty">Selecciona una parcela en la barra superior para ver su desarrollo.</section>;

  const refresh = async () => {
    setError('');
    try {
      if (Boolean(fromDate) !== Boolean(toDate)) throw Error('Indica la fecha de inicio y la de fin, o deja ambas vacías.');
      if (fromDate && (fromDate > toDate || Date.parse(toDate) - Date.parse(fromDate) > 366 * 86400000)) throw Error('Elige un período válido de hasta un año.');
      const j = await api(`/parcels/${parcel}/ndvi/refresh`, 'POST', fromDate ? { from_date: fromDate, to_date: toDate } : {});
      setJobId(j.id);
    } catch (e) { setError((e as Error).message); }
  };

  // Distribution by vigor class from the 0.2-wide histogram bins.
  const bins = Array.isArray(obs?.ndvi_histogram) ? obs!.ndvi_histogram! : [];
  const total = bins.reduce((s, b) => s + (Number(b.count) || 0), 0);
  const cellHa = latitude == null ? null : Math.pow(111320 * 0.0001, 2) * Math.cos(Number(latitude) * Math.PI / 180) / 10000;
  const dist = classes.map(c => {
    const count = bins.filter(b => Number(b.low) >= c.from - 1e-9 && Number(b.low) < c.to - 1e-9).reduce((s, b) => s + (Number(b.count) || 0), 0);
    return { ...c, count, pct: total ? count / total * 100 : 0, ha: cellHa != null ? count * cellHa : null };
  });

  const mean = obs?.ndvi_mean != null ? Number(obs.ndvi_mean) : null;
  const cls = mean != null ? classOf(mean) : null;
  const delta = mean != null && previous?.ndvi_mean != null ? mean - Number(previous.ndvi_mean) : null;
  const q8 = quality[obs?.quality || ''] || { label: '—', tone: 'caution' as const };
  const overlayUrl = layer === 'ndvi' ? obs?.ndvi_raster_url : obs?.raster_url;

  return <section className="av">
    <header className="av-head">
      <div>
        <h1>Desarrollo del cultivo</h1>
        <p>{parcelName ? `${parcelName} · ` : ''}Vigor de la vegetación (NDVI) a partir de imágenes del satélite Sentinel-2</p>
      </div>
      {writable && <div className="av-head-actions">
        <details className="av-period">
          <summary>Otro período</summary>
          <div className="av-period-body">
            <p>Déjalo vacío para buscar las imágenes más recientes. Máximo un año.</p>
            <label>Desde<input type="date" value={fromDate} max={toDate || new Date().toISOString().slice(0, 10)} onChange={e => setFromDate(e.target.value)} /></label>
            <label>Hasta<input type="date" value={toDate} min={fromDate || undefined} max={new Date().toISOString().slice(0, 10)} onChange={e => setToDate(e.target.value)} /></label>
          </div>
        </details>
        <button type="button" className="button" onClick={refresh} disabled={busy || r.data?.configured === false}>
          <Refresh size={16} className={busy ? 'av-spin' : undefined} />{busy ? 'Buscando imágenes…' : 'Buscar imágenes nuevas'}
        </button>
      </div>}
    </header>

    {(r.error || job.error || error) && <p role="alert" className="error">{error || ((r.error || job.error) as Error)?.message}</p>}
    {r.data?.configured === false && <p className="av-note av-note-warn"><Info size={16} />El servicio satelital no está configurado en el servidor.</p>}
    {job.data && <p className={`av-note ${job.data.status === 'failed' ? 'av-note-warn' : ''}`} role="status"><Info size={16} />
      {({ queued: 'Solicitud en cola: el procesamiento empezará en breve y puede tardar unos minutos.', processing: 'Descargando y procesando las imágenes del satélite…', completed: 'Listo: las observaciones se han actualizado.', failed: 'No se pudo completar la búsqueda de imágenes.', obsolete: 'El contorno de la parcela cambió; vuelve a buscar imágenes.' } as Record<string, string>)[job.data.status] || job.data.status}
      {job.data.last_error ? ` ${job.data.last_error}` : ''}
    </p>}

    {r.isPending ? <div className="av-skeleton" aria-busy="true" aria-label="Cargando observaciones" /> : !observations.length ? (
      <section className="card av-empty">
        <h2>Aún no hay imágenes de esta parcela</h2>
        <p>{writable ? 'Pulsa «Buscar imágenes nuevas» para descargar las observaciones de los últimos meses.' : 'Cuando se procesen las imágenes del satélite aparecerán aquí.'}</p>
      </section>
    ) : <>
      <div className="nv-top">
        <article className="card nv-map">
          <div className="nv-map-head">
            <div className="av-tabs" role="tablist" aria-label="Capa del mapa">
              <button type="button" role="tab" aria-selected={layer === 'ndvi'} onClick={() => setLayer('ndvi')}>Vigor (NDVI)</button>
              <button type="button" role="tab" aria-selected={layer === 'rgb'} onClick={() => setLayer('rgb')}>Imagen real</button>
            </div>
            <span className="av-label">{obs ? dateLabel(obs.from_date, true) : ''}</span>
          </div>
          <ParcelMap geometry={geometry} overlay={overlayUrl && obs?.bounds ? { url: overlayUrl, bounds: [[obs.bounds[1], obs.bounds[0]], [obs.bounds[3], obs.bounds[2]]] } : undefined} />
          {layer === 'ndvi' && <div className="nv-legend" aria-label="Leyenda del mapa">
            <span className="nv-ramp" />
            <span className="nv-legend-labels"><span>Menos vigor</span><span>Más vigor</span></span>
          </div>}
          {!overlayUrl && <p className="av-foot"><Info size={14} />No hay imagen para esta fecha (probablemente por nubes); se muestra solo el contorno.</p>}
        </article>

        <article className="card nv-summary">
          <span className={`av-chip ${q8.tone}`}>{q8.label}</span>
          {mean != null && cls ? <>
            <span className="av-label">NDVI medio · {dateLabel(obs!.from_date, true)}</span>
            <strong className="nv-value">{n3(mean)}</strong>
            <span className="nv-class"><i style={{ background: cls.color }} />{cls.label}</span>
            {delta != null && previous && <p className={`nv-delta ${delta >= 0.02 ? 'up' : delta <= -0.02 ? 'down' : ''}`}>
              {delta >= 0.02 ? <TrendUp size={16} /> : delta <= -0.02 ? <TrendDown size={16} /> : null}
              {Math.abs(delta) < 0.02 ? 'Estable' : `${delta > 0 ? '+' : '−'}${n3(Math.abs(delta))}`} respecto al {dateLabel(previous.from_date)}
            </p>}
            {total > 0 && <div className="nv-dist">
              <span className="av-label">Cómo se reparte la parcela</span>
              <div className="nv-stack" role="img" aria-label={dist.filter(d => d.pct >= 1).map(d => `${d.label} ${d.pct.toFixed(0)} %`).join(', ')}>
                {dist.filter(d => d.pct > 0).map(d => <i key={d.key} style={{ width: `${d.pct}%`, background: d.color }} title={`${d.label}: ${d.pct.toFixed(0)} %`} />)}
              </div>
              <ul>
                {dist.filter(d => d.pct >= 0.5).map(d => <li key={d.key}><i style={{ background: d.color }} /><span>{d.label}</span><b>{d.pct.toFixed(0)} %</b>{d.ha != null && <small>≈ {d.ha.toLocaleString('es', { maximumFractionDigits: 2 })} ha</small>}</li>)}
              </ul>
            </div>}
            <p className="av-foot"><Info size={14} />Orientativo: el NDVI mide el verdor, no la causa. Usa las zonas de menor vigor para decidir dónde revisar en campo.</p>
          </> : <div className="nv-nodata">
            <strong>Sin imagen útil este día</strong>
            <p>Las nubes impidieron ver la parcela.{latestUsable ? <> La última imagen clara es del <button type="button" className="av-link" onClick={() => setSelected(latestUsable.id)}>{dateLabel(latestUsable.from_date)}</button>.</> : ''}</p>
          </div>}
        </article>
      </div>

      <section className="card nv-timeline">
        <div className="av-days-head">
          <h2>Evolución</h2>
          <span className="av-legend"><i className="av-dot good" />Imagen clara <i className="av-dot caution" />Nubes parciales <i className="av-dot bad" />Nublado</span>
        </div>
        <Timeline items={timeline} selected={obs?.id} onSelect={setSelected} />
      </section>

      <details className="card nv-tech">
        <summary>Detalles técnicos de esta imagen</summary>
        <div className="nv-tech-body">
          <dl>
            <div><dt>NDVI mínimo</dt><dd>{n3(obs?.ndvi_min)}</dd></div>
            <div><dt>NDVI máximo</dt><dd>{n3(obs?.ndvi_max)}</dd></div>
            <div><dt>Mediana</dt><dd>{n3(obs?.ndvi_median)}</dd></div>
            <div><dt>Desviación estándar</dt><dd>{n3(obs?.ndvi_stddev)}</dd></div>
            <div><dt>Cobertura válida</dt><dd>{obs?.valid_fraction != null ? `${(Number(obs.valid_fraction) * 100).toFixed(0)} %` : '—'}</dd></div>
            <div><dt>Ventana</dt><dd>{obs ? `${obs.from_date} → ${obs.to_date}` : '—'}</dd></div>
          </dl>
          <p>NDVI = (infrarrojo cercano − rojo) / (infrarrojo cercano + rojo), con las bandas B08 y B04 de Sentinel-2 L2A (programa Copernicus). La cobertura válida indica qué parte de los píxeles disponibles no estaba cubierta por nubes o sombras. Las superficies son aproximadas: los píxeles del borde pueden hacer que difieran de la superficie de la parcela. En vegetación muy densa el índice puede saturarse.</p>
        </div>
      </details>
    </>}
  </section>;
}

function Timeline({ items, selected, onSelect }: { items: Obs[]; selected?: string; onSelect: (id: string) => void }) {
  const W = 760, H = 200, pad = { l: 36, r: 12, t: 14, b: 46 };
  if (!items.length) return null;
  const x = (i: number) => pad.l + (items.length === 1 ? (W - pad.l - pad.r) / 2 : i * (W - pad.l - pad.r) / (items.length - 1));
  const y = (v: number) => pad.t + (1 - Math.max(0, Math.min(1, v))) * (H - pad.t - pad.b);
  const pts = items.map((o, i) => ({ o, i })).filter(({ o }) => usable(o));
  const path = pts.map(({ o, i }, k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(Number(o.ndvi_mean)).toFixed(1)}`).join(' ');
  const labelEvery = Math.max(1, Math.ceil(items.length / 8));
  return <div className="nv-chart">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evolución del NDVI medio por fecha">
      <text x={pad.l - 8} y={H - pad.b + 18} textAnchor="end" className="nv-axis">nub.</text>
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => <g key={v}><line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="nv-grid" /><text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="nv-axis">{v.toFixed(1)}</text></g>)}
      <path d={path} className="nv-line" />
      {items.map((o, i) => {
        const active = o.id === selected;
        if (!usable(o)) return <g key={o.id} className="nv-cloud" onClick={() => onSelect(o.id)}><title>{`${dateLabel(o.from_date)}: nublado, sin imagen útil`}</title><circle cx={x(i)} cy={H - pad.b + 14} r={active ? 6 : 4} /></g>;
        return <g key={o.id} onClick={() => onSelect(o.id)} className={`nv-point ${o.quality === 'valid' ? 'good' : 'caution'} ${active ? 'is-active' : ''}`}>
          <title>{`${dateLabel(o.from_date)}: NDVI ${n3(o.ndvi_mean)} · ${quality[o.quality]?.label || ''}`}</title>
          <circle cx={x(i)} cy={y(Number(o.ndvi_mean))} r={active ? 7 : 5} />
        </g>;
      })}
      {items.map((o, i) => (i % labelEvery === 0 || i === items.length - 1) ? <text key={'l' + o.id} x={x(i)} y={H - 6} textAnchor="middle" className="nv-axis">{dateLabel(o.from_date)}</text> : null)}
    </svg>
    <div className="nv-chips" role="group" aria-label="Elegir fecha">
      {[...items].reverse().map(o => <button key={o.id} type="button" aria-pressed={o.id === selected} className={`nv-date ${quality[o.quality]?.tone || ''}`} onClick={() => onSelect(o.id)}>
        <i />{dateLabel(o.from_date)}{usable(o) ? <b>{n3(o.ndvi_mean)}</b> : <small>nublado</small>}
      </button>)}
    </div>
  </div>;
}
