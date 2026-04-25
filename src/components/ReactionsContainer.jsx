import React, { useContext, useEffect, useState, useRef } from 'react';
import { RoomContext } from '../context/RoomContext';
import { createPortal } from 'react-dom';
import '../Styles/RoomComponents.css';

const EMOJI_MAP = {
  heart: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Red%20heart/3D/red_heart_3d.png',
  like: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Thumbs%20up/Default/3D/thumbs_up_3d_default.png',
  laugh: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Face%20with%20tears%20of%20joy/3D/face_with_tears_of_joy_3d.png',
  thinking: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Thinking%20face/3D/thinking_face_3d.png',
  fire: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Fire/3D/fire_3d.png',
  rocket: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png'
};

function ReactionsContainer() {
  const { reactions } = useContext(RoomContext);
  const [activeReactions, setActiveReactions] = useState([]);
  const lastProcessedIndex = useRef(0);

  useEffect(() => {
    // Si hay nuevas reacciones que no hemos procesado
    if (reactions.length > lastProcessedIndex.current) {
      const newItems = reactions.slice(lastProcessedIndex.current).map(r => ({
        ...r,
        emojiUrl: EMOJI_MAP[r.emoji] || r.emoji, // Usamos el mapa o la URL si ya viene completa
        instanceId: Math.random().toString(36).substr(2, 9),
        leftPos: Math.random() * 80 + 10,
        duration: 3 + Math.random() * 2
      }));

      lastProcessedIndex.current = reactions.length;

      // Añadimos las nuevas a la lista
      setActiveReactions(prev => [...prev, ...newItems]);

      // Programamos la limpieza individual de cada una después de su animación
      newItems.forEach(item => {
        setTimeout(() => {
          setActiveReactions(prev => prev.filter(r => r.instanceId !== item.instanceId));
        }, 5000); // 5 segundos es suficiente para la animación completa
      });
    }
  }, [reactions]);

  if (activeReactions.length === 0) return null;

  return createPortal(
    <div className="reactions-container">
      {activeReactions.map((reaction) => (
        <div
          key={reaction.instanceId}
          className="reaction-bubble"
          style={{
            left: `${reaction.leftPos}%`,
            '--float-duration': `${reaction.duration}s`
          }}
        >
          <img src={reaction.emojiUrl} alt="reaction" className="reaction-emoji-img" />
          <p className="reaction-user">{reaction.userName}</p>
        </div>
      ))}
    </div>,
    document.body
  );
}

export default ReactionsContainer;
