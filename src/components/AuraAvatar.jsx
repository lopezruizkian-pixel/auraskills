import React from 'react';

/**
 * AuraAvatar - Componente centralizado para avatares premium
 * @param {string} seed - Semilla para generar el avatar (ej: usuario o nombre)
 * @param {number} size - Tamaño en píxeles
 * @param {string} className - Clases adicionales de CSS
 */
const AuraAvatar = ({ seed, size = 100, className = "" }) => {
  // Usamos el estilo 'lorelei' que es más detallado y premium que 'avataaars'
  // También podrías probar con 'micah' o 'notionists'
  const style = 'lorelei'; 
  const baseUrl = `https://api.dicebear.com/7.x/${style}/svg`;
  
  // Normalizamos la semilla para evitar problemas con caracteres especiales
  const safeSeed = encodeURIComponent(seed || 'AuraUser');
  
  const avatarUrl = `${baseUrl}?seed=${safeSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9&backgroundType=gradientLinear`;

  return (
    <div 
      className={`aura-avatar-container ${className}`}
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(0,255,255,0.2)'
      }}
    >
      <img 
        src={avatarUrl} 
        alt="avatar" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => {
          e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${safeSeed}`;
        }}
      />
    </div>
  );
};

export default AuraAvatar;
