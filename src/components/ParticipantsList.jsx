import React, { useContext, useMemo } from 'react';
import { RoomContext } from '../context/RoomContext';
import { Users, CheckCircle } from 'lucide-react';
import '../Styles/RoomComponents.css';

const ParticipantsList = React.memo(() => {
  const { participants, roomData } = useContext(RoomContext);

  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      if (a.rolInSala === 'mentor' && b.rolInSala !== 'mentor') return -1;
      if (a.rolInSala !== 'mentor' && b.rolInSala === 'mentor') return 1;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [participants]);

  const capacidadMaxima = roomData?.capacidad_maxima || roomData?.limiteEstudiantes || 10;

  return (
    <div className="participants-list">
      <div className="participants-header">
        <div>
          <h3>
            <Users size={18} />
            Participantes
          </h3>
          <p className="participants-subtitle">Anfitrion y asistentes conectados</p>
        </div>
        <span className="participants-count-badge">
          {participants.length} / {capacidadMaxima}
        </span>
      </div>

      <div className="participants-content">
        {sortedParticipants.length === 0 ? (
          <div className="no-participants-text">
            <p>No hay participantes aun</p>
          </div>
        ) : (
          <ul className="participants-ul">
            {sortedParticipants.map((participant) => {
              const isMentor = participant.rolInSala === 'mentor';
              return (
                <li
                  key={participant.id}
                  className={`participant-item ${isMentor ? 'mentor-card-active' : ''}`}
                >
                  <div className={`avatar-container ${isMentor ? 'mentor-avatar-aura' : ''}`}>
                    {participant.fotoPerfil ? (
                      <img 
                        src={participant.fotoPerfil} 
                        alt={participant.nombre} 
                        className="participant-img"
                        onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + participant.nombre + '&background=random'; }}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {participant.nombre.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isMentor && <div className="mentor-badge-mini">M</div>}
                  </div>
                  
                  <div className="participant-details">
                    <p className={`participant-name ${isMentor ? 'mentor-name-glow' : ''}`}>
                      {participant.nombre}
                    </p>
                    <p className="participant-role">
                      {isMentor ? 'Mentor Principal' : 'Estudiante'}
                    </p>
                  </div>
                  
                  {participant.connectionStatus === 'conectado' && (
                    <div className="status-dot-active" title="Conectado"></div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
});

ParticipantsList.displayName = 'ParticipantsList';

export default ParticipantsList;
