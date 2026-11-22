import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { Cloud, CloudSun, Drizzle, Droplet, Fog, Info, Rain, Refresh, Snow, Storm, Sun, Wind } from './Icons';

export type Day = { date: string; max?: number; min?: number; rain?: number; prob?: number; code?: number; wind?: number };

/** WMO weather_code → plain Spanish label and glyph. */
export function weatherKind(code?: number | null) {
  if (code == null) return { label: 'Sin dato', Icon: Cloud };
  if (code === 0) return { label: 'Despejado', Icon: Sun };
  if (code <= 2) return { label: 'Parcialmente nublado', Icon: CloudSun };
  if (code === 3) return { label: 'Nublado', Icon: Cloud };
  if (code === 45 || code === 48) return { label: 'Niebla', Icon: Fog };
  if (code >= 51 && code <= 57) return { label: 'Llovizna', Icon: Drizzle };
  if (code >= 61 && code <= 67) return { label: code <= 61 ? 'Lluvia débil' : code === 63 ? 'Lluvia' : 'Lluvia fuerte', Icon: Rain };
  if (code >= 71 && code <= 77) return { label: 'Nieve', Icon: Snow };
  if (code >= 80 && code <= 82) return { label: 'Chubascos', Icon: Rain };
  if (code >= 85 && code <= 86) return { label: 'Chubascos de nieve', Icon: Snow };
  if (code >= 95) return { label: 'Tormenta', Icon: Storm };
  return { label: 'Variable', Icon: CloudSun };
}

