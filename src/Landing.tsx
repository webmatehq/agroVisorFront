import React from 'react';
import { ImageZoom } from './ImageZoom';
import { SpectralPreview } from './SpectralPreview';
import { WeatherPreview } from './WeatherPreview';
import { ActivitiesPreview } from './ActivitiesPreview';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BrandMark, Chat, DroneSymbol, Expand, IndexSymbol,
  NotebookSymbol, ParcelSymbol, Phone, Pin, WeatherSymbol,
} from './Icons';

const DRONE_WHATSAPP = 'https://wa.me/5491168998095';
const PLATFORM_WHATSAPP = 'https://wa.me/34617358073';

const locations = [
  {
    country: 'España', city: 'Madrid',
    address: ['Calle Quiñones, 10', '28015 Madrid', 'España'],
    map: 'https://www.google.com/maps/search/?api=1&query=Calle%20Qui%C3%B1ones%2010%2C%2028015%20Madrid%2C%20Espa%C3%B1a',
  },
  {
    country: 'Ecuador', city: 'Loja',
    address: ['Calle Clodoveo Carrión y Zoilo Rodríguez', 'Loja · CP 110108', 'Ecuador'],
    map: 'https://www.google.com/maps/search/?api=1&query=Clodoveo%20Carri%C3%B3n%20y%20Zoilo%20Rodr%C3%ADguez%2C%20Loja%2C%20Ecuador',
  },
  {
    country: 'Argentina', city: 'Concordia',
    address: ['Parque Industrial Concordia', 'Av. Pres. Juan Domingo Perón S/N', 'Concordia, Entre Ríos · CP 3200', 'Argentina'],
    map: 'https://www.google.com/maps/search/?api=1&query=-31.415818%2C-58.093011',
  },
];

/** The hero product shot: a faithful miniature of the real app shell around the example NDVI parcel. */
function ProductWindow() {
  return <div className="pw" aria-label="Vista de la plataforma con datos de ejemplo" role="img">
    <div className="pw-window">
      <div className="pw-bar" aria-hidden="true">
        <span className="pw-dots"><i /><i /><i /></span>
        <span className="pw-url">app.surcovisor.com / índices</span>
        <span className="pw-tag">Datos de ejemplo</span>
      </div>
      <div className="pw-body" aria-hidden="true">
        <aside className="pw-side">
          <span className="pw-brand"><BrandMark size={16} />SurcoVisor</span>
          <span className="pw-nav is-active"><ParcelSymbol size={15} />Vista general</span>
          <span className="pw-nav"><WeatherSymbol size={15} />Meteorología</span>
          <span className="pw-nav"><IndexSymbol size={15} />Desarrollo</span>
          <span className="pw-nav"><NotebookSymbol size={15} />Cuaderno</span>
        </aside>
        <div className="pw-main">
          <div className="pw-context"><span><b>Finca</b>Finca Norte</span><span><b>Parcela</b>Maíz · 12,4 ha</span></div>
          <div className="pw-grid">
            <figure className="pw-map">
              <img src="/media/indices/ndvi-limpio.jpg" alt="" width="1536" height="1024" />
              <figcaption><span>NDVI · Vigor</span><span className="pw-ramp" /></figcaption>
            </figure>
            <div className="pw-stats">
              <div><span>NDVI promedio</span><strong>0,68</strong><em>Vigor alto</em></div>
              <div><span>Zonas a revisar</span><strong>2</strong><em>Borde oeste</em></div>
              <div><span>Lluvia · 5 días</span><strong>9 mm</strong><em>Previsión</em></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="pw-float pw-float-weather" aria-hidden="true">
      <WeatherSymbol size={18} />
      <div><span>Hoy · 12:00</span><strong>25 °C</strong><em>Lluvia 2,0 mm · viento 12 km/h</em></div>
    </div>
    <div className="pw-float pw-float-note" aria-hidden="true">
      <NotebookSymbol size={18} />
      <div><span>Cuaderno · 06 nov</span><strong>Riego por goteo</strong><em className="pw-done">Completada</em></div>
    </div>
  </div>;
}

