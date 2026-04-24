import React from "react";

function SkillTag({ nombre, nivel, color, onClick }) {
  return (
    <div 
      className="skill-tag" 
      style={{ border: `1px solid ${color}`, cursor: onClick ? 'pointer' : 'default' }}
      onClick={() => onClick && onClick(nombre)}
    >
      <span className="skill-dot" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></span>
      <span className="skill-nombre">{nombre}</span>
      <span className="skill-nivel" style={{ color: color }}>{nivel}</span>
    </div>
  );
}

export default SkillTag;