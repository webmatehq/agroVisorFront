import { ActivitiesPreview } from './ActivitiesPreview';
import { WeatherPreview } from './WeatherPreview';
import { ImageZoom } from './ImageZoom';
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
      <div className="app-demo" role="group" aria-label={`Vista de demostración de ${view.label}, con datos de ejemplo`}>
        <div className="app-demo-header"><b>◈ SurcoVisor</b><span>Tu explotación, conectada</span></div>
        <div className="app-demo-context"><span>MI EXPLOTACIÓN</span><span>Parcela Norte</span></div>
        <div className="app-preview-stage"><div className="app-preview-surface" aria-hidden={selected !== 'cultivos'}><div className="app-demo-crops">
          <div className="app-demo-heading"><b>Seguimiento del cultivo</b><span>Vista satelital</span></div>
          <ImageZoom className="app-demo-image-zoom" src="/media/indices/ndvi-limpio.jpg" alt="Vista satelital de la parcela con índice NDVI"><svg className="hero-parcel-map" viewBox="0 0 1182 1024" role="img" aria-label="Vista completa de la parcela con índice NDVI"><image href="/media/indices/ndvi-limpio.jpg" width="1536" height="1024"/></svg></ImageZoom>
          <div className="app-demo-map-footer"><span>Contorno de la parcela</span><span>Observa · Compara · Revisa</span></div>
        </div></div>
        <div className="app-preview-surface" aria-hidden={selected !== 'meteorologia'}><WeatherPreview/></div>
        <div className="app-preview-surface" aria-hidden={selected !== 'labores'}><ActivitiesPreview/></div></div>
      </div>
    <div className="app-preview-tabs" role="group" aria-label="Explora la plataforma">
      {views.map(item => <button type="button" key={item.id} aria-pressed={selected === item.id} aria-controls="app-preview-panel" onClick={() => setSelected(item.id)}>{item.label}</button>)}
    </div>
      <div className="app-preview-caption"><strong>{view.title}</strong><p>{view.description}</p><a href="#plataforma-detalle">Explorar funcionalidades ↓</a></div>
    </div>
  </div>;
}