import { useState } from 'react';

const views = [
  { id: 'cultivos', label: 'Cultivos', title: 'Observa cómo cambia tu cultivo', description: 'Localiza tus parcelas y consulta su evolución con imágenes e índices espectrales.' },
  { id: 'meteorologia', label: 'Meteorología', title: 'Planifica con la previsión a mano', description: 'Consulta temperatura, lluvia y viento para organizar el trabajo en tu finca.' },
  { id: 'labores', label: 'Labores', title: 'Cada trabajo, en su parcela', description: 'Registra las actividades y conserva un historial de lo que haces en el campo.' },
];

export function AppPreview() {
  const [selected, setSelected] = useState('cultivos');
  const view = views.find(item => item.id === selected)!;
  return <div className="app-preview">
    <div id="app-preview-panel" aria-live="polite">
      <div className="app-demo" role="img" aria-label={`Vista de demostración de ${view.label}, con datos de ejemplo`}>
        <div className="app-demo-header"><b>◈ SurcoVisor</b><span>Tu explotación, conectada</span></div>
        <div className="app-demo-context"><span>MI EXPLOTACIÓN</span><span>Parcela Norte</span></div>
        {selected === 'cultivos' && <div className="app-demo-crops">
          <div className="app-demo-heading"><b>Seguimiento del cultivo</b><span>Vista satelital</span></div>
          <img src="/media/indices/ndvi-limpio.jpg" alt="" width="1536" height="1024"/>
          <div className="app-demo-map-footer"><span>Contorno de la parcela</span><span>Observa · Compara · Revisa</span></div>
        </div>}
        {selected === 'meteorologia' && <div className="app-demo-weather">
          <div className="app-demo-heading"><b>El tiempo en tu finca</b><span>Previsión</span></div>
          <div className="app-demo-current"><div><span>Parcialmente soleado</span><strong>24<span> °C</span></strong></div><span className="app-demo-sun" aria-hidden="true">☀</span></div>
          <div className="app-demo-metrics"><div><span>Viento</span><b>12 km/h</b></div><div><span>Humedad relativa</span><b>64 %</b></div><div><span>Lluvia prevista</span><b>2 mm</b></div></div>
          <div className="app-demo-forecast">{[['Lun','☀','24°','0 mm'],['Mar','☀','26°','0 mm'],['Mié','☁','22°','2 mm'],['Jue','☂','20°','8 mm'],['Vie','☀','23°','0 mm']].map(([day,icon,temp,rain])=><div key={day}><span>{day}</span><i aria-hidden="true">{icon}</i><b>{temp}</b><small>{rain}</small></div>)}</div>
        </div>}
        {selected === 'labores' && <div className="app-demo-activities">
          <div className="app-demo-heading"><b>Registrar una labor</b><span>Cuaderno de campo</span></div>
          <div className="app-demo-form"><div><span>Parcela</span><div>Parcela Norte</div></div><div><span>Tipo de labor</span><div>Riego</div></div><div><span>Fecha</span><div>02 / 11 / 2026</div></div><div><span>Campaña</span><div>Campaña 2026</div></div><div className="app-demo-notes"><span>Observaciones</span><div>Riego realizado en el sector norte.<br/>Revisar la parcela en la próxima visita.</div></div></div>
          <div className="app-demo-record"><span aria-hidden="true">✓</span><div><b>Historial de la parcela</b><span>Fecha, actividad y observaciones en un mismo lugar</span></div></div>
        </div>}
      </div>
    <div className="app-preview-tabs" role="group" aria-label="Explora la plataforma">
      {views.map(item => <button type="button" key={item.id} aria-pressed={selected === item.id} aria-controls="app-preview-panel" onClick={() => setSelected(item.id)}>{item.label}</button>)}
    </div>
      <div className="app-preview-caption"><strong>{view.title}</strong><p>{view.description}</p><a href="#plataforma-detalle">Explorar la plataforma ↓</a></div>
    </div>
  </div>;
}