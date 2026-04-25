import React, { useContext, useEffect, useState, useRef } from 'react';
import { RoomContext } from '../context/RoomContext';
import { createPortal } from 'react-dom';
import '../Styles/RoomComponents.css';

function ReactionsContainer() {
  const { reactions } = useContext(RoomContext);
  const [activeReactions, setActiveReactions] = useState([]);
  const lastProcessedIndex = useRef(0);

  useEffect(() => {
    // Si hay nuevas reacciones que no hemos procesado
    if (reactions.length > lastProcessedIndex.current) {
      const newItems = reactions.slice(lastProcessedIndex.current).map(r => ({
        ...r,
        instanceId: Math.random().toString(36).substr(2, 9), // ID único para esta instancia visual
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
          <img src={reaction.emoji} alt="reaction" className="reaction-emoji-img" />
          <p className="reaction-user">{reaction.userName}</p>
        </div>
      ))}
    </div>,
    document.body
  );
}

export default ReactionsContainer;
