import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SalaActivaCard from "../components/SalaActivaCard";
import FormCrearSala from "../components/FormCrearSala";
import MentorCard from "../components/MentorCard";
import GlobalHeader from "../components/GlobalHeader";
import { Bell, User, Circle, MessageSquareOff, PlusCircle, X, RefreshCw } from "lucide-react";
import { fetchActiveRooms, joinRoom } from "../services/roomService";
import { useToast } from "../hooks/useToast";
import "../Styles/Home.css";
import "../Styles/BuscarHabilidades.css";
import "../Styles/SalasActivas.css";
import "../Styles/Mentores.css";

import { storage } from "../services/storage";
import { encodeId } from "../utils/obfuscation";

function SalasActivas() {
  const { success: showSuccess, error: showError } = useToast();
  const [rol] = useState(storage.get("userRole") || "mentor");
  const navigate = useNavigate();
  const location = useLocation();

  // Ver si viene con filtro de habilidad desde BuscarHabilidades
  const params = new URLSearchParams(location.search);
  const habilidadFiltro = params.get("habilidad");

  const [salaActiva, setSalaActiva] = useState(
    storage.get("salaActiva") || null
  );
  const [salasFiltered, setSalasFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (habilidadFiltro) {
      loadSalasPorHabilidad();
    } else {
      syncActiveRoom();
    }
  }, [habilidadFiltro]);

  const syncActiveRoom = async () => {
    // Si ya hay una sala en storage, no hacemos nada (por ahora)
    if (salaActiva) return;

    setLoading(true);
    try {
      const userId = storage.get("userId");
      const rooms = await fetchActiveRooms();
      const myActiveRoom = rooms.find(r => r.mentor_id === userId);
      
      if (myActiveRoom) {
        const info = {
          id: myActiveRoom.id,
          titulo: myActiveRoom.nombre,
          habilidad: myActiveRoom.habilidad,
          inscritos: myActiveRoom.sessionInfo?.participantCount || 0,
          capacidad: myActiveRoom.capacidad_maxima || 10
        };
        storage.set("salaActiva", info);
        setSalaActiva(info);
      }
    } catch (err) {
      console.error("Error sincronizando sala activa:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSalasPorHabilidad = async () => {
    setLoading(true);
    try {
      const all = await fetchActiveRooms();
      const filtered = all.filter((r) =>
        r.habilidad?.toLowerCase().includes(habilidadFiltro.toLowerCase()) ||
        r.nombre?.toLowerCase().includes(habilidadFiltro.toLowerCase())
      );
      setSalasFiltered(filtered);
    } catch (err) {
      console.error("Error cargando salas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (room) => {
    setJoining(room.id);
    try {
      // Enviamos el objeto room completo para asegurar sincronización de nombres
      try { await joinRoom(room.id, room); } catch (err) {
        if (!err.message?.includes("Ya estás en esta sala")) throw err;
      }
      storage.set("salaActiva", {
        ...room,
        isCreator: false
      });
      navigate(`/sala/${encodeId(room.id)}`);
    } catch (err) {
      showError(err.message || "Error al unirse");
    } finally {
      setJoining(null);
    }
  };

  const handleEnterRoom = () => {
    if (salaActiva?.id) navigate(`/sala/${encodeId(salaActiva.id)}`);
  };

  const handleCloseRoom = async () => {
    try {
      if (salaActiva?.id) {
        const { closeRoom } = await import("../services/roomService");
        await closeRoom(salaActiva.id);
      }
      storage.remove("salaActiva");
      setSalaActiva(null);
      showSuccess("Sala cerrada correctamente.");
      window.location.reload();
    } catch (err) {
      console.error("Error al cerrar la sala:", err);
      showError("No se pudo cerrar en el servidor, pero se quitó de tu vista.");
      storage.remove("salaActiva");
      setSalaActiva(null);
    }
  };

  // Vista filtrada por habilidad
  if (habilidadFiltro) {
    return (
      <div className="home-container">
        <div className="home-main-layout">
          <Sidebar rol={rol} />
          <main className="home-content" style={{ display: "flex", flexDirection: "column" }}>
            <GlobalHeader />

            <section className="salas-activas-section">
              {loading ? (
                <div className="loading-global-container" style={{ padding: "2rem" }}>
                  <div className="aura-spinner"></div>
                  <span className="loading-text-neon">Sincronizando</span>
                </div>
              ) : salasFiltered.length === 0 ? (
                <div className="empty-state-centered">
                  <VideoOff size={100} className="empty-icon" style={{ marginBottom: "2rem", opacity: 0.2 }} />
                  <h3 style={{ color: "#fff", fontSize: "2rem", marginBottom: "0.8rem", fontWeight: "700" }}>No hay salas activas</h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.2rem" }}>Parece que ningún mentor está enseñando esta habilidad ahora mismo.</p>
                </div>
              ) : (
                <div className="single-sala-container">
                  {salasFiltered.map((room) => (
                    <MentorCard 
                      key={room.id}
                      nombre={room.mentor_nombre || "Mentor"}
                      habilidad={room.habilidad}
                      nombreSala={room.nombre}
                      isActive={true}
                      onJoin={() => handleJoin(room)}
                      isJoining={joining === room.id}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    );
  }

  // Vista normal — sala activa del mentor
  return (
    <div className="home-container">
      <div className="home-main-layout">
        <Sidebar rol={rol} />
        <main className="home-content">
          <GlobalHeader />

          {/* Estado eliminado por redundancia */}
          <section className="salas-activas-section" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "1.5rem" }}>
              {/* Título redundante eliminado */}
              {!salaActiva && !showCreateForm && (
                <button 
                  className="primary-btn-s" 
                  onClick={() => setShowCreateForm(true)}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <PlusCircle size={18} /> Crear nueva sala
                </button>
              )}
            </div>

            <div className="single-sala-container" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: (salaActiva || showCreateForm) ? "flex-start" : "center", alignItems: "center" }}>
              {salaActiva ? (
                <SalaActivaCard {...salaActiva} onClose={handleCloseRoom} onEnter={handleEnterRoom} />
              ) : showCreateForm ? (
                <FormCrearSala 
                  onCancel={() => setShowCreateForm(false)} 
                  onSuccess={() => {
                    setShowCreateForm(false);
                    setSalaActiva(storage.get("salaActiva"));
                  }} 
                />
              ) : (
                <div className="empty-state-centered">
                  <MessageSquareOff size={80} className="empty-icon" style={{ marginBottom: "1.5rem", opacity: 0.2 }} />
                  <h3 style={{ color: "#fff", fontSize: "2rem", marginBottom: "0.8rem", fontWeight: "700" }}>No tienes ninguna sala activa</h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.2rem", maxWidth: "450px", margin: "0 auto" }}>Crea una sala para empezar a mentorear y compartir tus conocimientos.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default SalasActivas;
