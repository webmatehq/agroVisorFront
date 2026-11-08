import { useState } from 'react';

// Landing-page demonstration, independent from the live weather service.
const forecast = [
  { hour: '06', temp: 17, rain: 0, wind: 7, humidity: 82 },
  { hour: '09', temp: 21, rain: 0, wind: 9, humidity: 73 },
  { hour: '12', temp: 25, rain: 0, wind: 12, humidity: 64 },
  { hour: '15', temp: 27, rain: 0.4, wind: 16, humidity: 60 },
  { hour: '18', temp: 23, rain: 1.2, wind: 14, humidity: 72 },
  { hour: '21', temp: 20, rain: 0.4, wind: 10, humidity: 79 },
];
const dailyForecast = [
  { day: 'Hoy', max: 27, min: 17, rain: 2, sky: 'Variable' },
  { day: 'Mañana', max: 25, min: 16, rain: 0, sky: 'Despejado' },
  { day: '+2 días', max: 23, min: 15, rain: 5.4, sky: 'Lluvia' },
  { day: '+3 días', max: 22, min: 14, rain: 1.6, sky: 'Chubascos' },
  { day: '+4 días', max: 26, min: 16, rain: 0, sky: 'Despejado' },
];
const x = (i: number) => 48 + i * 84;
const y = (temperature: number) => 105 - (temperature - 15) * 6;
const line = forecast.map((point, i) => `${x(i)},${y(point.temp)}`).join(' ');

export function WeatherPreview() {
  const [selected, setSelected] = useState(2);
  const point = forecast[selected];
  return <section className="weather-preview" aria-label="Previsión meteorológica de demostración">
    <div className="weather-preview-heading">
      <div><span className="weather-preview-kicker">METEOROLOGÍA DE LA PARCELA</span><h3>Maíz</h3></div>
      <span className="weather-preview-period">Hoy · cada 3 h</span>
    </div>
    <div className="weather-preview-reading">
      <div><strong>{point.temp}<small> °C</small></strong><span>Temperatura a las {point.hour}:00</span></div>
      <div className="weather-preview-range"><span>Mín. <b>17°</b> / Máx. <b>27°</b></span><span>Lluvia del día <b>2,0 mm</b></span></div>
    </div>
    <div className="weather-preview-chart">
      <div className="weather-preview-legend"><span><i/>Temperatura · °C</span><span><i/>Lluvia · mm / 3 h</span></div>
      <svg viewBox="0 0 516 128" role="img" aria-label="Temperatura de 17 a 27 grados. Lluvia prevista por intervalos de tres horas, con un máximo de 1,2 milímetros a las 18 horas.">
        {[15,20,25,30].map(value => <g key={value}><line x1="35" x2="485" y1={y(value)} y2={y(value)} stroke="#e0e9e3" strokeDasharray="3 4"/><text x="8" y={y(value) + 4}>{value}°</text></g>)}
        <polygon points={`48,105 ${line} 468,105`} fill="#dcecdf" opacity=".65"/>
        {forecast.map((item,i) => <g key={item.hour}>
          <rect x={x(i)-12} y={105-item.rain*24} width="24" height={item.rain*24} rx="3" fill="#699fb6"/>
          {item.rain > 0 && <text x={x(i)} y={119} textAnchor="middle" className="weather-preview-rain-label">{item.rain.toLocaleString('es')}</text>}
        </g>)}
        <polyline points={line} fill="none" stroke="#286448" strokeWidth="3" strokeLinejoin="round"/>
        <line x1={x(selected)} x2={x(selected)} y1="12" y2="105" stroke="#849d8b" strokeDasharray="3 4"/>
        {forecast.map((item,i) => <g key={item.hour}><circle cx={x(i)} cy={y(item.temp)} r={selected===i?6:3} fill={selected===i?'#173c30':'white'} stroke="#286448" strokeWidth="2"/><text x={x(i)} y={y(item.temp)-12} textAnchor="middle" className="weather-preview-temperature">{item.temp}°</text></g>)}
      </svg>
      <div className="weather-preview-hours" role="group" aria-label="Selecciona una hora">
        {forecast.map((item,i)=><button type="button" key={item.hour} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{item.hour}:00</button>)}
      </div>
    </div>
    <div className="weather-preview-metrics" aria-live="polite">
      <div><span>Viento</span><strong>{point.wind}<small> km/h</small></strong></div>
      <div><span>Humedad</span><strong>{point.humidity}<small> %</small></strong></div>
      <div><span>Lluvia · 3 h</span><strong>{point.rain.toLocaleString('es')}<small> mm</small></strong></div>
    </div>
    <div className="weather-preview-daily">
      <div className="weather-preview-daily-title"><h4>Próximos 5 días</h4><span>Máx. / mín. · lluvia diaria</span></div>
      <div className="weather-preview-days">
        {dailyForecast.map(day => <div key={day.day} className="weather-preview-day">
          <strong>{day.day}</strong>
          <span className="weather-preview-sky">{day.sky}</span>
          <div aria-label={`Máxima ${day.max} grados, mínima ${day.min} grados`}><b>{day.max}°</b><span> / {day.min}°</span></div>
          <span className="weather-preview-daily-rain">{day.rain.toLocaleString('es')} mm</span>
        </div>)}
      </div>
    </div>
  </section>;
}
