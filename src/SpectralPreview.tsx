import { IndexPreview } from './IndexPreview';
import { useState } from 'react';

// Presentation-only distributions, visually estimated from the supplied images.
// The 40 ha total is simulated. Producer analytics must use georeferenced raster data.
const indices = [
  { id: 'ndvi', name: 'NDVI', title: 'NDVI · El vistazo general de tu cultivo',
    description: 'Muestra cuánta vegetación verde y activa hay en cada zona. Cuanto más verde se ve en el mapa, más vigor tiene el cultivo. El rojo puede señalar suelo descubierto o zonas con menor desarrollo. Úsalo para decidir por dónde empezar a recorrer la parcela.',
    ranges: ['0,00–0,20','0,20–0,35','0,35–0,50','0,50–0,65','0,65–0,80','0,80–1,00'], percentages: [9,7,12,19,13,40] },
  { id: 'evi', name: 'EVI', title: 'EVI · Para cuando el cultivo ya está tupido',
    description: 'Funciona como el NDVI, pero ayuda a distinguir diferencias cuando la vegetación es muy densa. Es útil en pleno crecimiento para comparar zonas que a simple vista parecen iguales. Los verdes muestran mayor desarrollo y los tonos cálidos señalan zonas que conviene revisar.',
    ranges: ['0,00–0,15','0,15–0,30','0,30–0,45','0,45–0,60','0,60–0,75','0,75–1,00'], percentages: [10,7,12,18,12,41] },
  { id: 'ndmi', name: 'NDMI', title: 'NDMI · Cuánta agua tiene la planta',
    description: 'Ayuda a observar el agua que contiene la vegetación. Los tonos cálidos señalan valores menores y pueden indicar falta de agua, mientras que los verdes corresponden a valores mayores. Contrástalo con las lluvias y los riegos recientes antes de ir a revisar.',
    ranges: ['−1,00 a −0,20','−0,20 a 0,00','0,00–0,20','0,20–0,40','0,40–0,60','0,60–1,00'], percentages: [22,17,15,19,15,12] },
  { id: 'savi', name: 'SAVI', title: 'SAVI · Para las primeras etapas',
    description: 'Es como el NDVI, pero reduce el efecto del suelo. Cuando el cultivo es joven y se ve tierra entre las plantas, ayuda a seguir cómo se va cubriendo la parcela. Los verdes señalan mayor vegetación y los tonos cálidos te ayudan a localizar zonas con menor desarrollo.',
    ranges: ['0,00–0,15','0,15–0,30','0,30–0,45','0,45–0,60','0,60–0,80','0,80–1,00'], percentages: [7,6,10,17,14,46] },
  { id: 'ndre', name: 'NDRE', title: 'NDRE · Detecta cambios en el verdor',
    description: 'Ayuda a observar diferencias relacionadas con la clorofila, el pigmento que da el color verde a la planta. En cultivos desarrollados permite seguir cambios que pueden pasar desapercibidos a simple vista. Compara los verdes y los tonos cálidos para ubicar zonas donde conviene revisar la nutrición o el estado general.',
    ranges: ['0,00–0,10','0,10–0,20','0,20–0,30','0,30–0,40','0,40–0,50','0,50–1,00'], percentages: [9,8,12,22,20,29] },
];

export function SpectralPreview() {
  const [selected, setSelected] = useState('ndvi');
  const index = indices.find(item => item.id === selected)!;
  return <div className="spectral-preview">
    <div className="spectral-selector" role="group" aria-label="Selecciona un índice espectral">
      {indices.map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} aria-controls="spectral-preview-content" onClick={() => setSelected(item.id)}>{item.name}</button>)}
    </div>
    <figure id="spectral-preview-content" className="spectral-example">
      <IndexPreview key={index.id} index={index}/>
      <figcaption>
        <strong>{index.title}</strong>
        <p>{index.description}</p>
      </figcaption>
    </figure>
  </div>;
}
