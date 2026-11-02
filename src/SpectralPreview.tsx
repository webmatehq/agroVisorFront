import { useState } from 'react';

const indices = [
  { id: 'ndvi', name: 'NDVI', title: '¿Qué muestra el NDVI?', description: 'Compara la luz roja y el infrarrojo cercano reflejados por la vegetación para observar su vigor. Ayuda a localizar diferencias dentro de la finca, aunque un valor bajo no identifica por sí solo la causa de un problema.' },
  { id: 'evi', name: 'EVI', title: '¿Qué muestra el EVI?', description: 'Complementa al NDVI cuando la vegetación es densa. Ayuda a distinguir variaciones en la cubierta vegetal que pueden resultar menos visibles con el NDVI.' },
  { id: 'ndmi', name: 'NDMI', title: '¿Qué muestra el NDMI?', description: 'Permite observar diferencias relacionadas con el contenido de agua de la vegetación. Sirve para orientar revisiones en campo; no mide directamente la humedad del suelo ni confirma por sí solo estrés hídrico.' },
  { id: 'savi', name: 'SAVI', title: '¿Qué muestra el SAVI?', description: 'Observa el vigor de la vegetación reduciendo parte de la influencia del brillo del suelo. Es útil cuando la cubierta vegetal es dispersa y queda suelo visible entre las plantas.' },
  { id: 'ndre', name: 'NDRE', title: '¿Qué muestra el NDRE?', description: 'Utiliza el borde rojo y el infrarrojo cercano para observar variaciones relacionadas con la clorofila y la vegetación. Ayuda a localizar zonas que conviene revisar, sin diagnosticar por sí solo una carencia nutricional.' },
];

export function SpectralPreview() {
  const [selected, setSelected] = useState('ndvi');
  const index = indices.find(item => item.id === selected)!;
  const imageUrl = `/media/indices/${index.id}-limpio.jpg`;
  return <div className="spectral-preview">
    <div className="spectral-selector" role="group" aria-label="Selecciona un índice espectral">
      {indices.map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} aria-controls="spectral-preview-content" onClick={() => setSelected(item.id)}>{item.name}</button>)}
    </div>
    <figure id="spectral-preview-content" className="spectral-example" aria-live="polite">
      <a href={imageUrl} target="_blank" rel="noreferrer" aria-label={`Ampliar imagen y leyenda de ${index.name}`}>
        <img src={imageUrl} alt={`Ejemplo ilustrativo de ${index.name}: finca delimitada y leyenda con seis intervalos orientativos`} width="1536" height="1024" decoding="async"/>
      </a>
      <figcaption>
        <a className="spectral-expand" href={imageUrl} target="_blank" rel="noreferrer">Ampliar imagen y leyenda ↗</a>
        <strong>{index.title}</strong>
        <p>{index.description}</p>
      </figcaption>
    </figure>
  </div>;
}