const num = (v: unknown) => (v == null || Number.isNaN(Number(v)) ? undefined : Number(v));
const fmt = (v: number | undefined, digits = 0) => (v == null ? '—' : v.toLocaleString('es', { minimumFractionDigits: digits, maximumFractionDigits: digits }));
const day = (iso: string) => new Date(iso + 'T12:00:00');
const weekday = (iso: string) => day(iso).toLocaleDateString('es-EC', { weekday: 'short' }).replace('.', '');
const shortDate = (iso: string) => day(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' }).replace('.', '');

/**
 * Orientative work window for field treatments (spraying, drone jobs): dry and calm.
 * Thresholds are deliberately conservative and shown as guidance, not as an instruction.
 */
export function workWindow(d: Day): { level: 'good' | 'caution' | 'bad'; label: string } {
  const rain = d.rain ?? 0, prob = d.prob ?? 0, wind = d.wind;
  if (rain >= 3 || prob >= 70 || (wind != null && wind > 20)) return { level: 'bad', label: 'Desfavorable' };
  if (rain >= 1 || prob >= 40 || (wind != null && wind > 15)) return { level: 'caution', label: 'Con precaución' };
  return { level: 'good', label: 'Favorable' };
}

const periods = [
  { value: 0, label: 'Próximos 7 días' },
  { value: 15, label: 'Últimos 15 días' },
  { value: 30, label: 'Últimos 30 días' },
];

export function WeatherView({ parcel, parcelName }: { parcel: string; parcelName?: string }) {
  const [period, setPeriod] = useState(0);
  const r = useQuery({
    queryKey: ['weather', parcel, period],
    queryFn: () => api(`/parcels/${parcel}/weather?past_days=${period}`),
    enabled: !!parcel,
  });
  if (!parcel) return <section className="card av-empty">Selecciona una parcela en la barra superior para ver su meteorología.</section>;

  const snapshot = r.data?.data, data = snapshot?.payload, daily = data?.daily, current = data?.current;
  const today = current?.time?.slice(0, 10);
  const days: Day[] = (daily?.time || []).map((date: string, i: number) => ({
    date,
    max: num(daily.temperature_2m_max?.[i]), min: num(daily.temperature_2m_min?.[i]),
    rain: num(daily.precipitation_sum?.[i]), prob: num(daily.precipitation_probability_max?.[i]),
    code: num(daily.weather_code?.[i]), wind: num(daily.wind_speed_10m_max?.[i]),
  })).filter((d: Day) => !today ? true : period ? d.date < today : d.date >= today);

  const updated = snapshot?.fetched_at ? new Date(snapshot.fetched_at).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }) : null;
  const totalRain = days.reduce((s, d) => s + (d.rain ?? 0), 0);
  const lows = days.map(d => d.min).filter((v): v is number => v != null), highs = days.map(d => d.max).filter((v): v is number => v != null);
  const weekMin = lows.length ? Math.min(...lows) : 0, weekMax = highs.length ? Math.max(...highs) : 1;
  const span = Math.max(1, weekMax - weekMin);
  const now = weatherKind(num(current?.weather_code));

  return <section className="av">
    <header className="av-head">
      <div>
        <h1>Meteorología</h1>
        <p>{parcelName ? `${parcelName} · ` : ''}Datos modelados para la ubicación de la parcela</p>
      </div>
      <div className="av-head-actions">
        <div className="av-tabs" role="tablist" aria-label="Período">
          {periods.map(p => <button key={p.value} type="button" role="tab" aria-selected={period === p.value} onClick={() => setPeriod(p.value)}>{p.label}</button>)}
        </div>
        <button type="button" className="av-icon-btn" onClick={() => r.refetch()} disabled={r.isFetching} aria-label="Volver a consultar la previsión" title="Volver a consultar">
          <Refresh size={18} className={r.isFetching ? 'av-spin' : undefined} />
        </button>
      </div>
    </header>

    {r.error ? <p role="alert" className="error">{(r.error as Error).message}</p> : null}
    {r.data?.status === 'stale' && <p className="av-note av-note-warn" role="status"><Info size={16} />El proveedor no respondió; se muestran los últimos datos guardados{updated ? ` (${updated})` : ''}.</p>}

    {r.isPending ? <div className="av-skeleton" aria-busy="true" aria-label="Consultando la previsión" /> : !days.length ? (
      <section className="card av-empty">No hay datos meteorológicos para este período. Prueba a volver a consultar en unos minutos.</section>
    ) : period === 0 ? <>
      <div className="av-now-row">
        <article className="card av-now">
          <div className="av-now-main">
            <now.Icon size={56} />
            <div>
              <span className="av-label">Ahora{updated ? ` · actualizado ${updated}` : ''}</span>
              <strong className="av-now-temp">{fmt(num(current?.temperature_2m))}<small>°C</small></strong>
              <span className="av-now-kind">{now.label}</span>
            </div>
          </div>
          <dl className="av-now-metrics">
            <div><dt><Droplet size={16} />Humedad</dt><dd>{fmt(num(current?.relative_humidity_2m))} %</dd></div>
            <div><dt><Wind size={16} />Viento</dt><dd>{fmt(num(current?.wind_speed_10m))} km/h</dd></div>
            <div><dt><Rain size={16} />Lluvia ahora</dt><dd>{fmt(num(current?.precipitation), 1)} mm</dd></div>
          </dl>
        </article>
        <article className="card av-summary">
          <span className="av-label">Resumen de la semana</span>
          <p className="av-summary-big"><strong>{fmt(totalRain, 1)} mm</strong> de lluvia prevista</p>
          <ul>
            {(() => { const dry = [...days].sort((a, b) => (a.rain ?? 0) - (b.rain ?? 0))[0]; return dry ? <li>Día más seco: <b>{dry.date === days[0].date ? 'hoy' : `${weekday(dry.date)} ${shortDate(dry.date)}`}</b> ({fmt(dry.rain, 1)} mm)</li> : null; })()}
            <li>Temperaturas entre <b>{fmt(weekMin)}°</b> y <b>{fmt(weekMax)}°</b></li>
            <li>Días favorables para tratamientos: <b>{days.filter(d => workWindow(d).level === 'good').length} de {days.length}</b></li>
          </ul>
        </article>
      </div>

      <section className="card av-days" aria-label="Pronóstico diario">
        <div className="av-days-head">
          <h2>Próximos días</h2>
          <span className="av-legend"><i className="av-dot good" />Favorable <i className="av-dot caution" />Con precaución <i className="av-dot bad" />Desfavorable</span>
        </div>
        <ol className="av-day-list">
          {days.map((d, i) => {
            const k = weatherKind(d.code), w = workWindow(d);
            const left = ((d.min ?? weekMin) - weekMin) / span * 100, width = Math.max(4, ((d.max ?? weekMax) - (d.min ?? weekMin)) / span * 100);
            return <li key={d.date} className="av-day">
              <span className="av-day-name"><b>{i === 0 ? 'Hoy' : weekday(d.date)}</b><small>{shortDate(d.date)}</small></span>
              <span className="av-day-kind" title={k.label}><k.Icon size={26} /><small>{k.label}</small></span>
              <span className="av-day-temp"><small>{fmt(d.min)}°</small><span className="av-range"><i style={{ left: `${left}%`, width: `${width}%` }} /></span><b>{fmt(d.max)}°</b></span>
              <span className="av-day-rain"><b>{fmt(d.rain, 1)} mm</b><small>{d.prob != null ? `${fmt(d.prob)} % prob.` : ''}</small></span>
              <span className="av-day-wind">{d.wind != null ? <><Wind size={15} />{fmt(d.wind)} km/h</> : <small>—</small>}</span>
              <span className={`av-chip ${w.level}`}>{w.label}</span>
            </li>;
          })}
        </ol>
        <p className="av-foot"><Info size={14} />La ventana para tratamientos es orientativa: combina lluvia, probabilidad de lluvia y viento máximo. Confírmala en campo y con las indicaciones de cada producto.</p>
      </section>
    </> : <History days={days} />}

    <p className="av-source">Fuente: Open-Meteo · modelo meteorológico para una celda cercana a la parcela, no una estación en el terreno{snapshot?.timezone ? ` · Zona horaria ${snapshot.timezone}` : ''}.</p>
  </section>;
}

