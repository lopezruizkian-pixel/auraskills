import React from "react";
import { Users, Radio, Wrench, LogIn, Power, ShieldCheck, ChevronRight } from "lucide-react";

function SalaActivaCard({ id, titulo, habilidad, inscritos, capacidad, onClose, onEnter }) {
  const handleClose = () => {
    if (window.confirm("¿Seguro que quieres finalizar la sesión?")) {
      onClose();
    }
  };

  const progress = (inscritos / capacidad) * 100;

  return (
    <div className="premium-active-card">
      <div className="card-energy-core"></div>
      
      <div className="card-top-header">
        <div className="live-status-indicator">
          <div className="pulse-dot"></div>
          <span>TRANSMISIÓN ACTIVA</span>
        </div>
        <div className="card-id-tag">#{id?.toString().slice(-4)}</div>
      </div>

      <div className="card-main-body">
        <h2 className="card-title-neon">{titulo}</h2>
        
        <div className="tech-info-row">
          <div className="tech-badge">
            <Wrench size={16} />
            <span>{habilidad}</span>
          </div>
          <div className="tech-badge magenta">
            <ShieldCheck size={16} />
            <span>Segura</span>
          </div>
        </div>

        <div className="capacity-visualizer">
          <div className="capacity-header">
            <div className="label-with-icon">
              <Users size={18} />
              <span>Capacidad de Alumnos</span>
            </div>
            <span className="capacity-count">{inscritos} / {capacidad}</span>
          </div>
          <div className="tech-progress-bg">
            <div className="tech-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="card-footer-actions">
        <button className="btn-abort-session" onClick={handleClose}>
          <Power size={18} />
          Finalizar
        </button>
        <button className="btn-enter-session" onClick={onEnter}>
          Entrar a la Sala
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default SalaActivaCard;