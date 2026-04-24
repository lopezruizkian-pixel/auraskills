import { Link } from "react-router-dom";
import { Users, Zap, Shield, ChevronRight } from "lucide-react";
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
          <Link to="/registro" className="primary-btn-neon-s">Unirse a la Red</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-badge">Beta v2.0 • Cyber-Luxury Edition</div>
          <h1 className="hero-main-title">
            Domina el Futuro del <span className="text-gradient">Conocimiento</span>
          </h1>
          <p className="hero-main-subtitle">
            Conecta con mentores de élite en tiempo real. Una red neuronal de aprendizaje diseñada para la nueva era digital.
          </p>
          <div className="hero-cta-group">
            <Link to="/registro" className="cta-primary">
              Comenzar Protocolo <ChevronRight size={20} />
            </Link>
            <div className="hero-stats-mini">
              <div className="mini-stat"><strong>+500</strong> Mentores</div>
              <div className="mini-stat"><strong>24/7</strong> Soporte</div>
            </div>
          </div>
        </div>
        
        <div className="hero-visual-element">
          <div className="aura-core"></div>
          <div className="aura-ring"></div>
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon-box"><Zap size={24} /></div>
          <h3>Salas Dinámicas</h3>
          <p>Interacción instantánea con video y chat de baja latencia para un aprendizaje sin barreras.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box"><Users size={24} /></div>
          <h3>Mentores de Élite</h3>
          <p>Acceso directo a profesionales activos en la industria tecnológica y creativa mundial.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box"><Shield size={24} /></div>
          <h3>Protocolo Seguro</h3>
          <p>Tu privacidad y progreso son nuestra prioridad. Datos cifrados y entorno de confianza.</p>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="landing-footer">
        <p>© 2024 AuraSkill Network. Todos los sistemas operativos.</p>
      </footer>
    </div>
  );
}

export default Landing;
