import { ImageZoom } from './ImageZoom';
import React from 'react';
import { SpectralPreview } from './SpectralPreview';
import { AppPreview } from './AppPreview';
import './landing-overrides.css';

export function Landing({onLogin}:{onLogin:()=>void}){
  const goToSection=(id:string)=>(event:React.MouseEvent<HTMLAnchorElement>)=>{event.preventDefault();document.getElementById(id)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
  return <main className="landing" lang="es">
    <header className="landing-header"><nav className="landing-nav" aria-label="Navegación principal"><div className="landing-brand">◈ SurcoVisor</div><div className="landing-links"><a href="#/" onClick={goToSection("soluciones")}>Soluciones</a><a href="#/" onClick={goToSection("plataforma-detalle")}>Funcionalidades</a><a href="#/" onClick={goToSection("nosotros")}>Nuestra historia</a><a href="#/" onClick={goToSection("contacto")}>Contacto</a></div><button className="landing-login ghost" onClick={onLogin}>Entrar</button></nav></header>
    <section className="hero"><div className="hero-copy"><span className="eyebrow">AGRICULTURA GLOBAL · DATOS PARA DECIDIR</span><h1>Tu finca, vista con más claridad</h1><p>Una sola plataforma para delimitar tu explotación, monitorizar tus cultivos, registrar labores, detectar cambios y actuar con información actualizada para decidir a tiempo</p><div className="hero-actions"><button onClick={onLogin}>Empezar ahora</button><a className="text-link" href="#/" onClick={goToSection("soluciones")}>Conocer soluciones ↓</a></div></div><AppPreview/></section>
    <section id="soluciones" className="landing-section"><span className="eyebrow">UNA MISMA EXPLOTACIÓN, UNA MISMA VISTA</span><h2>La información que necesitas para decidir mejor</h2><div className="solution-grid"><article><h3>Organización del campo</h3><p>Tus parcelas, campañas, labores y toda la información de tu explotación, organizadas y almacenadas en un mismo lugar</p></article><article><h3>Análisis del cultivo</h3><p>Comprende el estado y la evolución de tus cultivos mediante distintos índices espectrales, presentados de forma clara y fácil de interpretar</p></article><article><h3>Información meteorológica</h3><p>Consulta las previsiones meteorológicas para anticipar condiciones climáticas adversas, reducir riesgos y planificar mejor el trabajo en el campo</p></article></div></section>
<section id="plataforma-detalle" className="platform-detail platform-showcase">
        <div className="platform-detail-heading"><span className="eyebrow">FUNCIONALIDADES</span><h2>Conoce tus parcelas. Planifica tu trabajo.</h2><p>Sigue la evolución de tus cultivos, consulta la previsión del tiempo y registra las labores de cada parcela.</p></div>
        <div className="platform-satellite">
          <div className="platform-feature-copy"><span className="platform-feature-number">01 / OBSERVA</span><h3>Monitoreo satelital</h3><p>Las imágenes satelitales ayudan a observar diferencias dentro de una parcela y seguir su evolución entre fechas. Los índices ofrecen distintas formas de interpretar la vegetación.</p><ul><li>Delimita y localiza tus parcelas</li><li>Consulta observaciones del cultivo</li><li>Identifica zonas que conviene revisar en campo</li></ul><p className="platform-detail-hint">Selecciona un índice para conocer qué representa y cómo puede ayudarte a interpretar la vegetación.</p></div>
          <SpectralPreview/>
        </div>
        <div className="platform-feature-grid">
          <article><span className="platform-feature-number">02 / PLANIFICA</span><h3>Meteorología de tu finca</h3><p>Consulta las previsiones de temperatura, lluvia y viento para anticipar las condiciones de los próximos días y organizar el trabajo en el campo.</p><ul><li>Previsión vinculada a la ubicación de la finca</li><li>Temperatura y precipitación por día</li><li>Condiciones meteorológicas para apoyar la planificación</li></ul></article>
          <article><span className="platform-feature-number">03 / REGISTRA</span><h3>Cuaderno de labores</h3><p>Anota qué se ha hecho, cuándo y en qué parcela. Conserva las observaciones de cada actividad para consultar el historial de tu explotación.</p><ul><li>Riegos, tratamientos, fertilización e inspecciones</li><li>Fecha, productos y observaciones</li><li>Historial organizado por parcela y campaña</li></ul></article>
        </div>
      </section>
    <section id="plataforma-servicios" className="plans-section">
      <div><span className="eyebrow">PLATAFORMA Y SERVICIOS</span><h2>Gestiona tu explotación y cuenta con nosotros para trabajar en el campo</h2><p>Con SurcoVisor puedes organizar y consultar la información de tu explotación. Además, nuestro equipo ofrece servicios con drones para realizar tratamientos, aplicar abonos y sembrar en tus parcelas</p></div>
      <div className="plan-grid">
        <article className="plan-card"><span className="eyebrow">PLATAFORMA DIGITAL</span><h3>Plataforma SurcoVisor</h3><p>Consulta tus parcelas, sigue la evolución de tus cultivos y organiza las labores desde un mismo lugar</p><button className="ghost" onClick={onLogin}>Acceder a la plataforma</button></article>
        <article className="plan-card featured"><span className="eyebrow">SERVICIO PROFESIONAL</span><h3>Servicios agrícolas con drones</h3><p>Nos desplazamos a tu explotación y realizamos los trabajos que necesitas con nuestros drones y nuestro equipo</p><ul><li>Fumigación y tratamientos de cultivos</li><li>Aplicación de abonos</li><li>Siembra aérea</li></ul><a className="whatsapp-button" href="#contacto-drones" onClick={goToSection("contacto-drones")}>Ver contacto del servicio ↓</a></article>
      </div>
    </section>
    <section id="nosotros" className="about-section history-section">
      <div className="history-heading"><span className="eyebrow">NUESTRA HISTORIA</span><h2>Experiencia aérea, tecnología y compromiso con el campo</h2><div className="history-facts"><div><strong>+7 años</strong><span>de experiencia en el sector agropecuario</span></div><div><strong>+7.000 ha</strong><span>trabajadas con drones</span></div></div></div>
      <div className="history-copy">
        <p>Nuestra historia en el agro nace de la pasión por la aviación y del compromiso con la innovación aplicada a la producción agrícola.</p>
        <p>Contamos con más de 7 años de experiencia en el sector agropecuario como piloto aeroaplicador, trabajando junto a productores y profesionales del campo para brindar soluciones eficientes, precisas y adaptadas a las necesidades de cada establecimiento.</p>
        <p>Con la incorporación de tecnología de drones agrícolas, llevamos esa experiencia un paso más allá, combinando los conocimientos de la aplicación aérea tradicional con las ventajas de la agricultura de precisión. A lo largo de este camino, hemos realizado trabajos en más de 7.000 hectáreas con drones, adquiriendo experiencia práctica en diferentes escenarios y necesidades de aplicación.</p>
      </div>
      <div className="field-gallery" aria-label="Imágenes y vídeos de trabajo en campo">
        <div className="field-gallery-grid">
          <figure><ImageZoom src="/media/dron-cultivo.jpg" alt="Dron agrícola pulverizando sobre un cultivo"><img src="/media/dron-cultivo.jpg" alt="Dron agrícola pulverizando sobre un cultivo, con árboles al fondo" width="1086" height="1448" loading="lazy" decoding="async"/></ImageZoom></figure>
          <figure><ImageZoom className="video-zoom-trigger" src="/media/trabajo-dron-01-sin-audio.mp4" alt="Vídeo de trabajo en campo 1" zoomContent={<video className="video-zoom-player" src="/media/trabajo-dron-01-sin-audio.mp4" controls autoPlay muted playsInline aria-label="Vídeo de trabajo en campo 1"/>}><video src="/media/trabajo-dron-01-sin-audio.mp4" autoPlay loop muted playsInline preload="metadata" aria-hidden="true"/><span className="video-zoom-caption" aria-hidden="true">Ver vídeo ampliado ⤢</span></ImageZoom></figure>
          <figure><ImageZoom className="video-zoom-trigger" src="/media/trabajo-dron-02-sin-audio.mp4" alt="Vídeo de trabajo en campo 2" zoomContent={<video className="video-zoom-player" src="/media/trabajo-dron-02-sin-audio.mp4" controls autoPlay muted playsInline aria-label="Vídeo de trabajo en campo 2"/>}><video src="/media/trabajo-dron-02-sin-audio.mp4" autoPlay loop muted playsInline preload="metadata" aria-hidden="true"/><span className="video-zoom-caption" aria-hidden="true">Ver vídeo ampliado ⤢</span></ImageZoom></figure>
        </div>
      </div>
    </section>
    <section id="contacto" className="contact-section contact-options">
      <div><span className="eyebrow">CONTACTO</span><h2>Hablemos de lo que necesitas</h2><p>Elige el contacto según tu consulta</p></div>
      <div className="contact-grid">
        <article className="contact-card" id="contacto-plataforma">
          <span className="eyebrow">PLATAFORMA SURCOVISOR</span>
          <h3>Contacta con nuestro equipo</h3>
          <p>¿Tienes una consulta sobre SurcoVisor? Escríbenos o llámanos para hablar sobre el acceso, el uso de la plataforma o cualquier duda.</p>
          <div className="platform-contact-channels">
            <div className="platform-contact-channel"><span>POR TELÉFONO</span><a href="tel:+34617358073">+34 617 358 073</a><p>Llama para consultar directamente con el equipo.</p></div>
            <div className="platform-contact-channel"><span>POR WHATSAPP</span><p>Cuéntanos tu consulta. Puedes adjuntar una captura si necesitas ayuda con alguna pantalla.</p><a className="whatsapp-button" href="https://wa.me/34617358073" target="_blank" rel="noreferrer">Escribir al equipo ↗</a></div>
          </div>
        </article>
        <article className="contact-card" id="contacto-drones">
          <span className="eyebrow">SERVICIOS CON DRONES</span>
          <h3>Consulta tu próximo trabajo</h3>
          <p>¿Necesitas realizar una fumigación, aplicar abono o sembrar con drones? Escríbenos o llámanos para consultar disponibilidad y presupuesto.</p>
          <div className="platform-contact-channels">
            <div className="platform-contact-channel"><span>POR TELÉFONO</span><a href="tel:+5491168998095">+54 9 11 6899-8095</a><p>Habla con el equipo sobre el trabajo que necesitas.</p></div>
            <div className="platform-contact-channel"><span>POR WHATSAPP</span><p>Indícanos la ubicación, el cultivo y las hectáreas. Cuéntanos qué trabajo necesitas y para qué fecha.</p><a className="whatsapp-button" href="https://wa.me/5491168998095" target="_blank" rel="noreferrer">Consultar presupuesto ↗</a></div>
          </div>
        </article>
      </div>
    </section>
    <section className="locations-section" aria-labelledby="locations-title">
      <span className="eyebrow">UBICACIONES</span>
      <h2 id="locations-title">Dónde encontrarnos</h2>
      <div className="locations-grid">
        <article className="location-card">
          <span className="location-country">España</span>
          <h3>Madrid</h3>
          <address>Calle Quiñones, 10<br/>28015 Madrid<br/>España</address>
          <a href="https://www.google.com/maps/search/?api=1&amp;query=Calle%20Qui%C3%B1ones%2010%2C%2028015%20Madrid%2C%20Espa%C3%B1a" target="_blank" rel="noreferrer" aria-label="Ver la dirección de Madrid en el mapa">Ver en el mapa ↗</a>
        </article>
        <article className="location-card">
          <span className="location-country">Ecuador</span>
          <h3>Loja</h3>
          <address>Calle Clodoveo Carrión y Zoilo Rodríguez<br/>Loja · CP 110108<br/>Ecuador</address>
          <a href="https://www.google.com/maps/search/?api=1&amp;query=Clodoveo%20Carri%C3%B3n%20y%20Zoilo%20Rodr%C3%ADguez%2C%20Loja%2C%20Ecuador" target="_blank" rel="noreferrer" aria-label="Ver la dirección de Loja en el mapa">Ver en el mapa ↗</a>
        </article>
        <article className="location-card">
          <span className="location-country">Argentina</span>
          <h3>Concordia</h3>
          <address>Parque Industrial Concordia<br/>Av. Pres. Juan Domingo Perón S/N<br/>Concordia, Entre Ríos · CP 3200<br/>Argentina</address>
          <a href="https://www.google.com/maps/search/?api=1&amp;query=-31.415818%2C-58.093011" target="_blank" rel="noreferrer" aria-label="Ver la dirección de Concordia en el mapa">Ver en el mapa ↗</a>
        </article>
      </div>
    </section>
    <footer className="landing-footer"><span>◈ SurcoVisor</span><span>Agricultura con datos</span></footer>
  </main>
}
