import { User, Radio, Users, ChevronRight, Info } from "lucide-react";

function MentorCard({ nombre, habilidad, nombreSala, onJoin, onInfo, isJoining, isActive, participantesCount = 0, capacidad_maxima = 10 }) {
  const percentage = Math.min((participantesCount / capacidad_maxima) * 100, 100);
  const isFull = participantesCount >= capacidad_maxima;
  return (
    <div className={`premium-room-card ${isActive ? "active-glow" : ""}`}>
      {/* Header con Badge de Estado */}
      <div className="premium-card-header">
        <div className="premium-badge-group">
          {isActive ? (
            <div className="status-badge live">
              <Radio size={14} className="pulse-icon" />
              <span>SALA EN VIVO</span>
            </div>
          ) : (
            <div className="status-badge offline">
              <Radio size={14} />
              <span>SALA PROGRAMADA</span>
            </div>
          )}
          <div className="category-badge">{habilidad}</div>
        </div>
        <div className="participants-counter">
          <Users size={14} />
          <span>SALA ABIERTA</span>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="premium-card-body">
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
          <div className="mentor-avatar-glow">
            <div className="avatar-inner">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre}`} alt="mentor" />
            </div>
          </div>
          <div className="room-info-main">
            <h3 className="room-title-premium">{nombreSala}</h3>
            <p className="mentor-subtitle">con <span className="mentor-name-highlight">{nombre}</span></p>
          </div>
        </div>
      </div>

      {/* Footer y Acciones */}
      <div className="premium-card-footer">
        <div className="technical-progress-container">
          <div className="tech-label" style={{ color: isFull ? "#ff0055" : "#00ffff" }}>
            {isFull ? "CUPO LLENO" : `CAPACIDAD: ${participantesCount}/${capacidad_maxima}`}
          </div>
          <div className="tech-bar-bg">
            <div 
              className="tech-bar-fill" 
              style={{ 
                width: `${percentage}%`,
                background: isFull ? "linear-gradient(90deg, #ff0055, #ffaa00)" : "linear-gradient(90deg, #00ffff, #ff00ff)",
                boxShadow: isFull ? "0 0 15px rgba(255, 0, 85, 0.5)" : "0 0 15px rgba(0, 255, 255, 0.3)"
              }}
            ></div>
          </div>
        </div>

        <div className="mentor-card-actions-group">
          <button 
            className="premium-action-btn-secondary" 
            onClick={onInfo}
          >
            <Info size={18} />
            <span>Ver detalles</span>
          </button>
          <button 
            className="premium-action-btn join-btn" 
            onClick={onJoin} 
            disabled={isJoining}
          >
            <div className="btn-content">
              <span>{isJoining ? "ACCEDIENDO..." : "ENTRAR A SALA"}</span>
              <ChevronRight size={18} />
            </div>
          </button>
        </div>
      </div>

      {/* Decoración de Esquina */}
      <div className="card-corner-accent"></div>
    </div>
  );
}

export default MentorCard;
