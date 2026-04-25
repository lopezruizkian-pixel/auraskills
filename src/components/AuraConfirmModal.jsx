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
      case 'danger': return <Trash2 size={40} />;
      case 'logout': return <LogOut size={40} />;
      case 'power': return <Power size={40} />;
      default: return <AlertTriangle size={40} />;
    }
  };

  const getAccentColor = () => {
    return type === 'danger' || type === 'logout' || type === 'power' ? '#ff00ff' : '#00ffff';
  };

  return createPortal(
    <div className='aura-modal-overlay' onClick={handleOverlayClick}>
      <div className='aura-modal-content' style={{ maxWidth: '450px', width: '90%', textAlign: 'center' }}>
        <button className="aura-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className='aura-modal-icon-detail' style={{ 
          background: `rgba(${getAccentColor() === '#ff00ff' ? '255, 0, 255' : '0, 255, 255'}, 0.1)`,
          color: getAccentColor(),
          marginBottom: '1.5rem',
          display: 'inline-flex'
        }}>
          {getIcon()}
        </div>

        <h3 className='aura-modal-title' style={{ marginBottom: '1rem' }}>{title}</h3>
        <p className='aura-modal-text' style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '2rem' }}>
          {message}
        </p>

        <div className='aura-modal-actions' style={{ gap: '1rem' }}>
          <button 
            type='button' 
            className='aura-modal-btn aura-btn-confirm' 
            style={{ 
              flex: 1,
              background: getAccentColor() === '#ff00ff' 
                ? 'linear-gradient(135deg, #ff00ff, #7000ff)' 
                : 'linear-gradient(135deg, #00ffff, #0088ff)',
              color: getAccentColor() === '#ff00ff' ? '#fff' : '#0a0014',
              boxShadow: `0 10px 25px rgba(${getAccentColor() === '#ff00ff' ? '255, 0, 255' : '0, 255, 255'}, 0.3)`
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
