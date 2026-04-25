import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { RoomProvider } from './context/RoomContext';
import { ConfirmProvider } from './context/ConfirmContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Home from './pages/Home';
import Mentores from './pages/Mentores';
import HistorialSalasAprendiz from './pages/HistorialSalasAprendiz';
import SalasActivas from './pages/SalasActivas';
import RoomPage from './pages/RoomPage';
import Configuracion from './pages/Configuracion';
import Perfil from './pages/Perfil';
import Unauthorized from './pages/Unauthorized';

import { useEffect, useState } from 'react';
import { validateToken } from './services/authService';
import { useAuth } from './hooks/useAuth';

function App() {
  const { setAuthUser, logout } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await validateToken();
        if (user) {
          setAuthUser({
            userId: user.id,
            userName: user.nombre,
            userRole: user.rol
          });
        } else {
          // Si no hay sesión válida al arrancar, NO redirigimos al login.
          // Solo limpiamos si había restos de una sesión anterior.
          const { storage } = await import('./services/storage');
          storage.clear();
        }
      } catch (err) {
        // En caso de error (401), limpiamos en silencio y permitimos ver la landing
        try {
          const { storage } = await import('./services/storage');
          storage.clear();
        } catch { /* ignored */ }
      } finally {
        setIsChecking(false);
      }
    };
    initAuth();
  }, [setAuthUser]);

  if (isChecking) {
    return (
      <div className="loading-global-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#020205' }}>
        <div className="aura-spinner"></div>
        <p className="loading-text-neon" style={{ marginTop: '1.5rem', fontSize: '1.2rem' }}>Iniciando AuraSkill...</p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <ConfirmProvider>
        <RoomProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/mentores" 
              element={
                <ProtectedRoute requiredRole="alumno">
                  <Mentores />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/historial" 
              element={
                <ProtectedRoute>
                  <HistorialSalasAprendiz />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/salas-activas" 
              element={
                <ProtectedRoute requiredRole="mentor">
                  <SalasActivas />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/sala/:id" 
              element={
                <ProtectedRoute>
                  <RoomPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/configuracion" 
              element={<Navigate to="/perfil" replace />}
            />

            <Route 
              path="/perfil" 
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              } 
            />

            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RoomProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;