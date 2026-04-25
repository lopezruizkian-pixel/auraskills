import { Link } from "react-router-dom";
import { Users, Zap, Shield, ChevronRight } from "lucide-react";
import mascotaImg from "../assets/mascota.png";
import "../Styles/Landing.css";

function Landing() {
  return (
    <div className="landing-container">
      {/* Navbar Superior */}
      <nav className="landing-nav">
        <div className="nav-logo">
          AURA<span className="text-glow">SKILL</span>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="nav-link">Iniciar Sesión</Link>
          <Link to="/registro" className="nav-cta-btn">Regístrate Gratis</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-badge">Aprende • Enseña • Conecta</div>
          <h1 className="hero-main-title">
            Tu camino al éxito con <span className="text-gradient">Mentoría en Vivo</span>
          </h1>
          <p className="hero-main-subtitle">
            Conecta con expertos de todo el mundo en salas interactivas. Aprende habilidades reales en tiempo real con la mejor comunidad.
          </p>
          <div className="hero-cta-group">
            <Link to="/registro" className="cta-primary">
              ¡Quiero empezar ya! <ChevronRight size={20} />
            </Link>
            <div className="hero-stats-mini">
              <div className="mini-stat"><strong>+500</strong> Mentores</div>
              <div className="mini-stat"><strong>24/7</strong> Online</div>
            </div>
          </div>
        </div>
        
        <div className="hero-visual-element">
          <img src={mascotaImg} alt="Mascota Aura" className="landing-mascota" />
          <div className="aura-core"></div>
          <div className="aura-ring"></div>
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon-box"><Zap size={24} /></div>
          <h3>Salas Interactivas</h3>
          <p>Únete a salas dinámicas con chat fluido y reacciones en tiempo real. Aprende haciendo con la guía de tu mentor.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box"><Users size={24} /></div>
          <h3>Mentores Expertos</h3>
          <p>Encuentra profesionales dispuestos a compartir su experiencia y guiarte en tu carrera.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box"><Shield size={24} /></div>
          <h3>Seguridad Total</h3>
          <p>Tu privacidad es lo primero. Entorno seguro y moderado para una mejor experiencia.</p>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="landing-footer">
        <p>© 2024 AuraSkill. La plataforma de aprendizaje del futuro.</p>
      </footer>
    </div>
  );
}

export default Landing;
