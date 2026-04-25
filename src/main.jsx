import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Limpieza profunda de datos antiguos en localStorage
const keysToClear = ['token', 'userId', 'userName', 'userRole', 'salaActiva', 'historialSalas', 'theme', 'aura-theme'];
keysToClear.forEach(key => localStorage.removeItem(key));

// Limpiar dinámicamente cualquier rastro de sesiones de salas antiguas
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('room_start_')) {
    localStorage.removeItem(key);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
)