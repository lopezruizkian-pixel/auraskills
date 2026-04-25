import React, { useState, useContext } from 'react';
import { Laugh, ThumbsUp, Heart, Flame, Smile } from 'lucide-react';
import '../Styles/RoomComponents.css';

const REACTIONS = [
  { 
    id: 'heart',
    name: 'Me encanta', 
    url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Heart/3D/heart_3d.png' 
  },
  { 
    id: 'fire',
    name: 'Fuego', 
    url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fire/3D/fire_3d.png' 
  },
  { 
    id: 'rocket',
    name: 'A tope', 
    url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png' 
  },
  { 
    id: 'star',
    name: 'Estrella', 
    url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Star/3D/star_3d.png' 
  },
  { 
    id: 'sparkles',
    name: 'Brillante', 
    url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sparkles/3D/sparkles_3d.png' 
  },
];

function ReactionsMenu({ onSelect }) {
  return (
    <div className="reactions-menu open">
      <div className="reactions-menu-content">
        {REACTIONS.map((reaction) => (
          <button
            key={reaction.id}
            className="reaction-btn"
            onClick={() => onSelect(reaction.url)}
            title={reaction.name}
            aria-label={reaction.name}
          >
            <img src={reaction.url} alt={reaction.name} className="reaction-emoji-img-s" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ReactionsMenu;
