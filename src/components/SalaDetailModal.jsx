import React from "react";
import { createPortal } from "react-dom";
import { X, User, BookOpen, Users, LogIn, Info, Code, Palette, Megaphone, Languages, Music, Gamepad2 } from "lucide-react";

const iconMap = {
  'Tecnología': Code,
  'Diseño': Palette,
  'Negocios': Megaphone,
  'Educación': Languages,
  'Arte': Music,
  'Entretenimiento': Gamepad2,
  'Tecnologia': Code,
  'Diseno': Palette,
  'Educacion': Languages,
};

const SalaDetailModal = ({ isOpen, onClose, room, onJoin, isJoining }) => {
  if (!isOpen || !room) return null;

  const Icon = iconMap[room.categoria] || Info;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div className="aura-modal-overlay" onClick={handleOverlayClick}>
      <div className="aura-modal-content sala-detail-modal">
        <button className="aura-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="aura-modal-header-detail">
          <div className="aura-modal-icon-detail">
            <Icon size={32} color="#00ffff" />
          </div>
          <h3 className="aura-modal-title">{room.nombre || room.nombreSala}</h3>
        </div>

        <div className="aura-modal-body-detail">
          <div className="detail-grid">
            <div className="detail-item">
              <User size={18} className="detail-icon" />
              <div>
                <label>Mentor</label>
                <p>{room.mentor_nombre || room.nombre || "Mentor Aura"}</p>
              </div>
            </div>

            <div className="detail-item">
              <BookOpen size={18} className="detail-icon" />
              <div>
                <label>Habilidad</label>
                <span className="mentor-skill-badge">{room.habilidad}</span>
              </div>
            </div>

            <div className="detail-item full-width">
              <div className="technical-progress-container" style={{ width: "100%", margin: "10px 0" }}>
                <div className="tech-label" style={{ fontSize: "0.7rem", color: (room.sessionInfo?.participantsCount || 0) >= (room.capacidad_maxima || 10) ? "#ff0055" : "#00ffff" }}>
                  {(room.sessionInfo?.participantsCount || 0) >= (room.capacidad_maxima || 10) ? "CUPO LLENO" : `CAPACIDAD: ${room.sessionInfo?.participantsCount || 0}/${room.capacidad_maxima || 10}`}
                </div>
                <div className="tech-bar-bg" style={{ height: "8px" }}>
                  <div 
                    className="tech-bar-fill" 
                    style={{ 
                      width: `${Math.min(((room.sessionInfo?.participantsCount || 0) / (room.capacidad_maxima || 10)) * 100, 100)}%`,
                      background: (room.sessionInfo?.participantsCount || 0) >= (room.capacidad_maxima || 10) ? "linear-gradient(90deg, #ff0055, #ffaa00)" : "linear-gradient(90deg, #00ffff, #ff00ff)",
                      height: "100%"
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="detail-item full-width">
              <div className="description-container">
                <label>Descripción de la sala</label>
                <p className="detail-description">
                  {room.descripcion || "Esta sala no tiene una descripción detallada, pero el mentor te espera para aprender juntos."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="aura-modal-actions">
          <button className="aura-modal-btn aura-btn-cancel" onClick={onClose}>
            Cerrar
          </button>
          <button 
            className="aura-modal-btn aura-btn-confirm" 
            onClick={() => {
              onJoin();
              onClose();
            }}
            disabled={isJoining}
          >
            <LogIn size={18} style={{ marginRight: "8px" }} />
            {isJoining ? "Entrando..." : "Unirse a Sala"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SalaDetailModal;
