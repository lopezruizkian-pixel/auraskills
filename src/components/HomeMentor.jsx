import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, MessagesSquare, Clock, User, ChevronRight } from "lucide-react";
import PerfilStatCard from "./PerfilStatCard";
import { fetchActiveRooms, getUserRoomHistory } from "../services/roomService";
import { getDashboardSocket } from "../services/socketConfig";
import GlobalHeader from "../components/GlobalHeader";
import { storage } from "../services/storage";
import { encodeId } from "../utils/obfuscation";
import "../Styles/Mentores.css";

function HomeMentor() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ salasCreadas: 0, alumnosAyudados: 0, horasMentoreando: 0 });

  const userId = storage.get("userId");

  useEffect(() => {
    loadRooms();

    const socket = getDashboardSocket();
    
    const handleUpdate = () => {
      console.log('Salas actualizadas, recargando (mentor)...');
      loadRooms();
    };
    
    socket.on('roomsUpdated', handleUpdate);

    return () => {
      socket.off('roomsUpdated', handleUpdate);
    };
  }, []);

  const loadRooms = async () => {
    try {
      const data = await fetchActiveRooms();
      // Solo salas del mentor actual, ordenadas por ID descendente (más nuevas primero)
      const myRooms = data
        .filter((r) => r.mentor_id === userId)
        .sort((a, b) => b.id - a.id);

      // Mostramos siempre la sala más reciente
      setRooms(myRooms.length > 0 ? [myRooms[0]] : []);

      // Cargar estadísticas desde el historial
      const history = await getUserRoomHistory();
      const mySessions = history.filter(s => s.mentor_id === userId);
      
      const totalSeconds = mySessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
      const totalParticipants = mySessions.reduce((acc, s) => acc + parseInt(s.participant_count || 0), 0);
      
      setStats({
        salasCreadas: mySessions.length,
        alumnosAyudados: totalParticipants,
        horasMentoreando: Math.round(totalSeconds / 3600 * 10) / 10
      });
    } catch (err) {
      console.error("Error cargando salas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterRoom = (room) => {
    // Sincronizar con la vista de "Salas Activas" guardando en localStorage
    const infoSala = {
      id: room.id,
      titulo: room.nombre,
      habilidad: room.habilidad,
      inscritos: room.sessionInfo?.participantCount || 0,
      capacidad: room.capacidad_maxima || 10,
    };
    storage.set("salaActiva", infoSala);
    
    navigate(`/sala/${encodeId(room.id)}`);
  };



  return (
    <section className="dashboard-page">
      <GlobalHeader />

      {/* Stats */}
      <div className="perfil-stats-grid" style={{ marginBottom: "2rem" }}>
        <PerfilStatCard titulo="Salas Creadas" valor={stats.salasCreadas} icon={MessagesSquare} color="#00ffff" />
        <PerfilStatCard titulo="Asistencias Totales" valor={stats.alumnosAyudados} icon={User} color="#ff00ff" />
        <PerfilStatCard titulo="Horas Mentoreando" valor={`${stats.horasMentoreando}h`} icon={Clock} color="#00ff00" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <MessagesSquare size={24} color="#ff00ff" />
        <h2 className="welcome-title" style={{ margin: 0 }}>Tu sala activa</h2>
      </div>

      {loading ? (
        <div className="loading-global-container">
          <div className="aura-spinner" style={{ borderTopColor: "#ff00ff", filter: "drop-shadow(0 0 10px rgba(255, 0, 255, 0.3))" }}></div>
          <span className="loading-text-neon" style={{ color: "#ff00ff" }}>Actualizando</span>
        </div>
      ) : rooms.length === 0 ? (
        <div className="neon-card empty-sala-state" style={{ padding: "2rem", textAlign: "center", marginTop: "1rem" }}>
          <p>No tienes salas activas aún. Crea una para comenzar a ser mentor.</p>
        </div>
      ) : (
        <div className="active-room-container" style={{ width: "min(100%, 600px)", margin: "0 auto" }}>
          {rooms.map((room) => {
            const participantCount = room.sessionInfo?.participantCount || 0;
            const maxCapacity = room.capacidad_maxima || 10;
            const progress = (participantCount / maxCapacity) * 100;

            return (
              <article key={room.id} className="premium-room-card">
                <div className="room-card-glow"></div>
                
                <div className="room-header">
                  <div className="live-badge">
                    <span className="live-dot"></span>
                    EN VIVO
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>SALA ACTIVA</span>
                </div>

                <div className="room-main-info">
                  <h3 className="room-title-premium">{room.nombre}</h3>
                  <div className="room-skill-badge">
                    <BookOpen size={14} />
                    {room.habilidad || "Habilidad general"}
                  </div>
                </div>

                <div className="room-stats-premium">
                  <div className="stat-item">
                    <div className="stat-info">
                      <Users size={18} className="icon-cyan" />
                      <span>{participantCount} / {maxCapacity} Alumnos</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="room-actions-premium">
                  <button className="enter-room-btn" onClick={() => handleEnterRoom(room)}>
                    Entrar a mi sala
                    <ChevronRight size={18} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default HomeMentor;
