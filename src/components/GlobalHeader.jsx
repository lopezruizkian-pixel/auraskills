import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, ArrowLeft } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { storage } from "../services/storage";
import Notificaciones from "./Notificaciones";
import "../Styles/GlobalHeader.css";

const titles = {
  "/home": "Dashboard",
  "/buscar-habilidades": "Explorar Habilidades",
  "/mentores": "Mentores Disponibles",
  "/historial": "Historial de Sesiones",
  "/salas-activas": "Salas en Vivo",
  "/configuracion": "Configuracion",
  "/perfil": "Mi Perfil",
};

function GlobalHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = () => {
    if (location.pathname === "/salas-activas") {
      const params = new URLSearchParams(location.search);
      const habilidad = params.get("habilidad");
      return habilidad ? `Salas de ${habilidad}` : "Salas en Vivo";
    }
    return titles[location.pathname] || "AuraSkill";
  };

  const rol = storage.get("userRole");

  const showBack = location.pathname !== "/home" && location.pathname !== "/";

  return (
    <header className="global-header">
      <div className="header-left-group">
        {showBack && (
          <button 
            className="header-back-btn" 
            onClick={() => navigate(-1)}
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="page-title">{getTitle()}</h1>
      </div>
      <div className="header-actions-right">
        {rol !== "mentor" && <Notificaciones />}
        <div
          className="header-icon-button user-icon"
          onClick={() => navigate("/perfil")}
          style={{ cursor: "pointer" }}
        >
          <User size={24} />
        </div>
      </div>
    </header>
  );
}

export default GlobalHeader;
