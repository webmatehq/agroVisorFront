import { useState } from 'react';

const activities = [
  { name: 'Riego por goteo', date: '06 nov', time: '07:30', status: 'Completada', detail: 'Riego del sector este. Revisados los goteros y la presión al finalizar.', value: 'Agua aplicada · 18 mm' },
  { name: 'Revisión del cultivo', date: '05 nov', time: '09:15', status: 'Completada', detail: 'Recorrido por las zonas de menor vigor. Seguimiento registrado para la próxima visita.', value: 'Recorrido · 4 puntos' },
  { name: 'Revisión del riego', date: '08 nov', time: '08:00', status: 'Planificada', detail: 'Comprobar la humedad del suelo y revisar el programa de riego del sector este.', value: 'Sector · Este' },
];
export function ActivitiesPreview() {
  const [selected, setSelected] = useState(0);
  const activity = activities[selected];
  return <section className="activities-preview" aria-label="Cuaderno de campo de demostración">
    <div className="activities-heading"><div><span>CUADERNO DE CAMPO</span><h3>Maíz</h3></div><span className="activities-season">Campaña 2026</span></div>
    <div className="activities-summary"><div><strong>12,4 <small>ha</small></strong><span>Superficie</span></div><div><strong>2</strong><span>Labores completadas</span></div><div><strong>1</strong><span>Próxima actividad</span></div></div>
    <div className="activities-list-heading"><h4>Actividad de la parcela</h4><span>Noviembre</span></div>
    <div className="activities-list" role="group" aria-label="Selecciona una labor">
      {activities.map((item, i) => <button key={item.name} type="button" aria-pressed={selected === i} onClick={() => setSelected(i)}>
        <span className="activities-date">{item.date}<small>{item.time}</small></span>
        <span className="activities-name"><strong>{item.name}</strong><small>Maíz · 12,4 ha</small></span>
        <span className={item.status === 'Completada' ? 'activities-status completed' : 'activities-status planned'}>{item.status}</span>
      </button>)}
    </div>
    <div className="activities-detail" aria-live="polite">
      <div className="activities-detail-heading"><strong>{activity.name}</strong><span>{activity.value}</span></div>
      <p>{activity.detail}</p>
      <span className="activities-detail-footer">Registro · {activity.date} 2026 · {activity.time}</span>
    </div>
  </section>;
}
