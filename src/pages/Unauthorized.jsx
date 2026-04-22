import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import "../Styles/Home.css"; // Reusing some base styles

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="neon-card" style={{ 
        maxWidth: '500px', 
        padding: '3rem', 
        textAlign: 'center',
        border: '1px solid var(--neon-pink)',
        boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)'
      }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <ShieldAlert size={80} color="var(--neon-pink)" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.5))' }} />
        </div>
        
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem', 
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Acceso Denegado
        </h1>
        
        <p style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: '1.1rem', 
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          Lo sentimos, no tienes los permisos necesarios para acceder a este módulo. 
          Esta sección está reservada para otro rol de usuario.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="secondary-btn-s" 
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={18} />
            Volver
          </button>
          
          <button 
            className="primary-btn-s" 
            onClick={() => navigate("/home")}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Home size={18} />
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