export function Landing({ onLogin }: { onLogin: () => void }) {
  const goToSection = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  return <main className="carta" lang="es" id="inicio">
    <header className="lp-nav">
      <nav className="lp-nav-inner" aria-label="Navegación principal">
        <a className="lp-brand" href="#inicio" aria-label="SurcoVisor · Volver al inicio" onClick={goToSection('inicio')}>
          <BrandMark size={22} /><span>SurcoVisor</span>
        </a>
        <div className="lp-links">
          <a href="#soluciones" onClick={goToSection('soluciones')}>Soluciones</a>
          <a href="#plataforma-detalle" onClick={goToSection('plataforma-detalle')}>Funcionalidades</a>
          <a href="#nosotros" onClick={goToSection('nosotros')}>Nuestra historia</a>
          <a href="#contacto" onClick={goToSection('contacto')}>Contacto</a>
        </div>
        <div className="lp-nav-actions">
          <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={onLogin}>Entrar</button>
          <button type="button" className="lp-btn lp-btn-primary lp-btn-sm lp-hide-sm" onClick={onLogin}>Crear cuenta</button>
        </div>
      </nav>
    </header>

    <section className="lp-hero" aria-labelledby="hero-title">
      <div className="lp-hero-copy">
        <h1 id="hero-title">Tu finca, vista con más claridad</h1>
        <p className="lp-lede">Una sola plataforma para delimitar tu explotación, monitorizar tus cultivos, registrar labores, detectar cambios y actuar con información actualizada para decidir a tiempo</p>
        <div className="lp-hero-actions">
          <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={onLogin}>Crear cuenta <ArrowRight size={18} /></button>
          <a className="lp-btn lp-btn-dark lp-btn-lg" href={DRONE_WHATSAPP} target="_blank" rel="noreferrer"><DroneSymbol size={18} />Pedir trabajo con drones</a>
        </div>
        <p className="lp-hero-note">Agricultura global · Datos para decidir</p>
      </div>
      <ProductWindow />
    </section>

    <section id="soluciones" className="lp-section" aria-labelledby="soluciones-title">
      <div className="lp-head">
        <h2 id="soluciones-title">La información que necesitas para decidir mejor</h2>
        <p>Una misma explotación, una misma vista.</p>
      </div>
      <div className="lp-trio">
        <div><span className="lp-icon"><ParcelSymbol size={22} /></span><h3>Organización del campo</h3><p>Tus parcelas, campañas, labores y toda la información de tu explotación, organizadas y almacenadas en un mismo lugar</p></div>
        <div><span className="lp-icon"><IndexSymbol size={22} /></span><h3>Análisis del cultivo</h3><p>Comprende el estado y la evolución de tus cultivos mediante distintos índices espectrales, presentados de forma clara y fácil de interpretar</p></div>
        <div><span className="lp-icon"><WeatherSymbol size={22} /></span><h3>Información meteorológica</h3><p>Consulta las previsiones meteorológicas para anticipar condiciones climáticas adversas, reducir riesgos y planificar mejor el trabajo en el campo</p></div>
      </div>
    </section>

    <section id="plataforma-detalle" className="lp-section" aria-labelledby="features-title">
      <div className="lp-head">
        <h2 id="features-title">Conoce tus parcelas. Planifica tu trabajo.</h2>
        <p>Sigue la evolución de tus cultivos, consulta la previsión del tiempo y registra las labores de cada parcela.</p>
      </div>
      <div className="lp-bento">
        <article className="lp-tile lp-tile-wide">
          <div className="lp-tile-copy">
            <span className="lp-icon"><IndexSymbol size={22} /></span>
            <h3>Monitoreo satelital</h3>
            <p>Las imágenes satelitales ayudan a observar diferencias dentro de una parcela y seguir su evolución entre fechas. Los índices ofrecen distintas formas de interpretar la vegetación.</p>
            <ul>
              <li>Delimita y localiza tus parcelas</li>
              <li>Consulta observaciones del cultivo</li>
              <li>Identifica zonas que conviene revisar en campo</li>
            </ul>
            <p className="lp-hint">Selecciona un índice para conocer qué representa y cómo puede ayudarte a interpretar la vegetación.</p>
          </div>
          <div className="lp-demo"><span className="lp-demo-tag">Datos de ejemplo</span><SpectralPreview /></div>
        </article>
        <article className="lp-tile">
          <div className="lp-tile-copy">
            <span className="lp-icon"><WeatherSymbol size={22} /></span>
            <h3>Meteorología de tu finca</h3>
            <p>Consulta las previsiones de temperatura, lluvia y viento para anticipar las condiciones de los próximos días y organizar el trabajo en el campo.</p>
            <ul>
              <li>Previsión vinculada a la ubicación de la finca</li>
              <li>Temperatura y precipitación por día</li>
              <li>Condiciones meteorológicas para apoyar la planificación</li>
            </ul>
          </div>
          <div className="lp-demo"><span className="lp-demo-tag">Datos de ejemplo</span><WeatherPreview /></div>
        </article>
        <article className="lp-tile">
          <div className="lp-tile-copy">
            <span className="lp-icon"><NotebookSymbol size={22} /></span>
            <h3>Cuaderno de labores</h3>
            <p>Anota qué se ha hecho, cuándo y en qué parcela. Conserva las observaciones de cada actividad para consultar el historial de tu explotación.</p>
            <ul>
              <li>Riegos, tratamientos, fertilización e inspecciones</li>
              <li>Fecha, productos y observaciones</li>
              <li>Historial organizado por parcela y campaña</li>
            </ul>
          </div>
          <div className="lp-demo"><span className="lp-demo-tag">Datos de ejemplo</span><ActivitiesPreview /></div>
        </article>
      </div>
    </section>

    <section id="plataforma-servicios" className="lp-section" aria-labelledby="doors-title">
      <div className="lp-head">
        <h2 id="doors-title">Gestiona tu explotación y cuenta con nosotros para trabajar en el campo</h2>
        <p>Con SurcoVisor puedes organizar y consultar la información de tu explotación. Además, nuestro equipo ofrece servicios con drones para realizar tratamientos, aplicar abonos y sembrar en tus parcelas</p>
      </div>
      <div className="lp-doors">
        <article className="lp-door lp-door-platform">
          <div className="lp-door-copy">
            <h3>Plataforma SurcoVisor</h3>
            <span className="lp-pill">Plataforma digital</span>
            <p>Consulta tus parcelas, sigue la evolución de tus cultivos y organiza las labores desde un mismo lugar</p>
            <button type="button" className="lp-btn lp-btn-primary" onClick={onLogin}>Acceder a la plataforma <ArrowRight size={16} /></button>
          </div>
          <div className="lp-door-shot" aria-hidden="true"><img src="/media/indices/ndvi-limpio.jpg" alt="" width="1536" height="1024" loading="lazy" /></div>
        </article>
        <article className="lp-door lp-door-drones">
          <video className="lp-door-video" src="/media/trabajo-dron-02-sin-audio.mp4" autoPlay loop muted playsInline preload="metadata" aria-hidden="true" />
          <div className="lp-door-copy">
            <h3>Servicios agrícolas con drones</h3>
            <span className="lp-pill lp-pill-dark">Servicio profesional</span>
            <p>Nos desplazamos a tu explotación y realizamos los trabajos que necesitas con nuestros drones y nuestro equipo</p>
            <ul>
              <li>Fumigación y tratamientos de cultivos</li>
              <li>Aplicación de abonos</li>
              <li>Siembra aérea</li>
            </ul>
            <a className="lp-btn lp-btn-light" href="#contacto-drones" onClick={goToSection('contacto-drones')}>Ver contacto del servicio <ArrowDown size={16} /></a>
          </div>
        </article>
      </div>
    </section>

    <section id="nosotros" className="lp-section lp-story" aria-labelledby="history-title">
      <div className="lp-story-head">
        <h2 id="history-title">Experiencia aérea, tecnología y compromiso con el campo</h2>
        <div className="lp-stats">
          <p><strong>+7 años</strong><span>de experiencia en el sector agropecuario</span></p>
          <p><strong>+7.000 ha</strong><span>trabajadas con drones</span></p>
        </div>
      </div>
      <div className="lp-story-copy">
        <p>Nuestra historia en el agro nace de la pasión por la aviación y del compromiso con la innovación aplicada a la producción agrícola.</p>
        <p>Contamos con más de 7 años de experiencia en el sector agropecuario como piloto aeroaplicador, trabajando junto a productores y profesionales del campo para brindar soluciones eficientes, precisas y adaptadas a las necesidades de cada establecimiento.</p>
        <p>Con la incorporación de tecnología de drones agrícolas, llevamos esa experiencia un paso más allá, combinando los conocimientos de la aplicación aérea tradicional con las ventajas de la agricultura de precisión. A lo largo de este camino, hemos realizado trabajos en más de 7.000 hectáreas con drones, adquiriendo experiencia práctica en diferentes escenarios y necesidades de aplicación.</p>
      </div>
      <div className="lp-gallery" aria-label="Imágenes y vídeos de trabajo en campo">
        <figure className="lp-media lp-media-tall">
          <ImageZoom src="/media/dron-cultivo.jpg" alt="Dron agrícola pulverizando sobre un cultivo">
            <img src="/media/dron-cultivo.jpg" alt="Dron agrícola pulverizando sobre un cultivo, con árboles al fondo" width="1086" height="1448" loading="lazy" decoding="async" />
          </ImageZoom>
        </figure>
        <figure className="lp-media">
          <ImageZoom className="video-zoom-trigger" src="/media/trabajo-dron-01-sin-audio.mp4" alt="Vídeo de trabajo en campo 1" zoomContent={<video className="video-zoom-player" src="/media/trabajo-dron-01-sin-audio.mp4" controls autoPlay muted playsInline aria-label="Vídeo de trabajo en campo 1" />}>
            <video src="/media/trabajo-dron-01-sin-audio.mp4" autoPlay loop muted playsInline preload="metadata" aria-hidden="true" />
            <span className="lp-media-badge"><Expand size={14} />Ver vídeo</span>
          </ImageZoom>
        </figure>
        <figure className="lp-media">
          <ImageZoom className="video-zoom-trigger" src="/media/trabajo-dron-02-sin-audio.mp4" alt="Vídeo de trabajo en campo 2" zoomContent={<video className="video-zoom-player" src="/media/trabajo-dron-02-sin-audio.mp4" controls autoPlay muted playsInline aria-label="Vídeo de trabajo en campo 2" />}>
            <video src="/media/trabajo-dron-02-sin-audio.mp4" autoPlay loop muted playsInline preload="metadata" aria-hidden="true" />
            <span className="lp-media-badge"><Expand size={14} />Ver vídeo</span>
          </ImageZoom>
        </figure>
      </div>
    </section>

    <section id="contacto" className="lp-section" aria-labelledby="contact-title">
      <div className="lp-head">
        <h2 id="contact-title">Hablemos de lo que necesitas</h2>
        <p>Elige el contacto según tu consulta</p>
      </div>
      <div className="lp-contact">
        <article className="lp-card" id="contacto-plataforma">
          <h3>Contacta con nuestro equipo</h3>
          <span className="lp-pill">Plataforma SurcoVisor</span>
          <p>¿Tienes una consulta sobre SurcoVisor? Escríbenos o llámanos para hablar sobre el acceso, el uso de la plataforma o cualquier duda.</p>
          <dl className="lp-channels">
            <div><dt><Phone size={16} />Por teléfono</dt><dd><a className="lp-phone" href="tel:+34617358073">+34 617 358 073</a><span>Llama para consultar directamente con el equipo.</span></dd></div>
            <div><dt><Chat size={16} />Por WhatsApp</dt><dd><span>Cuéntanos tu consulta. Puedes adjuntar una captura si necesitas ayuda con alguna pantalla.</span><a className="lp-btn lp-btn-primary" href={PLATFORM_WHATSAPP} target="_blank" rel="noreferrer">Escribir al equipo <ArrowUpRight size={16} /></a></dd></div>
          </dl>
        </article>
        <article className="lp-card" id="contacto-drones">
          <h3>Consulta tu próximo trabajo</h3>
          <span className="lp-pill">Servicios con drones</span>
          <p>¿Necesitas realizar una fumigación, aplicar abono o sembrar con drones? Escríbenos o llámanos para consultar disponibilidad y presupuesto.</p>
          <dl className="lp-channels">
            <div><dt><Phone size={16} />Por teléfono</dt><dd><a className="lp-phone" href="tel:+5491168998095">+54 9 11 6899-8095</a><span>Habla con el equipo sobre el trabajo que necesitas.</span></dd></div>
            <div><dt><Chat size={16} />Por WhatsApp</dt><dd><span>Indícanos la ubicación, el cultivo y las hectáreas. Cuéntanos qué trabajo necesitas y para qué fecha.</span><a className="lp-btn lp-btn-dark" href={DRONE_WHATSAPP} target="_blank" rel="noreferrer">Consultar presupuesto <ArrowUpRight size={16} /></a></dd></div>
          </dl>
        </article>
      </div>
    </section>

    <section className="lp-section" aria-labelledby="locations-title">
      <div className="lp-head">
        <h2 id="locations-title">Dónde encontrarnos</h2>
      </div>
      <div className="lp-places">
        {locations.map(place => <article className="lp-place" key={place.city}>
          <span className="lp-place-country">{place.country}</span>
          <h3>{place.city}</h3>
          <address>{place.address.map(line => <span key={line}>{line}</span>)}</address>
          <a href={place.map} target="_blank" rel="noreferrer" aria-label={`Ver la dirección de ${place.city} en el mapa`}><Pin size={16} />Ver en el mapa</a>
        </article>)}
      </div>
    </section>

    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-brand"><span className="lp-brand"><BrandMark size={20} /><span>SurcoVisor</span></span><p>Agricultura con datos</p></div>
        <div><span className="lp-footer-label">Plataforma</span><a href="tel:+34617358073">+34 617 358 073</a></div>
        <div><span className="lp-footer-label">Drones</span><a href="tel:+5491168998095">+54 9 11 6899-8095</a></div>
        <div><span className="lp-footer-label">Ubicaciones</span><span>Madrid · Loja · Concordia</span></div>
      </div>
    </footer>
  </main>;
}
