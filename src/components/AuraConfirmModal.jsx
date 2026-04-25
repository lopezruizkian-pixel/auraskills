import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, LogOut, Power, X } from 'lucide-react';
import '../Styles/Mentores.css'; // Usamos los estilos que ya funcionan en tus modales

const AuraConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar', 
  type = 'danger' 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger': return <Trash2 size={32} />;
      case 'logout': return <LogOut size={32} />;
      case 'power': return <Power size={32} />;
      case 'warning': return <AlertTriangle size={32} />;
      default: return <AlertTriangle size={32} />;
    }
  };

  const getAccentColor = () => {
    if (type === 'warning') return '#ff00ff'; // Magenta para advertencias
    return type === 'danger' || type === 'logout' || type === 'power' ? '#ff0055' : '#00ffff';
  };

  const isDanger = type === 'danger' || type === 'logout' || type === 'power';
  const isWarning = type === 'warning';

  return createPortal(
    <div className='aura-modal-overlay' onClick={handleOverlayClick}>
      <div className='aura-modal-content' style={{ 
        maxWidth: '400px', 
        width: '90%', 
        textAlign: 'center', 
        padding: '2rem',
        border: `1px solid rgba(${isDanger ? '255, 0, 85' : isWarning ? '255, 0, 255' : '0, 255, 255'}, 0.4)` 
      }}>
        <button className="aura-modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className='aura-modal-icon-detail' style={{ 
          background: `rgba(${isDanger ? '255, 0, 85' : isWarning ? '255, 0, 255' : '0, 255, 255'}, 0.08)`,
          color: getAccentColor(),
          marginBottom: '1.2rem',
          padding: '15px',
          display: 'inline-flex',
          border: `1px solid rgba(${isDanger ? '255, 0, 85' : isWarning ? '255, 0, 255' : '0, 255, 255'}, 0.2)`
        }}>
          {getIcon()}
        </div>

        <h3 className='aura-modal-title' style={{ marginBottom: '0.8rem', color: getAccentColor(), fontSize: '1.5rem' }}>{title}</h3>
        <p className='aura-modal-text' style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.8rem' }}>
          {message}
        </p>

        <div className='aura-modal-actions' style={{ gap: '0.8rem' }}>
          <button 
            type='button' 
            className='aura-modal-btn aura-btn-confirm' 
            style={{ 
              flex: 1,
              padding: '0.8rem 1.5rem',
              background: isDanger 
                ? 'linear-gradient(135deg, #ff0055, #a00037)' 
                : isWarning 
                ? 'linear-gradient(135deg, #ff00ff, #7000ff)'
                : 'linear-gradient(135deg, #00ffff, #0088ff)',
              color: (isDanger || isWarning) ? '#fff' : '#0a0014',
              boxShadow: `0 8px 20px rgba(${isDanger ? '255, 0, 85' : isWarning ? '255, 0, 255' : '0, 255, 255'}, 0.3)`
            }} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button 
            type='button' 
            className='aura-modal-btn aura-btn-cancel' 
            onClick={onClose}
            style={{ flex: 1 }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuraConfirmModal;
