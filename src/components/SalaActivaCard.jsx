import { Users, Radio, Wrench, LogIn, Power, BookOpen, ChevronRight } from "lucide-react";
import { useConfirm } from "../context/ConfirmContext";

function SalaActivaCard({ id, titulo, habilidad, inscritos, capacidad, onClose, onEnter }) {
  const { askConfirmation } = useConfirm();
  const handleClose = () => {
    askConfirmation({
      title: '¿FINALIZAR SESIÓN?',
      message: 'Se cerrará la sala para todos los participantes. ¿Deseas continuar?',
      confirmText: 'SÍ, FINALIZAR',
      cancelText: 'CANCELAR',
      type: 'power',
      onConfirm: () => onClose(),
    });
  };

  const progress = (inscritos / capacidad) * 100;

  return (
    <article className="premium-room-card" style={{ width: "min(100%, 540px)", margin: "0 auto" }}>
      <div className="room-card-glow"></div>
      
      <div className="room-header">
        <div className="live-badge">
          <span className="live-dot"></span>
          EN VIVO
        </div>
        <div className="room-status-text" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>
          SALA ACTIVA
        </div>
      </div>

      <div className="room-main-info">
        <h3 className="room-title-premium">{titulo}</h3>
        <div className="room-skill-badge">
          <BookOpen size={14} />
          {habilidad || "Habilidad general"}
        </div>
      </div>

      <div className="room-stats-premium">
        <div className="stat-item">
          <div className="stat-info">
            <Users size={18} className="icon-cyan" />
            <span>{inscritos} / {capacidad} Alumnos</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="room-actions-premium" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "15px", marginTop: "10px" }}>
        <button 
          className="secondary-btn-s" 
          onClick={handleClose}
          style={{ 
            height: "56px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "10px",
            background: "rgba(255, 0, 85, 0.08)", 
            borderColor: "rgba(255, 0, 85, 0.4)", 
            color: "#ff3366",
            borderRadius: "14px",
            fontWeight: "700",
            padding: "0"
          }}
        >
          <Power size={20} />
          Finalizar
        </button>
        <button 
          className="enter-room-btn" 
          onClick={onEnter} 
          style={{ 
            height: "56px", 
            margin: "0", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            padding: "0"
          }}
        >
          Entrar a la sala
          <ChevronRight size={20} />
        </button>
      </div>
    </article>
  );
}

export default SalaActivaCard;