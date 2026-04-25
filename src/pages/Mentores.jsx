import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MentorCard from "../components/MentorCard";
import GlobalHeader from "../components/GlobalHeader";
import SalaDetailModal from "../components/SalaDetailModal";
import SkillTag from "../components/SkillTag";
import { Search, Users, BookOpen, Server, Database, Terminal, Layout, Layers, ChevronRight, X } from "lucide-react";
import { fetchActiveRooms, joinRoom, fetchRoom } from "../services/roomService";
import { fetchSkills, fetchCategories } from "../services/skillService";
import { getDashboardSocket } from "../services/socketConfig";
import { storage } from "../services/storage";
import "../Styles/Mentores.css";

const iconMap = {
  'Backend': Server,
  'Database': Database,
  'DevOps': Terminal,
  'Frontend': Layout,
  'General': Layers
};

function Mentores() {
  const [rol] = useState(storage.get("userRole") || "alumno");
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [joining, setJoining] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Categorías
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [skillsInCategory, setSkillsInCategory] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  const load = async () => {
    try {
      const data = await fetchActiveRooms();
      // FILTRO: Solo salas donde el mentor ya esté dentro
      const activeRooms = data.filter(r => r.sessionInfo?.isActive);
      setRooms(activeRooms);
      setFiltered(activeRooms);
    } catch (err) {
      console.error("Error cargando mentores:", err);
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

  useEffect(() => {
    load();
    loadCategories();
    
    const socket = getDashboardSocket();
    const handleUpdate = () => {
      console.log('Salas actualizadas, recargando...');
      load();
    };
    socket.on('roomsUpdated', handleUpdate);

    // Si venimos de una notificación, abrir el modal automáticamente
    if (location.state?.roomId) {
      const checkAndOpen = () => {
        if (rooms.length > 0) {
          const roomToOpen = rooms.find(r => r.id === location.state.roomId);
          if (roomToOpen) setSelectedRoom(roomToOpen);
        }
      };
      checkAndOpen();
    }

    return () => socket.off('roomsUpdated', handleUpdate);
  }, [rooms.length, location.state]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(rooms);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        rooms.filter((r) =>
          r.nombre?.toLowerCase().includes(q) ||
          r.habilidad?.toLowerCase().includes(q) ||
          r.mentor_nombre?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, rooms]);

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
    setJoining(room.id);
    try {
      const roomDetails = await fetchRoom(room.id);
      if (!roomDetails.sessionInfo?.isActive) {
        alert("El mentor aún no ha ingresado a esta sala.");
        setJoining(null);
        return;
      }

      // Enviamos el objeto room completo para asegurar sincronización de nombres
      try { await joinRoom(room.id, room); } catch (err) {
        if (!err.message?.includes("Ya estás en esta sala")) throw err;
      }

      const infoSala = { 
        id: room.id, 
        nombre: room.nombre, 
        habilidad: room.habilidad, 
        mentor: room.mentor_nombre || "Sin mentor" 
      };
      const visitadas = storage.get("historialSalas") || [];
      if (!visitadas.some((s) => s.id === room.id)) {
        storage.set("historialSalas", [infoSala, ...visitadas]);
      }

      navigate(`/sala/${room.id}`);
    } catch (err) {
      alert("Error al intentar unirte a la sala: " + (err.message || "Error desconocido"));
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="home-container">
      <div className="home-main-layout">
        <Sidebar rol={rol} />
        <main className="home-content">
          <GlobalHeader />

          <div className="search-container-neon search-extended">
            <Search className="search-icon" size={20} />
            <input type="text" placeholder="¿Qué quieres aprender hoy? Busca una sala o mentor..." className="search-input-neon"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* Explorador de Categorías */}
          <div className="categories-container">
            <div className="categories-scroll-wrapper">
              {dynamicCategories.map((catName) => {
                const Icon = iconMap[catName] || BookOpen;
                const isActive = activeCategory === catName;
                return (
                  <button
                    key={catName}
                    onClick={() => handleCategoryClick(catName)}
                    className={`category-btn-neon ${isActive ? "active" : ""}`}
                  >
                    <Icon size={18} />
                    <span>{catName}</span>
                  </button>
                );
              })}
            </div>

            {activeCategory && (
              <div className="skills-explorer-panel neon-card-full">
                <div className="skills-panel-header">
                  <div className="skills-panel-title-group">
                    <span className="skills-panel-subtitle">CATÁLOGO DE</span>
                    <h4 className="skills-panel-title">
                      {activeCategory}
                    </h4>
                  </div>
                  <button 
                    className="skills-panel-close-btn"
                    onClick={() => { setActiveCategory(null); setSkillsInCategory([]); }}
                  >
                    <X size={16} />
                    <span>Cerrar explorador</span>
                  </button>
                </div>
                
                <div className="skills-panel-content">
                  {loadingSkills ? (
                    <div className="skills-loading-container">
                      <div className="aura-spinner-mini"></div>
                      <span>Sincronizando catálogo...</span>
                    </div>
                  ) : (
                    <div className="skills-grid-adaptive">
                      {skillsInCategory.map((skill) => (
                        <SkillTag 
                          key={skill.id || skill._id} 
                          nombre={skill.nombre} 
                          color="#00ffff" 
                          onClick={() => setSearch(skill.nombre)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <section className="mentores-section">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2rem" }}>
              <Users size={24} color="#00ffff" />
              <h2 className="section-title-neon" style={{ margin: 0 }}>Salas Disponibles</h2>
            </div>

            {loading ? (
              <div className="loading-global-container">
                <div className="aura-spinner"></div>
                <span className="loading-text-neon">Buscando conocimiento...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state-centered">
                <Users size={100} className="empty-icon" style={{ marginBottom: "2rem", opacity: 0.15 }} />
                <h3 style={{ color: "#fff", fontSize: "2rem", marginBottom: "0.8rem", fontWeight: "700" }}>No hay salas activas</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.2rem", maxWidth: "450px", margin: "0 auto" }}>En este momento no hay mentores enseñando. ¡Vuelve más tarde!</p>
              </div>
            ) : (
              <div className="mentores-grid">
                {filtered.map((room) => (
                  <MentorCard key={room.id} id={room.id} nombre={room.mentor_nombre || "Mentor"}
                    habilidad={room.habilidad} nombreSala={room.nombre}
                    isActive={room.sessionInfo?.isActive}
                    participantesCount={room.participantesCount || 0}
                    capacidad_maxima={room.capacidad_maxima || 10}
                    onJoin={() => handleJoin(room)} 
                    onInfo={() => setSelectedRoom(room)}
                    isJoining={joining === room.id} />
                ))}
              </div>
            )}
          </section>

          <SalaDetailModal 
            isOpen={!!selectedRoom} 
            onClose={() => setSelectedRoom(null)} 
            room={selectedRoom}
            onJoin={() => handleJoin(selectedRoom)}
            isJoining={joining === (selectedRoom?.id)}
          />
        </main>
      </div>
    </div>
  );
}

export default Mentores;
