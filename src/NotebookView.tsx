import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, exportEvents, list } from './api';
import { ArrowDown, Close, Droplet, DroneSymbol, IndexSymbol, NotebookSymbol, ParcelSymbol, WeatherSymbol } from './Icons';
import { dateLabel } from './NdviView';

const types = [
  { value: 'irrigation', label: 'Riego', Icon: Droplet, tone: 'blue', product: 'Ej. agua de pozo', dose: 'Ej. 18', unit: 'Ej. mm' },
  { value: 'fertilization', label: 'Fertilización', Icon: ParcelSymbol, tone: 'amber', product: 'Ej. urea 46 %', dose: 'Ej. 120', unit: 'Ej. kg/ha' },
  { value: 'treatment', label: 'Fumigación / tratamiento', Icon: DroneSymbol, tone: 'red', product: 'Ej. fungicida', dose: 'Ej. 1,5', unit: 'Ej. L/ha' },
  { value: 'inspection', label: 'Inspección', Icon: IndexSymbol, tone: 'green', product: '', dose: '', unit: '' },
  { value: 'harvest', label: 'Cosecha', Icon: WeatherSymbol, tone: 'olive', product: 'Ej. maíz grano', dose: 'Ej. 8', unit: 'Ej. t/ha' },
  { value: 'note', label: 'Nota', Icon: NotebookSymbol, tone: 'slate', product: '', dose: '', unit: '' },
] as const;
const typeOf = (v: string) => types.find(t => t.value === v) || types[types.length - 1];
const todayIso = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const monthLabel = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });

export function NotebookView({ org, parcel, parcelName, farmName, writable }: { org: string; parcel: string; parcelName?: string; farmName?: string; writable: boolean }) {
  const q = useQueryClient();
  const location = useLocation(), navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setPage(1); }, [parcel, filter]);
  useEffect(() => {
    if (new URLSearchParams(location.search).has('nueva') && writable) { setEditing(null); setOpen(true); navigate('/cuaderno', { replace: true }); }
  }, [location.search, writable, navigate]);

  const rows = useQuery({
    queryKey: ['events', parcel, page, filter],
    queryFn: () => api(`/events?parcel_id=${parcel}&page=${page}&limit=20${filter ? '&type=' + filter : ''}`),
    enabled: !!parcel,
  });
  if (!parcel) return <section className="card av-empty">Selecciona una parcela en la barra superior para ver su cuaderno.</section>;
  const items = list(rows.data);
  const groups: [string, any[]][] = [];
  for (const e of items) { const m = monthLabel(e.event_date); const g = groups.find(([k]) => k === m); g ? g[1].push(e) : groups.push([m, [e]]); }

  const remove = async (e: any) => {
    if (!window.confirm(`¿Eliminar el registro de ${typeOf(e.type).label.toLowerCase()} del ${dateLabel(e.event_date, true)}? No se puede deshacer.`)) return;
    try { await api('/events/' + e.id, 'DELETE'); await q.invalidateQueries({ queryKey: ['events'] }); await q.invalidateQueries({ queryKey: ['dashboard-events'] }); }
    catch (err) { setError((err as Error).message); }
  };

  return <section className="av nb">
    <header className="av-head">
      <div>
        <h1>Cuaderno de campo</h1>
        <p>{parcelName || 'Parcela'}{farmName ? ` · ${farmName}` : ''} · Labores y observaciones de la parcela</p>
      </div>
      <div className="av-head-actions">
        <button type="button" className="button secondary" onClick={() => exportEvents(parcel, org).catch(e => setError(e.message))}><ArrowDown size={16} />Exportar CSV</button>
        {writable && <button type="button" className="button" onClick={() => { setEditing(null); setOpen(true); }}>Registrar labor</button>}
      </div>
    </header>

    <div className="nb-filters" role="group" aria-label="Filtrar por tipo de labor">
      <button type="button" aria-pressed={filter === ''} onClick={() => setFilter('')}>Todas</button>
      {types.map(t => <button key={t.value} type="button" aria-pressed={filter === t.value} onClick={() => setFilter(t.value)}><i className={`nb-swatch ${t.tone}`} />{t.label}</button>)}
    </div>

    {(rows.error || error) && <p role="alert" className="error">{error || (rows.error as Error).message}</p>}

    {rows.isPending ? <div className="av-skeleton" aria-busy="true" aria-label="Cargando labores" /> : !items.length ? (
      <section className="card nb-empty">
        <NotebookSymbol size={32} />
        <h2>{filter ? `No hay registros de ${typeOf(filter).label.toLowerCase()}` : 'Tu cuaderno está vacío'}</h2>
        <p>{filter ? 'Prueba con otro tipo de labor o registra una nueva.' : 'Anota cada riego, tratamiento, abonado o visita. Tendrás el historial de la parcela ordenado por fecha y podrás exportarlo.'}</p>
        {writable && <button type="button" className="button" onClick={() => { setEditing(null); setOpen(true); }}>Registrar la primera labor</button>}
      </section>
    ) : <div className="nb-groups">
      {groups.map(([month, entries]) => <section key={month} className="nb-group">
        <h2 className="nb-month">{month}</h2>
        <ul className="nb-list">
          {entries.map(e => { const t = typeOf(e.type); return <li key={e.id} className="card nb-item">
            <span className={`nb-icon ${t.tone}`}><t.Icon size={20} /></span>
            <div className="nb-body">
              <div className="nb-top"><b>{t.label}</b><time>{dateLabel(e.event_date, true)}</time></div>
              {e.notes && <p>{e.notes}</p>}
              {(e.product || e.dose != null || e.cost_usd != null) && <div className="nb-meta">
                {e.product && <span>{e.product}</span>}
                {e.dose != null && <span>{String(e.dose).replace('.', ',')} {e.unit || ''}</span>}
                {e.cost_usd != null && Number(e.cost_usd) > 0 && <span>{Number(e.cost_usd).toLocaleString('es', { style: 'currency', currency: 'USD' })}</span>}
              </div>}
            </div>
            {writable && <div className="nb-actions">
              <button type="button" className="av-link" onClick={() => { setEditing(e); setOpen(true); }}>Editar</button>
              <button type="button" className="av-link nb-danger" onClick={() => remove(e)}>Eliminar</button>
            </div>}
          </li>; })}
        </ul>
      </section>)}
      {(page > 1 || items.length === 20) && <div className="nb-pager">
        <button type="button" className="button secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Más recientes</button>
        <span>Página {page}</span>
        <button type="button" className="button secondary" disabled={items.length < 20} onClick={() => setPage(page + 1)}>Más antiguas</button>
      </div>}
    </div>}

    {writable && open && <LaborDialog org={org} parcel={parcel} parcelName={parcelName} editing={editing} onClose={() => setOpen(false)} onSaved={async () => {
      setOpen(false);
      await q.invalidateQueries({ queryKey: ['events'] });
      await q.invalidateQueries({ queryKey: ['dashboard-events'] });
      await q.invalidateQueries({ queryKey: ['services'] });
    }} />}
  </section>;
}

