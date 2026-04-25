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
  const processedIds = useRef(new Set());

  useEffect(() => {
    // Si la lista de reacciones se vacía en el contexto, limpiamos nuestra memoria
    if (reactions.length === 0) {
      processedIds.current.clear();
      return;
    }

    // Buscamos reacciones que no hayamos procesado todavía
    const newItems = reactions
      .filter(r => !processedIds.current.has(r.id))
      .map(r => {
        processedIds.current.add(r.id);
        return {
          ...r,
          emojiUrl: EMOJI_MAP[r.emoji] || r.emoji,
          instanceId: `inst-${r.id}-${Math.random().toString(36).substr(2, 5)}`,
          leftPos: Math.random() * 80 + 10,
          duration: 3 + Math.random() * 2
        };
      });

    if (newItems.length > 0) {
      // Añadimos las nuevas a la lista visual
      setActiveReactions(prev => [...prev, ...newItems]);

      // Programamos la limpieza visual individual
      newItems.forEach(item => {
        setTimeout(() => {
          setActiveReactions(prev => prev.filter(r => r.instanceId !== item.instanceId));
        }, 5500);
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
