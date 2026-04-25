import React, { useEffect, useContext, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock3, Mic2, ShieldCheck } from 'lucide-react';
import { RoomContext } from '../context/RoomContext';
import { useRoom } from '../hooks/useRoom';
import { useWebSocket } from '../hooks/useWebSocket';
import RoomHeader from '../components/RoomHeader';
import ChatRoom from '../components/ChatRoom';
import ParticipantsList from '../components/ParticipantsList';
import ReactionsContainer from '../components/ReactionsContainer';
import { storage } from "../services/storage";
import { useConfirm } from "../context/ConfirmContext";
import '../Styles/RoomPage.css';

const formatSessionStart = (sessionInfo) => {
  if (!sessionInfo?.startedAt) {
    return 'Se iniciara cuando entre el mentor';
  }
  const date = new Date(sessionInfo.startedAt);
  if (Number.isNaN(date.getTime())) {
    return 'Sesion en preparacion';
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getMentorName = (roomData, sessionInfo, participants) => {
  const mentorParticipant = participants.find((p) => p.rolInSala === 'mentor');
  if (mentorParticipant?.nombre) return mentorParticipant.nombre;
  if (sessionInfo?.mentorName) return sessionInfo.mentorName;
  if (typeof roomData?.mentor === 'string') return roomData.mentor;
  if (roomData?.mentor?.nombre) return roomData.mentor.nombre;
  return 'Mentor pendiente';
};

function RoomPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const {
    initRoom,
    roomData,
    sessionInfo,
    participants,
    error,
    connectionStatus,
  } = useContext(RoomContext);
  
  const { askConfirmation } = useConfirm();
  const [isLeaving, setIsLeaving] = useState(false);

  const userId = storage.get('userId') || `user-${Date.now()}`;
  const userName = storage.get('userName') || 'Usuario Anonimo';
  const userRole = storage.get('userRole') || 'alumno';
  const userAvatar = '👤';
  const isMentor = userRole === 'mentor';

  const { isLoading: roomLoading } = useRoom(roomId);
  const { sendMessage, sendReaction, leaveCurrentRoom, notifyPresenceChanged } = useWebSocket(
    roomId,
    userId,
    userName,
    userAvatar,
    userRole
  );

  useEffect(() => {
    if (roomId) {
      initRoom(roomId);
    } else {
      navigate('/home');
    }
  }, [roomId, initRoom, navigate]);

  const mentorName = useMemo(
    () => getMentorName(roomData, sessionInfo, participants),
    [participants, roomData, sessionInfo]
  );

  const handleLeaveSession = () => {
    if (isLeaving) return;

    askConfirmation({
      title: isMentor ? '¿FINALIZAR MENTORÍA?' : '¿SALIR DE LA SALA?',
      message: isMentor 
        ? "Esta acción cerrará la sala para todos los participantes." 
        : "¿Estás seguro que deseas abandonar la sesión?",
      confirmText: isMentor ? 'SÍ, FINALIZAR' : 'SÍ, SALIR',
      cancelText: 'CANCELAR',
      type: isMentor ? 'power' : 'danger',
      onConfirm: async () => {
        setIsLeaving(true);
        try {
          if (isMentor) {
            const { closeRoom } = await import('../services/roomService');
            await closeRoom(roomId);
          }
          leaveCurrentRoom();
          storage.remove('salaActiva');
          localStorage.removeItem(`room_start_${roomId}`);
          navigate('/home', { replace: true });
        } catch (err) {
          console.error('Error al finalizar sesión:', err);
          storage.remove('salaActiva');
          navigate('/home', { replace: true });
        }
      }
    });
  };

  const handleBack = () => {
    askConfirmation({
      title: '¿SALIR TEMPORALMENTE?',
      message: '¿Deseas salir al inicio? La sala seguirá activa para los alumnos.',
      confirmText: 'SÍ, SALIR',
      cancelText: 'CANCELAR',
      type: 'danger',
      onConfirm: () => {
        leaveCurrentRoom();
        storage.remove('salaActiva');
        navigate('/home', { replace: true });
      }
    });
  };

  if (roomLoading) {
    return (
      <div className="loading-global-container">
        <div className="aura-spinner"></div>
        <p className="loading-text-neon">Sincronizando Sala...</p>
      </div>
    );
  }

  if (error && connectionStatus === 'error') {
    return (
      <div className="room-error">
        <div className="error-content">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/home')} className="primary-btn">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-page">
      <RoomHeader
        roomId={roomId}
        isMentor={isMentor}
        onLeaveSession={handleLeaveSession}
        onBack={handleBack}
        isLeaving={isLeaving}
      />

      <div className="room-container">
        <aside className="room-sidebar">
          <section className="sidebar-section session-sidebar-card premium-room-card">
            <span className="session-sidebar-kicker">Habilidad</span>
            <h3 className="habilidad-highlight">{roomData?.habilidad || 'General'}</h3>
            <div className="sidebar-card-divider"></div>
            <p className="sidebar-description-text">
              {roomData?.descripcion?.trim() || 'Sin descripción adicional para esta sesión.'}
            </p>
          </section>
          <ParticipantsList />
        </aside>

        <section className="room-main-panel">
          <div className="room-chat-area">
            <ChatRoom 
              sendMessage={sendMessage} 
              sendReaction={sendReaction} 
            />
          </div>
        </section>
      </div>

      <ReactionsContainer />

      {connectionStatus !== 'conectado' && (
        <div className="connection-status-banner">
          <span className="pulse"></span>
          {connectionStatus === 'conectando' ? 'Conectando...' : 'Reconectando...'}
        </div>
      )}
    </div>
  );
}

export default RoomPage;