function LaborDialog({ org, parcel, parcelName, editing, onClose, onSaved }: { org: string; parcel: string; parcelName?: string; editing: any | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [type, setType] = useState<string>(editing?.type || 'inspection');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { ref.current?.showModal(); }, []);
  const t = typeOf(type);
  return <dialog ref={ref} className="nb-dialog" onCancel={e => { e.preventDefault(); onClose(); }} aria-labelledby="nb-dialog-title">
    <form onSubmit={async ev => {
      ev.preventDefault(); setBusy(true); setError('');
      const f = new FormData(ev.currentTarget);
      const body: Record<string, unknown> = { type };
      for (const [k, v] of f.entries()) if (!k.startsWith('__') && String(v).trim() !== '') body[k] = String(v).trim();
      if (editing) for (const k of ['product', 'dose', 'unit', 'cost_usd']) if (body[k] === undefined) body[k] = null;
      if (body.dose != null) body.dose = Number(String(body.dose).replace(',', '.'));
      if (body.cost_usd != null) body.cost_usd = Number(String(body.cost_usd).replace(',', '.'));
      try {
        await api('/events' + (editing ? '/' + editing.id : ''), editing ? 'PATCH' : 'POST', { ...body, ...(!editing ? { organization_id: org, parcel_id: parcel } : {}) });
        await onSaved();
      } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    }}>
      <div className="nb-dialog-head">
        <div><h2 id="nb-dialog-title">{editing ? 'Editar labor' : 'Registrar labor'}</h2><p>{parcelName || 'Parcela seleccionada'}</p></div>
        <button type="button" className="av-icon-btn" onClick={onClose} aria-label="Cerrar"><Close size={18} /></button>
      </div>
      <fieldset className="nb-type">
        <legend>¿Qué hiciste?</legend>
        <div>{types.map(x => <label key={x.value} className={type === x.value ? 'is-on' : ''}>
          <input type="radio" name="__type" value={x.value} checked={type === x.value} onChange={() => setType(x.value)} />
          <x.Icon size={18} />{x.label}
        </label>)}</div>
      </fieldset>
      <div className="nb-grid">
        <label>Fecha<input type="date" name="event_date" defaultValue={editing?.event_date || todayIso()} max={todayIso()} required /></label>
        <label className="nb-wide">Observaciones<textarea name="notes" defaultValue={editing?.notes || ''} placeholder={type === 'inspection' ? 'Ej. Zona oeste con hojas amarillas; revisar en 7 días.' : '¿Qué hiciste y en qué zona de la parcela?'} required /></label>
        {t.product !== '' && <>
          <label>Producto <small>(opcional)</small><input name="product" defaultValue={editing?.product || ''} placeholder={t.product} /></label>
          <div className="nb-dose">
            <label>Dosis <small>(opcional)</small><input name="dose" inputMode="decimal" defaultValue={editing?.dose ?? ''} placeholder={t.dose} /></label>
            <label>Unidad<input name="unit" defaultValue={editing?.unit || ''} placeholder={t.unit} /></label>
          </div>
        </>}
        <label>Coste total en USD <small>(opcional)</small><input name="cost_usd" inputMode="decimal" defaultValue={editing?.cost_usd ? String(editing.cost_usd) : ''} placeholder="Ej. 45" /></label>
      </div>
      {error && <p role="alert" className="error">{error}</p>}
      <div className="nb-dialog-actions">
        <button type="button" className="button secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="button" disabled={busy}>{busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Guardar labor'}</button>
      </div>
    </form>
  </dialog>;
}
