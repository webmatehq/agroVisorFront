import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, useLocation } from 'react-router-dom';
import { api, list } from './api';
import { ArrowUpRight, Chat, DroneSymbol, Info } from './Icons';
import { dateLabel } from './NdviView';

/** Drone service WhatsApp (same contact as the public site's drone service). */
const SERVICE_WHATSAPP = '5491168998095';

const services = ['Fumigación / tratamiento', 'Aplicación de abono', 'Siembra aérea'] as const;

export function ServicesView({ farmName, parcel }: { farmName?: string; parcel?: any }) {
  const location = useLocation();
  const isHistory = location.pathname.endsWith('/historial');
  const [service, setService] = useState<string>(services[0]);
  const [when, setWhen] = useState('');
  const [notes, setNotes] = useState('');
  const id = parcel?.id;
  const events = useQuery({ queryKey: ['services', id], queryFn: () => api(`/events?parcel_id=${id}&type=treatment&limit=100`), enabled: !!id });
  const rows = useMemo(() => list(events.data).filter(x => x.type === 'treatment').sort((a, b) => String(b.event_date).localeCompare(String(a.event_date))), [events.data]);

  if (!id) return <section className="card av-empty">Selecciona una finca y una parcela en la barra superior para solicitar o consultar servicios.</section>;

  const area = parcel.area_ha != null ? `${Number(parcel.area_ha).toLocaleString('es', { maximumFractionDigits: 2 })} ha` : null;
  const coords = parcel.latitude != null && parcel.longitude != null ? `${Number(parcel.latitude).toFixed(5)}, ${Number(parcel.longitude).toFixed(5)}` : null;
  const message = [
    `Hola, quiero solicitar un servicio de ${service.toLowerCase()} con drones.`,
    `Parcela: ${parcel.name}${farmName ? ` (finca ${farmName})` : ''}${area ? ` · ${area}` : ''}.`,
    coords ? `Ubicación: https://maps.google.com/?q=${coords.replace(' ', '')}` : '',
    when ? `Fecha preferida: ${dateLabel(when, true)}.` : '',
    notes.trim() ? `Detalles: ${notes.trim()}` : '',
  ].filter(Boolean).join('\n');

  return <section className="av sv">
    <header className="av-head">
      <div>
        <h1>{isHistory ? 'Historial de servicios' : 'Servicios con drones'}</h1>
        <p>{parcel.name}{farmName ? ` · ${farmName}` : ''}{area ? ` · ${area}` : ''}</p>
      </div>
    </header>

    {!isHistory && <div className="sv-top">
      <article className="card sv-request">
        <div className="sv-request-head"><span className="lp-icon"><DroneSymbol size={22} /></span><div><h2>Solicitar un servicio</h2><p>Prepara tu solicitud y envíala por WhatsApp con los datos de la parcela.</p></div></div>
        <fieldset className="nb-type sv-type">
          <legend>Servicio</legend>
          <div>{services.map(s => <label key={s} className={service === s ? 'is-on' : ''}><input type="radio" name="service" value={s} checked={service === s} onChange={() => setService(s)} />{s}</label>)}</div>
        </fieldset>
        <div className="nb-grid">
          <label>Fecha preferida <small>(opcional)</small><input type="date" value={when} min={new Date().toISOString().slice(0, 10)} onChange={e => setWhen(e.target.value)} /></label>
          <label className="nb-wide">Detalles <small>(opcional)</small><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Cultivo, producto si ya lo tienes, zonas a tratar…" /></label>
        </div>
        <div className="sv-preview" aria-label="Mensaje que se enviará">
          <span className="av-label">Mensaje</span>
          <pre>{message}</pre>
        </div>
        <a className="button sv-send" href={`https://wa.me/${SERVICE_WHATSAPP}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer"><Chat size={18} />Enviar por WhatsApp <ArrowUpRight size={16} /></a>
      </article>

      <article className="card sv-info">
        <span className="av-label">Último servicio</span>
        {events.isPending ? <p className="ov-muted">Cargando…</p> : rows[0] ? <>
          <strong className="ov-big">{dateLabel(rows[0].event_date, true)}</strong>
          <p>{rows[0].product || 'Fumigación'}{rows[0].dose != null ? ` · ${String(rows[0].dose).replace('.', ',')} ${rows[0].unit || ''}` : ''}</p>
          <p className="ov-muted">{rows.length} {rows.length === 1 ? 'servicio registrado' : 'servicios registrados'} en esta parcela</p>
        </> : <>
          <strong className="ov-big ov-none">Ninguno todavía</strong>
          <p className="ov-muted">Los tratamientos que registres en el cuaderno aparecerán aquí.</p>
        </>}
        <NavLink className="av-link" to="/servicios/historial">Ver historial</NavLink>
        <p className="av-foot"><Info size={14} />Para tratamientos, consulta en Meteorología los días favorables: con lluvia o viento fuerte el trabajo puede tener que reprogramarse.</p>
      </article>
    </div>}

    {(isHistory || rows.length > 0) && <section className="card sv-history">
      <div className="av-days-head"><h2>Tratamientos registrados</h2><NavLink className="av-link" to="/cuaderno?nueva=1">Registrar un tratamiento</NavLink></div>
      {events.isPending ? <p className="ov-muted">Cargando…</p> : rows.length ? <ul className="ov-labors">
        {rows.map(x => <li key={x.id}><span className="tag">{dateLabel(x.event_date, true)}</span><span className="ov-labor-text">{x.product || 'Fumigación'}{x.dose != null ? ` · ${String(x.dose).replace('.', ',')} ${x.unit || ''}` : ''}{x.notes ? ` — ${x.notes}` : ''}</span></li>)}
      </ul> : <p className="ov-muted">No hay tratamientos registrados en esta parcela. Cuando registres uno en el cuaderno aparecerá aquí.</p>}
    </section>}
  </section>;
}