function History({ days }: { days: Day[] }) {
  const [table, setTable] = useState(false);
  const total = days.reduce((s, d) => s + (d.rain ?? 0), 0);
  const rainy = days.filter(d => (d.rain ?? 0) >= 1).length;
  const avg = (vals: (number | undefined)[]) => { const v = vals.filter((x): x is number => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : undefined; };
  const maxRain = Math.max(1, ...days.map(d => d.rain ?? 0));
  return <>
    <div className="av-stats">
      <article className="card"><span className="av-label">Lluvia acumulada</span><strong>{fmt(total, 1)} mm</strong></article>
      <article className="card"><span className="av-label">Días con lluvia (≥ 1 mm)</span><strong>{rainy} de {days.length}</strong></article>
      <article className="card"><span className="av-label">Máxima media</span><strong>{fmt(avg(days.map(d => d.max)), 1)}°</strong></article>
      <article className="card"><span className="av-label">Mínima media</span><strong>{fmt(avg(days.map(d => d.min)), 1)}°</strong></article>
    </div>
    <section className="card av-history">
      <div className="av-days-head"><h2>Lluvia diaria</h2><button type="button" className="av-link" onClick={() => setTable(!table)}>{table ? 'Ver gráfico' : 'Ver tabla'}</button></div>
      {!table ? <div className="av-bars" role="img" aria-label={`Lluvia diaria: total ${fmt(total, 1)} milímetros en ${days.length} días`}>
        {days.map(d => <div key={d.date} className="av-bar" title={`${shortDate(d.date)}: ${fmt(d.rain, 1)} mm · ${fmt(d.min)}°–${fmt(d.max)}°`}>
          <span className="av-bar-value">{(d.rain ?? 0) >= 1 ? fmt(d.rain, 0) : ''}</span>
          <i style={{ height: `${Math.max(2, (d.rain ?? 0) / maxRain * 100)}%` }} />
          <small>{day(d.date).getDate()}</small>
        </div>)}
      </div> : <div className="table-scroll"><table>
        <thead><tr><th>Día</th><th>Tiempo</th><th>Mínima</th><th>Máxima</th><th>Lluvia</th></tr></thead>
        <tbody>{days.map(d => <tr key={d.date}><td>{weekday(d.date)} {shortDate(d.date)}</td><td>{weatherKind(d.code).label}</td><td>{fmt(d.min, 1)} °C</td><td>{fmt(d.max, 1)} °C</td><td>{fmt(d.rain, 1)} mm</td></tr>)}</tbody>
      </table></div>}
      <p className="av-foot"><Info size={14} />Estimaciones históricas del modelo; no son mediciones de una estación.</p>
    </section>
  </>;
}
