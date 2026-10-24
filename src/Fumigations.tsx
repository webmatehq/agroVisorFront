import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { api, list } from "./api";

type Props = { organizationId: string; farmId: string; farmName?: string; parcelId: string; parcelName?: string; geometry?: any; writable: boolean };
export function Fumigations({ farmId, farmName, parcelId, parcelName }: Props) {
  const location = useLocation();
  const isHistory = location.pathname.endsWith("/historial");
  const events = useQuery({ queryKey: ["services", parcelId], queryFn: () => api(`/events?parcel_id=${parcelId}&limit=100`), enabled: !!parcelId });
  const rows = useMemo(() => list(events.data).filter(x => x.type === "treatment").sort((a, b) => String(b.event_date).localeCompare(String(a.event_date))), [events.data]);
  const last = rows[0], previous = rows[1];
  const whatsappMessage = encodeURIComponent(`Hola, quiero solicitar un servicio para la parcela ${parcelName || parcelId} de la finca ${farmName || farmId}.`);

  if (!parcelId) return <section className="card"><h2>Servicios</h2><p>Selecciona una finca y una parcela para consultar o solicitar servicios.</p></section>;
  return <section className="card"><h2>Servicios</h2><p><strong>Finca:</strong> {farmName || farmId} · <strong>Parcela:</strong> {parcelName || parcelId}</p>
    {!isHistory && <><p>Solicita una fumigación o un servicio de abono directamente por WhatsApp.</p><a className="button service-whatsapp" href={`https://wa.me/34617435449?text=${whatsappMessage}`} target="_blank" rel="noreferrer">Solicitar por WhatsApp ↗</a>
      <div className="stats"><div><strong>{rows.length}</strong><small>Servicios registrados</small></div><div><strong>{last?.event_date || "—"}</strong><small>Último servicio</small></div><div><strong>{last?.product || "—"}</strong><small>Último servicio realizado</small></div></div>
      <div className="comparison"><article><h3>Servicio anterior</h3><p>{previous ? `${previous.event_date} · ${previous.product || "Servicio no indicado"}` : "No existe un servicio anterior registrado."}</p></article><article><h3>Servicio más reciente</h3><p>{last ? `${last.event_date} · ${last.product || "Servicio no indicado"}` : "Todavía no hay servicios registrados."}</p></article></div>
    </>}
    <h3>Historial de servicios</h3>{events.isPending ? <p>Cargando…</p> : rows.length ? <div className="table-scroll"><table><thead><tr><th>Día</th><th>Servicio</th><th>Cantidad</th><th>Unidad</th><th>Observaciones</th></tr></thead><tbody>{rows.map(x => <tr key={x.id}><td>{x.event_date}</td><td>{x.product || "Fumigación"}</td><td>{x.dose ?? "—"}</td><td>{x.unit || "—"}</td><td>{x.notes || "—"}</td></tr>)}</tbody></table></div> : <p className="empty">No hay servicios registrados para esta parcela.</p>}</section>;
}
