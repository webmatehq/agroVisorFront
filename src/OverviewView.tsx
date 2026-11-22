import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { api, list } from './api';
import { ParcelMap } from './Map';
import { ArrowRight, Info, NotebookSymbol, TrendDown, TrendUp } from './Icons';
import { classOf, dateLabel, n3, quality, usable } from './NdviView';
import { weatherKind, workWindow, type Day } from './WeatherView';

export const laborLabels: Record<string, string> = {
  irrigation: 'Riego', fertilization: 'Fertilización', treatment: 'Fumigación / tratamiento',
  inspection: 'Inspección', harvest: 'Cosecha', note: 'Nota',
};

const num = (v: unknown) => (v == null || Number.isNaN(Number(v)) ? undefined : Number(v));
const fmt = (v: number | undefined, d = 0) => (v == null ? '—' : v.toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d }));

export function OverviewView({ farm, parcel }: { farm?: any; parcel?: any }) {
  const [layer, setLayer] = useState<'ndvi' | 'rgb'>('ndvi');
  const id = parcel?.id;
  const ndvi = useQuery({ queryKey: ['dashboard-ndvi', id], queryFn: () => api(`/parcels/${id}/ndvi`), enabled: !!id });
  const weather = useQuery({ queryKey: ['weather', id, 0], queryFn: () => api(`/parcels/${id}/weather?past_days=0`), enabled: !!id });
  const events = useQuery({ queryKey: ['dashboard-events', id], queryFn: () => api(`/events?parcel_id=${id}&limit=4`), enabled: !!id });

  if (!id) return <section className="card av-empty"><h2>Elige o crea una parcela</h2><p>Selecciona una parcela en la barra superior o créala en <NavLink to="/gestion">Fincas y parcelas</NavLink>.</p></section>;

  const observations = list(ndvi.data);
  const obs = observations.find(usable);
  const prev = obs ? observations.slice(observations.indexOf(obs) + 1).find(usable) : undefined;
  const mean = obs?.ndvi_mean != null ? Number(obs.ndvi_mean) : null;
  const cls = mean != null ? classOf(mean) : null;
  const delta = mean != null && prev?.ndvi_mean != null ? mean - Number(prev.ndvi_mean) : null;
  const image = layer === 'ndvi' ? obs?.ndvi_raster_url : obs?.raster_url;

  const payload = weather.data?.data?.payload, daily = payload?.daily, today = payload?.current?.time?.slice(0, 10);
  const days: Day[] = (daily?.time || []).map((date: string, i: number) => ({
    date, max: num(daily.temperature_2m_max?.[i]), min: num(daily.temperature_2m_min?.[i]), rain: num(daily.precipitation_sum?.[i]),
    prob: num(daily.precipitation_probability_max?.[i]), code: num(daily.weather_code?.[i]), wind: num(daily.wind_speed_10m_max?.[i]),
  })).filter((d: Day) => !today || d.date >= today);
  const now = weatherKind(num(payload?.current?.weather_code));
  const rainWeek = days.reduce((s, d) => s + (d.rain ?? 0), 0);
  const goodDays = days.filter(d => workWindow(d).level === 'good').length;
  const labors = list(events.data);

  return <section className="av ov">
    <header className="av-head">
      <div>
        <h1>{parcel.name}</h1>
        <p>{farm?.name ? `${farm.name} · ` : ''}{parcel.area_ha != null ? `${fmt(Number(parcel.area_ha), 2)} ha` : 'Superficie sin calcular'}</p>
      </div>
      <div className="av-head-actions">
        <NavLink className="button secondary" to="/servicios/solicitar">Pedir servicio con drones</NavLink>
        <NavLink className="button" to="/cuaderno?nueva=1">Registrar labor</NavLink>
      </div>
    </header>

    <div className="ov-cards">
      <NavLink to="/ndvi" className="card ov-card">
        <span className="av-label">Vigor del cultivo</span>
        {ndvi.isPending ? <span className="ov-muted">Cargando…</span> : mean != null && cls ? <>
          <strong className="ov-big">{n3(mean)}</strong>
          <span className="nv-class"><i style={{ background: cls.color }} />{cls.label}</span>
          <span className="ov-muted">
            {delta != null && Math.abs(delta) >= 0.02 ? <>{delta > 0 ? <TrendUp size={14} /> : <TrendDown size={14} />} {delta > 0 ? '+' : '−'}{n3(Math.abs(delta))} · </> : delta != null ? 'Estable · ' : ''}
            Imagen del {dateLabel(obs.from_date)}{obs.quality !== 'valid' ? ` (${quality[obs.quality]?.label.toLowerCase()})` : ''}
          </span>
        </> : <><strong className="ov-big ov-none">Sin imágenes</strong><span className="ov-muted">Busca imágenes del satélite en Desarrollo.</span></>}
        <span className="ov-go">Ver desarrollo <ArrowRight size={14} /></span>
      </NavLink>

      <NavLink to="/clima" className="card ov-card">
        <span className="av-label">Tiempo esta semana</span>
        {weather.isPending ? <span className="ov-muted">Cargando…</span> : days.length ? <>
          <span className="ov-weather"><now.Icon size={34} /><strong className="ov-big">{fmt(num(payload?.current?.temperature_2m))}°</strong><span>{now.label}</span></span>
          <span className="ov-line"><b>{fmt(rainWeek, 1)} mm</b> de lluvia prevista</span>
          <span className="ov-muted">{goodDays ? `${goodDays} ${goodDays === 1 ? 'día favorable' : 'días favorables'} para tratamientos` : 'Ningún día favorable para tratamientos'}</span>
        </> : <span className="ov-muted">No hay previsión disponible.</span>}
        <span className="ov-go">Ver meteorología <ArrowRight size={14} /></span>
      </NavLink>

      <NavLink to="/cuaderno" className="card ov-card">
        <span className="av-label">Cuaderno de campo</span>
        {events.isPending ? <span className="ov-muted">Cargando…</span> : labors[0] ? <>
          <span className="ov-line"><NotebookSymbol size={16} /> Última labor: <b>{laborLabels[labors[0].type] || labors[0].type}</b></span>
          <span className="ov-muted">{dateLabel(labors[0].event_date, true)}{labors[0].notes ? ` · ${labors[0].notes}` : ''}</span>
        </> : <><strong className="ov-big ov-none">Sin labores</strong><span className="ov-muted">Registra riegos, tratamientos e inspecciones para tener el historial de la parcela.</span></>}
        <span className="ov-go">{labors[0] ? 'Abrir cuaderno' : 'Registrar la primera'} <ArrowRight size={14} /></span>
      </NavLink>
    </div>

    <div className="ov-main">
      <article className="card nv-map">
        <div className="nv-map-head">
          <div className="av-tabs" role="tablist" aria-label="Capa del mapa">
            <button type="button" role="tab" aria-selected={layer === 'ndvi'} onClick={() => setLayer('ndvi')}>Vigor (NDVI)</button>
            <button type="button" role="tab" aria-selected={layer === 'rgb'} onClick={() => setLayer('rgb')}>Imagen real</button>
          </div>
          <span className="av-label">{obs ? `Imagen del ${dateLabel(obs.from_date, true)}` : 'Sin imagen del satélite'}</span>
        </div>
        <ParcelMap geometry={parcel.geometry_geojson} overlay={image && obs?.bounds ? { url: image, bounds: [[obs.bounds[1], obs.bounds[0]], [obs.bounds[3], obs.bounds[2]]] } : undefined} />
        {layer === 'ndvi' && image && <div className="nv-legend"><span className="nv-ramp" /><span className="nv-legend-labels"><span>Menos vigor</span><span>Más vigor</span></span></div>}
      </article>

      <article className="card ov-side">
        <div className="av-days-head"><h2>Próximos días</h2><NavLink className="av-link" to="/clima">Detalle</NavLink></div>
        {days.length ? <ol className="ov-days">
          {days.slice(0, 5).map((d, i) => {
            const k = weatherKind(d.code), w = workWindow(d);
            return <li key={d.date}>
              <span className="ov-day-name">{i === 0 ? 'Hoy' : new Date(d.date + 'T12:00:00').toLocaleDateString('es-EC', { weekday: 'short' }).replace('.', '')}</span>
              <k.Icon size={20} />
              <span className="ov-day-temp">{fmt(d.max)}° <small>{fmt(d.min)}°</small></span>
              <span className="ov-day-rain">{fmt(d.rain, 1)} mm</span>
              <span className={`av-dot ${w.level}`} title={`Tratamientos: ${w.label}`} />
            </li>;
          })}
        </ol> : <p className="ov-muted">Sin previsión.</p>}
        <p className="av-foot"><Info size={14} />El punto indica si el día es favorable para tratamientos (orientativo).</p>

        <div className="av-days-head ov-labors-head"><h2>Últimas labores</h2><NavLink className="av-link" to="/cuaderno">Cuaderno</NavLink></div>
        {labors.length ? <ul className="ov-labors">
          {labors.map(e => <li key={e.id}><span className="tag">{laborLabels[e.type] || e.type}</span><span className="ov-labor-text">{e.notes || e.product || 'Sin observaciones'}</span><time>{dateLabel(e.event_date)}</time></li>)}
        </ul> : <p className="ov-muted">Todavía no hay labores registradas.</p>}
      </article>
    </div>
  </section>;
}
