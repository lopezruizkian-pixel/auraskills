import React from "react";

function HistorialRow({ fecha, sala, habilidad, mentor, duracion }) {
  return (
    <div className="historial-row-neon">
      <div className="historial-cell">{fecha}</div>
      <div className="historial-cell" style={{ fontWeight: 600, color: "#fff" }}>{sala}</div>
      <div className="historial-cell">{habilidad}</div>
      <div className="historial-cell">{mentor}</div>
      <div className="historial-cell" style={{ color: "#00ffff" }}>{duracion}</div>
    </div>
  );
}

export default HistorialRow;