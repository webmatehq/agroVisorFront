import { useEffect, useRef, useState } from 'react';
import { ImageZoom } from './ImageZoom';

const categories = [
  { label: 'Malo', color: '#a4143c' },
  { label: 'Mejorable', color: '#ff4054' },
  { label: 'Regular', color: '#ffa21c' },
  { label: 'Aceptable', color: '#c4f000' },
  { label: 'Bueno', color: '#00bc88' },
  { label: 'Muy bueno', color: '#00734f' },
];
export function IndexPreview({ index }: { index: { id: string; name: string; ranges: string[]; percentages: number[] } }) {
  const imageUrl = `/media/indices/${index.id}-limpio.jpg`;
  const map = <div className="ndvi-map-crop"><img src={imageUrl} alt={`Mapa de ${index.name} de la finca`}/></div>;
  let cumulative = 0;
  const segments = categories.map((category, i) => {
    const start = cumulative;
    cumulative += index.percentages[i];
    return `${category.color} ${start}% ${cumulative}%`;
  });
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => { if (preference.matches) setPlaying(false); };
    preference.addEventListener('change', stop);
    return () => preference.removeEventListener('change', stop);
  }, []);
  useEffect(() => {
    if (!playing || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setSlide(current => 1 - current);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [playing, visible]);

  return <div ref={container} className="ndvi-preview">
    <div className="ndvi-stage">
      <div className="ndvi-slide" hidden={slide !== 0}>
        <ImageZoom src={imageUrl} alt={`Mapa ${index.name}`} zoomContent={map}>{map}</ImageZoom>
        <div className="ndvi-map-caption"><span>{index.name} · Tu finca</span><span>Pulsa para ampliar ⤢</span></div>
        <div className="ndvi-color-key">{categories.map(category => <span key={category.label}><i style={{background:category.color}}/>{category.label}</span>)}</div>
      </div>
      <div className="ndvi-slide ndvi-summary" hidden={slide !== 1}>
        <div className="ndvi-summary-heading"><h3>¿Cuánto ocupa cada zona?</h3></div>
        <div className="ndvi-donut" style={{background: `conic-gradient(${segments.join(', ')})`}} role="img" aria-label={`Distribución de superficie por ${index.name}. Total 40 hectáreas. Detalle en la tabla.`}>
          <div><strong>40 ha</strong><span>superficie total</span></div>
        </div>
        <div className="ndvi-table-wrap"><table>
          <caption>Superficie por categoría de {index.name}</caption>
          <thead><tr><th scope="col">Estado</th><th scope="col">Rango {index.name}</th><th scope="col">Hectáreas</th><th scope="col">%</th></tr></thead>
          <tbody>{categories.map((category, i) => <tr key={category.label}>
            <th scope="row"><i style={{background:category.color}}/>{category.label}</th>
            <td>{index.ranges[i]}</td><td>{(40 * index.percentages[i] / 100).toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2})} ha</td><td>{index.percentages[i]} %</td>
          </tr>)}</tbody>
        </table></div>
        
      </div>
    </div>
    <div className="ndvi-playback">
      <span aria-hidden="true">{slide === 0 ? '● ○' : '○ ●'}</span>
      <button type="button" onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pausar cambio automático' : 'Reproducir cambio automático'}>{playing ? 'Ⅱ' : '▷'}</button>
    </div>
    
  </div>;
}
