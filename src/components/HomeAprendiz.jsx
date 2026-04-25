import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, User, Smile, Radio, Users, Clock, Award, MessagesSquare } from "lucide-react";
import PerfilStatCard from "./PerfilStatCard";
import { fetchActiveRooms, joinRoom, fetchRoom, getUserRoomHistory } from "../services/roomService";
import { fetchSkills, fetchCategories } from "../services/skillService";
import { getDashboardSocket } from "../services/socketConfig";
import GlobalHeader from "../components/GlobalHeader";
import SkillTag from "./SkillTag";
import Sidebar from "./Sidebar";
import { Code, Palette, Megaphone, Languages, Music, Gamepad2, ChevronRight } from "lucide-react";
import { storage } from "../services/storage";
import { useToast } from "../hooks/useToast";
import { encodeId } from "../utils/obfuscation";
import "../Styles/Mentores.css";
import AuraAvatar from "./AuraAvatar";

function HomeAprendiz() {
  const { info: showInfo, error: showError } = useToast();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [joining, setJoining] = useState(null);
  const [salasVisitadas, setSalasVisitadas] = useState([]);
  const [stats, setStats] = useState({ salasAsistidas: 0, horasEstudio: 0, cursos: 0 });
  const rol = storage.get("userRole") || "alumno";
  // Categorías
  const [activeCategory, setActiveCategory] = useState(null);
  const [skillsInCategory, setSkillsInCategory] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [nextMilestone, setNextMilestone] = useState(null);

  const iconMap = {
    'Tecnología': Code,
    'Diseño': Palette,
    'Negocios': Megaphone,
    'Educación': Languages,
    'Arte': Music,
    'Entretenimiento': Gamepad2,
    'Tecnologia': Code,
    'Diseno': Palette,
    'Educacion': Languages,
  };

  // Eliminamos la lista hardcoded de categories

  useEffect(() => {
    loadRooms();
    loadCategories();

    const socket = getDashboardSocket();

    const handleUpdate = () => {
      console.log("Salas actualizadas, recargando...");
      loadRooms();
    };

    socket.on("roomsUpdated", handleUpdate);

    const historialGuardado = storage.get("historialSalas") || [];
    setSalasVisitadas(historialGuardado);

    return () => {
      socket.off("roomsUpdated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(rooms);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        rooms.filter(
          (r) =>
            r.nombre?.toLowerCase().includes(q) ||
            r.habilidad?.toLowerCase().includes(q) ||
            r.mentor_nombre?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, rooms]);

  const loadRooms = async () => {
    try {
      const [history, activeRoomsData] = await Promise.all([
        getUserRoomHistory(),
        fetchActiveRooms()
      ]);
      
      // Salas en vivo (todas las abiertas en el servidor)
      const liveRooms = activeRoomsData;
      // ORDENAR: Más recientes primero
      liveRooms.sort((a, b) => new Date(b.sessionInfo?.startedAt || 0) - new Date(a.sessionInfo?.startedAt || 0));
      
      setRooms(liveRooms);
      setFiltered(liveRooms);

      const userId = storage.get("userId");
      const myStudySessions = history.filter(s => {
        // 1. Solo sesiones donde soy alumno
        const isNotMentor = s.mentor_id !== userId;
        if (!isNotMentor) return false;

        // 2. Duraron más de 1 minuto
        const dur = s.duration_seconds ?? s.duracionSegundos ?? s.duracion ?? 0;
        if (dur <= 60) return false;

        // Función para normalizar texto (quitar acentos)
        const normalize = (str) => 
          (str || "").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 3. Filtra nombres basura (placeholder/defaults)
        const name = normalize(s.room_nombre || s.titulo || s.nombre || s.room_name);
        const skill = normalize(s.habilidad || s.skill_name || s.habilidad_nombre || s.skill?.nombre);
        
        const forbidden = ["habilidad", "sala de mentoria", "sala de mentoriaa"];
        
        if (forbidden.includes(name) || forbidden.includes(skill)) return false;

        return true;
      });
      
      // ORDENAR historial: Más reciente arriba
      myStudySessions.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      // Actividad Reciente
      setRecentSessions(myStudySessions.slice(0, 3));

      // Stats
      const totalSeconds = myStudySessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
      const uniqueSkills = new Set(myStudySessions.map(s => s.habilidad || s.skill_name || s.skill?.nombre).filter(Boolean));

      setStats({
        salasAsistidas: myStudySessions.length,
        horasEstudio: Math.round(totalSeconds / 3600 * 10) / 10,
        cursos: uniqueSkills.size
      });

      // Cálculo de Hito (Sutil)
      const skillCounts = myStudySessions.reduce((acc, s) => {
        const name = s.habilidad || s.skill_name || s.skill?.nombre;
        if (name) acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      let milestone = null;
      for (const [name, count] of Object.entries(skillCounts)) {
        if (count === 3 || count === 8) {
          milestone = { name, level: count === 3 ? "Intermedio" : "Avanzado" };
          break;
        }
      }
      setNextMilestone(milestone);

    } catch (err) {
      console.error("Error cargando salas:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setDynamicCategories(data);
    } catch (err) {
      console.error("Error cargando categorias:", err);
    }
  };

  const handleCategoryClick = async (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      setSkillsInCategory([]);
      return;
    }
    setActiveCategory(category);
    setLoadingSkills(true);
    try {
      const skills = await fetchSkills({ categoria: category });
      setSkillsInCategory(skills);
    } catch (err) {
      console.error("Error cargando habilidades por categoria:", err);
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleJoin = async (room) => {
    console.log(`[DEBUG] handleJoin iniciado para sala ID:`, room.id);
    setJoining(room.id);
    try {
      console.log(`[DEBUG] Obteniendo detalles de la sala...`);
      const roomDetails = await fetchRoom(room.id);
      console.log(`[DEBUG] Detalles obtenidos:`, roomDetails);

      if (!roomDetails.sessionInfo?.isActive) {
        console.log(`[DEBUG] Bloqueado: sessionInfo.isActive es falso o indefinido.`);
        showInfo("El mentor aún no ha ingresado a la sala.");
        setJoining(null);
        return;
      }

      console.log(`[DEBUG] sessionInfo.isActive es TRUE. Intentando unirse (joinRoom)...`);
      try {
        await joinRoom(room.id);
        console.log(`[DEBUG] joinRoom exitoso para sala ID:`, room.id);
      } catch (err) {
        console.log(`[DEBUG] Error atrapado en joinRoom:`, err.message);
        if (!err.message?.includes("Ya estas en esta sala")) {
          console.error(`[DEBUG] Error critico en joinRoom:`, err);
          throw err;
        } else {
          console.log(`[DEBUG] El usuario ya estaba en la sala, continuando a navegacion.`);
        }
      }

      console.log(`[DEBUG] Guardando historial y navegando a /sala/${room.id}`);
      const encodedId = encodeId(room.id);
      
      const infoSala = {
        id: room.id,
        nombre: room.nombre,
        habilidad: room.habilidad,
        mentor: room.mentor_nombre || "Sin mentor",
      };

      const visitadas = storage.get("historialSalas") || [];
      if (!visitadas.some((s) => s.id === room.id)) {
        storage.set("historialSalas", [infoSala, ...visitadas]);
      }

      navigate(`/sala/${encodedId}`);
    } catch (err) {
      console.error("[DEBUG] Error general en handleJoin:", err);
      showError("No se pudo entrar a la sala: " + (err.message || "Error desconocido"));
    } finally {
      console.log(`[DEBUG] handleJoin finalizado. Restableciendo estado joining.`);
      setJoining(null);
    }
  };

  return (
    <section className="dashboard-content-inner">
      <GlobalHeader />
      {/* Bienvenida Personalizada */}
      <section className="welcome-banner-neon" style={{ marginBottom: "2.5rem" }}>
        <h1 className="welcome-title">
          ¡Hola, <span className="text-glow">{storage.get("userName") || "Aprendiz"}</span>!
        </h1>
        <p className="welcome-subtitle">¿Qué vamos a dominar hoy en el multiverso del código?</p>
      </section>

      <div className="perfil-stats-grid" style={{ marginBottom: "2.5rem" }}>
        <PerfilStatCard titulo="Salas Asistidas" valor={stats.salasAsistidas} icon={MessagesSquare} color="#00ffff" />
        <PerfilStatCard titulo="Horas de Estudio" valor={`${stats.horasEstudio}h`} icon={Clock} color="#ff00ff" />
        <PerfilStatCard titulo="Cursos / Habilidades" valor={stats.cursos} icon={BookOpen} color="#00ff00" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", marginBottom: "3rem", alignItems: "start" }}>
        
        {/* COLUMNA IZQUIERDA: ACTIVIDAD */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(255, 0, 255, 0.1)", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={18} color="#ff00ff" />
              </div>
              <h4 style={{ margin: 0, color: "#fff", fontSize: "1rem" }}>Actividad Reciente</h4>
            </div>
            {nextMilestone && (
              <span style={{ fontSize: "0.85rem", color: "#00ffff", background: "rgba(0,255,255,0.1)", padding: "4px 12px", borderRadius: "20px" }}>
                <Award size={14} style={{ marginRight: "6px" }} />
                Próximo nivel en {nextMilestone.name} pronto
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentSessions.length > 0 ? (
              recentSessions.map((s, i) => (
                <div key={i} className="premium-history-card">
                  <div className="history-card-content">
                    <div className="history-icon-glow">
                      <BookOpen size={20} />
                    </div>
                    <div className="history-info">
                      <h5 className="history-title">
                        {s.room_nombre || s.titulo || s.nombre || s.room_name || s.habilidad || "Sesión de Aura"}
                      </h5>
                      <div className="history-meta">
                        <span className="history-mentor">
                          <User size={12} /> 
                          {s.mentor_nombre || s.mentor_name || s.mentorName || s.mentor || "Mentor Aura"}
                        </span>
                        <span className="history-duration"><Clock size={12} /> {s.duration_seconds ? `${Math.round(s.duration_seconds / 60)} min` : "15 min"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="history-date-badge">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : "Reciente"}
                  </div>
                </div>
              ))
            ) : (
              <div className="neon-card" style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                Aún no tienes actividad registrada.
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: EN VIVO */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(0, 255, 255, 0.1)", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={18} color="#00ffff" />
            </div>
            <h4 style={{ margin: 0, color: "#fff", fontSize: "1rem" }}>Mentores en Vivo</h4>
          </div>
          <div className="neon-card" style={{ padding: "1.5rem", minHeight: "200px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {rooms.length > 0 ? (
                rooms.slice(0, 4).map((room) => (
                  <div key={room.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", cursor: "pointer" }} onClick={() => navigate("/mentores")}>
                    <AuraAvatar seed={room.mentor_nombre} size={35} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, color: "#fff", fontSize: "0.85rem", fontWeight: "600" }}>{room.mentor_nombre}</p>
                      <p style={{ margin: 0, color: "#00ffff", fontSize: "0.7rem" }}>{room.habilidad}</p>
                    </div>
                    <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
                  </div>
                ))
              ) : (
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", textAlign: "center", marginTop: "2rem" }}>
                  No hay mentores activos ahora.
                </p>
              )}
            </div>
            {rooms.length > 4 && (
              <button onClick={() => navigate("/mentores")} style={{ width: "100%", marginTop: "1rem", background: "transparent", border: "none", color: "#00ffff", fontSize: "0.8rem", cursor: "pointer" }}>
                Ver todos ({rooms.length})
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Footer Minimalista */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem", paddingBottom: "4rem" }}>
        <button 
          className="primary-btn-neon-s" 
          onClick={() => navigate("/mentores")}
          style={{ padding: "0.8rem 2.5rem" }}
        >
          Explorar todos los Mentores
        </button>
      </div>
    </section>
  );
}

export default HomeAprendiz;
