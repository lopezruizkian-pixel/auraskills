import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import Sidebar from "../components/Sidebar";
import GlobalHeader from "../components/GlobalHeader";
import { storage } from "../services/storage";
import "../Styles/Home.css";

function Unauthorized() {
  const navigate = useNavigate();
  const rol = storage.get("userRole") || "alumno";

  return (
    <div className="home-container">
      <div className="home-main-layout">
        <Sidebar rol={rol} />
        <main className="home-content">
          <GlobalHeader />
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '70vh',
            padding: '2rem'
          }}>
            <div className="neon-card" style={{ 
              maxWidth: '550px', 
              padding: '3rem', 
              textAlign: 'center',
              border: '1px solid var(--neon-pink)',
              boxShadow: '0 0 30px rgba(255, 0, 255, 0.15)',
              background: 'rgba(10, 10, 15, 0.9)'
            }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <ShieldAlert size={70} color="var(--neon-pink)" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.5))' }} />
              </div>
              
              <h1 style={{ 
                fontSize: '2.2rem', 
                marginBottom: '1rem', 
                color: '#fff',
                fontWeight: '800',
                letterSpacing: '1px'
              }}>
                Módulo Restringido
              </h1>
              
              <p style={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '1.1rem', 
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                No tienes permisos para acceder a esta sección. 
                Tu rol actual de <strong>{rol.toUpperCase()}</strong> no permite la entrada a este módulo específico.
              </p>
              
              <p style={{ 
                color: 'var(--neon-blue)', 
                fontSize: '0.9rem',
                fontStyle: 'italic',
                marginTop: '2rem'
              }}>
                Utiliza el menú lateral para navegar a las secciones permitidas.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Unauthorized;
