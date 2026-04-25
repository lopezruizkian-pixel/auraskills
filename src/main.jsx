import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './Styles/themes.css'
import { ThemeProvider } from "./context/ThemeContext";
import App from './App.jsx'

// Limpieza de datos antiguos en localStorage tras la migración a sessionStorage encriptado
const keysToClear = ['token', 'userId', 'userName', 'userRole', 'salaActiva', 'historialSalas'];
keysToClear.forEach(key => localStorage.removeItem(key));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)