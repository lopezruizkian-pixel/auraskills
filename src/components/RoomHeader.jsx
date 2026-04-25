import React, { useContext, useEffect, useMemo, useState } from 'react';
import { RoomContext } from '../context/RoomContext';
import { Power, DoorOpen, Users, Clock, Shield } from 'lucide-react';
import '../Styles/RoomComponents.css';

const formatDuration = (totalSeconds = 0) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(safeSeconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

const getMentorName = (roomData, sessionInfo, participants) => {
  const mentorParticipant = participants.find((participant) => participant.rolInSala === 'mentor');

  if (mentorParticipant?.nombre) {
    return mentorParticipant.nombre;
  }

  if (sessionInfo?.mentorName) {
    return sessionInfo.mentorName;
  }

  if (typeof roomData?.mentor === 'string') {
    return roomData.mentor;
  }

  if (roomData?.mentor?.nombre) {
    return roomData.mentor.nombre;
  }

  return 'Mentor pendiente';
};

function RoomHeader({ roomId, isMentor = false, onLeaveSession, onBack, isLeaving = false }) {
  const { roomData, participants, connectionStatus, sessionInfo } = useContext(RoomContext);
  const [now, setNow] = useState(Date.now());

  const isSessionActive = Boolean(sessionInfo?.isActive && sessionInfo?.startedAt);

  useEffect(() => {
    if (!isSessionActive) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isSessionActive]);

  const elapsedSeconds = useMemo(() => {
    if (!sessionInfo) {
      return 0;
    }

    if (sessionInfo.isActive && sessionInfo.startedAt) {
      // LÓGICA DEL GUARDIÁN DEL TIEMPO:
      // Recuperar el inicio original de la sesión desde el localStorage si existe.
      const id = roomId || sessionInfo.roomId || sessionInfo.id;
      const storageKey = `room_start_${id}`;
      const savedStart = localStorage.getItem(storageKey);
      
      // Si no hay nada guardado, lo guardamos ahora
      if (!savedStart && id) {
        localStorage.setItem(storageKey, sessionInfo.startedAt);
      }

      const startedAtMs = new Date(savedStart || sessionInfo.startedAt).getTime();
      return Math.max(0, Math.floor((now - startedAtMs) / 1000));
    }

    return sessionInfo.durationSeconds || 0;
  }, [now, sessionInfo, roomId]);

  const mentorName = useMemo(
    () => getMentorName(roomData, sessionInfo, participants),
    [participants, roomData, sessionInfo]
  );

  const getStatusColor = () => {
    if (isSessionActive) {
      return '#00ff88';
    }

    switch (connectionStatus) {
      case 'conectando':
        return '#ffaa00';
      case 'error':
        return '#ff0055';
      case 'conectado':
        return '#00ffff';
      default:
        return '#808080';
    }
  };

  const getStatusText = () => {
    if (isSessionActive) {
      return 'Sesion en vivo';
    }

    switch (connectionStatus) {
      case 'conectando':
        return 'Conectando...';
      case 'error':
        return 'Error de conexion';
      case 'conectado':
        return 'Lista para comenzar';
      default:
        return 'Desconectado';
    }
  };

  return (
    <div className="room-header-compact">
      <div className="room-header-left">
        <div className="room-title-group">
          <h1 className="room-title-compact">{roomData?.nombre || 'Sala de mentoria'}</h1>
        </div>
      </div>

      <div className="room-header-center">
        <div className="room-status-capsule">
          <div className="status-indicator">
            <div className="status-dot pulse"></div>
            <span>En vivo</span>
          </div>
          <div className="status-divider"></div>
          <div className="status-metric">
            <Users size={14} />
            <span>{participants.length}/{roomData?.capacidad_maxima || 5}</span>
          </div>
          <div className="status-divider"></div>
          <div className="status-metric">
            <Clock size={14} />
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      <div className="room-header-right">
        <div className="room-header-actions">
          {isMentor && (
            <button
              type="button"
              className="btn-action-subtle"
              onClick={onBack}
              disabled={isLeaving}
            >
              <DoorOpen size={16} />
              <span>Solo salir</span>
            </button>
          )}

          <button
            type="button"
            className={`btn-action-primary ${isMentor ? 'mentor' : 'student'}`}
            onClick={onLeaveSession}
            disabled={isLeaving}
          >
            {isMentor ? <Power size={16} /> : <DoorOpen size={16} />}
            <span>{isLeaving ? 'Saliendo...' : isMentor ? 'Finalizar sesión' : 'Salir de la sala'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomHeader;
