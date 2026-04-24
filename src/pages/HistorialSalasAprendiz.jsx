import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import HistorialRow from "../components/HistorialRow";
import Notificaciones from "../components/Notificaciones";
import GlobalHeader from "../components/GlobalHeader";
import { Search, User, History, RefreshCw, BookOpen } from "lucide-react";
import AuraSelect from "../components/AuraSelect";
import { getUserRoomHistory } from "../services/roomService";
import { fetchMySkills } from "../services/skillService";
import "../Styles/Home.css";
import "../Styles/BuscarHabilidades.css";
import "../Styles/HistorialSalasAprendiz.css";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatDuration = (seconds = 0) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

import { storage } from "../services/storage";

function HistorialSalasAprendiz() {
  const [rol] = useState((storage.get("userRole") || "alumno").toLowerCase());
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("Todas");
  const [sortOrder, setSortOrder] = useState("Recientes");
  const [mySkills, setMySkills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Combina historial del backend con el guardado localmente
        let backendHistory = [];
        try {
          backendHistory = await getUserRoomHistory();
        } catch {
          backendHistory = [];
        }

        const localData = storage.get("historialSalas");
        const localHistory = localData || [];

        // Unifica por id, priorizando backend
        const backendIds = new Set(backendHistory.map((s) => s.id));
        const merged = [
          ...backendHistory,
          ...localHistory.filter((s) => !backendIds.has(s.id)),
        ];

        // Ordena por fecha desc
        merged.sort((a, b) => new Date(b.startedAt || b.fecha || 0) - new Date(a.startedAt || a.fecha || 0));

        setHistory(merged);

        // Cargar habilidades del mentor usando mentorId (Endpoint oficial)
        if (rol === "mentor") {
          try {
            const { fetchSkills } = await import("../services/skillService");
            const userId = storage.get("userId");
            const skills = await fetchSkills({ mentorId: userId });
            setMySkills(skills);
          } catch (err) {
            console.error("Error cargando habilidades por mentorId:", err);
          }
        }
      } catch (err) {
        console.error("Error general en historial:", err);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [rol]);

  const uniqueSkills = useMemo(() => {
    if (rol === "mentor") {
      // PARA MENTORES: SOLO sus habilidades relacionadas
      const mentorSkills = mySkills.map(s => s.nombre).filter(Boolean);
      return ["Todas", ...new Set(mentorSkills)];
    } else {
      // PARA APRENDICES: Solo lo que hay en su historial real
      const historySkills = history.map(item => 
        item.habilidad || item.skill_name || item.habilidad_nombre || item.skill?.nombre
      ).filter(Boolean);
      return ["Todas", ...new Set(historySkills)];
    }
  }, [history, mySkills, rol]);

  const filteredHistory = useMemo(() => {
    let result = history.filter((item) => {
      const name = (item.habilidad || item.room_name || item.nombreSala || "").toLowerCase();
      const mentor = (item.mentor_name || item.mentor || "").toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || mentor.includes(searchTerm.toLowerCase());
      const matchesSkill = filterSkill === "Todas" || 
        (item.habilidad || item.skill_name || item.habilidad_nombre || item.skill?.nombre || item.room_name || item.nombreSala) === filterSkill;

      return matchesSearch && matchesSkill;
    });

    // Aplicar ordenamiento
    result = [...result].sort((a, b) => {
      const durA = a.duration_seconds ?? a.duracionSegundos ?? a.duracion ?? 0;
      const durB = b.duration_seconds ?? b.duracionSegundos ?? b.duracion ?? 0;
      
      if (sortOrder === "MasDuracion") return durB - durA;
      if (sortOrder === "MenosDuracion") return durA - durB;
      // Default: Más recientes
      return new Date(b.started_at || b.startedAt || b.fecha || 0) - new Date(a.started_at || a.startedAt || a.fecha || 0);
    });

    return result;
  }, [history, searchTerm, filterSkill, sortOrder]);

  const historialData = useMemo(() => {
    if (isLoading) return [{ id: "loading-row", fecha: "Cargando...", habilidad: "", mentor: "", duracion: "" }];
    if (filteredHistory.length === 0) return [{ id: "empty-row", fecha: "Sin coincidencias", habilidad: "", mentor: "", duracion: "" }];
    
    return filteredHistory.map((item) => {
      // Normalización inteligente del nombre de la habilidad
      const displaySkill = 
        item.habilidad || 
        item.skill_name || 
        item.habilidad_nombre || 
        item.skill?.nombre || 
        item.nombreSala || 
        item.room_name || 
        "—";

      return {
        id: item.id,
        fecha: formatDate(item.started_at || item.startedAt || item.fecha),
        sala: item.room_name || item.nombreSala || "—",
        habilidad: displaySkill,
        mentor: item.mentor_name || item.mentor || "—",
        duracion: formatDuration(item.duration_seconds ?? item.duracionSegundos ?? item.duracion ?? 0),
      };
    });
  }, [filteredHistory, isLoading]);

  return (
    <div className="home-container">
      <div className="home-main-layout">
        <Sidebar rol={rol} />
        <main className="home-content">
          <GlobalHeader />

          <div className="search-container-neon search-extended">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por habilidad o mentor..." 
              className="search-input-neon"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <section className="historial-section">
            <div className="historial-top-actions">
              {/* Título redundante eliminado */}
              <div className="filter-chips" style={{ display: "flex", gap: "1.5rem" }}>
                <AuraSelect 
                  value={filterSkill}
                  onChange={setFilterSkill}
                  options={uniqueSkills.map(s => ({ value: s, label: s === "Todas" ? "Habilidades" : s }))}
                  icon={BookOpen}
                />
                <AuraSelect 
                  value={sortOrder}
                  onChange={setSortOrder}
                  options={[
                    { value: "Recientes", label: "Más recientes" },
                    { value: "MasDuracion", label: "Más duración" },
                    { value: "MenosDuracion", label: "Menos duración" }
                  ]}
                  icon={RefreshCw}
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="loading-global-container">
                <div className="aura-spinner"></div>
                <span className="loading-text-neon">Obteniendo historial</span>
              </div>
            ) : history.length === 0 ? (
              <div className="empty-state-centered">
                <History size={100} className="empty-icon" style={{ marginBottom: "2rem", opacity: 0.15 }} />
                <h3 style={{ color: "#fff", fontSize: "2rem", marginBottom: "0.8rem", fontWeight: "700" }}>Tu historial está vacío</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.2rem", maxWidth: "450px", margin: "0 auto" }}>
                  {rol === "mentor" 
                    ? "Aún no has impartido ninguna sesión. ¡Crea una sala para comenzar!" 
                    : "Aún no has asistido a ninguna sesión. ¡Explora las habilidades y únete a una sala!"}
                </p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="empty-state-centered">
                <Search size={80} className="empty-icon" style={{ marginBottom: "2rem", opacity: 0.15 }} />
                <h3 style={{ color: "#fff", fontSize: "2rem", marginBottom: "0.8rem", fontWeight: "700" }}>Sin coincidencias</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.2rem", maxWidth: "450px", margin: "0 auto" }}>No encontramos sesiones que coincidan con tu búsqueda o filtros.</p>
              </div>
            ) : (
              <div className="historial-table-container">
                <div className="historial-table-header">
                  <div className="header-item-neon">Fecha</div>
                  <div className="header-item-neon">Sala</div>
                  <div className="header-item-neon">Habilidad</div>
                  <div className="header-item-neon">Mentor</div>
                  <div className="header-item-neon">Duración</div>
                </div>
                <div className="historial-list">
                  {historialData.map((item) => <HistorialRow key={item.id} {...item} />)}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default HistorialSalasAprendiz;