import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PerfilStatCard from "../components/PerfilStatCard";
import SkillTag from "../components/SkillTag";
import Notificaciones from "../components/Notificaciones";
import GlobalHeader from "../components/GlobalHeader";
import { User, Edit3, Star, Clock, Video, Award, BookOpen, X, Check, Settings, Shield, Trash2, RefreshCw, Eye, EyeOff, Palette, Mail, FileText, ShieldCheck, AlertTriangle } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { httpClient } from "../services/httpClient";
import { fetchMySkills, fetchSkills, assignSkill, unassignSkill } from "../services/skillService";
import { logoutUser } from "../services/authService";
import { storage } from "../services/storage";
import AuraSelect from "../components/AuraSelect";
import { fetchActiveRooms, joinRoom, fetchRoom } from "../services/roomService";
import AuraSwal from "../utils/swal";
import { useToast } from "../hooks/useToast";
import "../Styles/Home.css";
import "../Styles/Perfil.css";
import "../Styles/Configuracion.css";
import "../Styles/Configuracion.css";

function Perfil() {
  const { success: showSuccess, error: showError } = useToast();
  const [rol] = useState(storage.get("userRole") || "alumno");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [createdSkills, setCreatedSkills] = useState([]);
  // Config states from Configuracion
  const { theme, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ passwordActual: "", passwordNueva: "", confirmar: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [savingSkills, setSavingSkills] = useState(false);
  const [activeTab, setActiveTab] = useState("mis-skills");
  // Habilidades Aprendiz (Cálculo dinámico)
  const [aprendizSkills, setAprendizSkills] = useState([]);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const data = await httpClient.get("/auth/profile");
      setUserData(data);
      setEditData({
        nombre: data.nombre || "",
        usuario: data.usuario || "",
        bio: data.intereses?.[0] || "",
      });

      // Si es Aprendiz, calculamos sus habilidades por historial
      if (rol !== "mentor") {
        try {
          const { getUserRoomHistory } = await import("../services/roomService");
          const history = await getUserRoomHistory();
          const myId = storage.get("userId");
          
          // Filtrar solo sesiones donde fui alumno
          const studySessions = history.filter(s => s.mentor_id !== myId);
          
          // Agrupar por habilidad y contar sesiones (con normalización de campos)
          const skillCounts = studySessions.reduce((acc, s) => {
            const skillName = s.habilidad || s.skill_name || s.habilidad_nombre || s.skillName || (s.skill && s.skill.nombre);
            if (!skillName) return acc;
            acc[skillName] = (acc[skillName] || 0) + 1;
            return acc;
          }, {});

          // Convertir a array de objetos con Nivel
          const calculatedSkills = Object.entries(skillCounts).map(([nombre, count]) => {
            let nivel = "Básico";
            if (count >= 9) nivel = "Avanzado";
            else if (count >= 4) nivel = "Intermedio";
            
            return { nombre, count, nivel };
          });

          setAprendizSkills(calculatedSkills);
        } catch (err) {
          console.error("Error calculando habilidades de aprendiz:", err);
        }
      }

      if (rol === "mentor") {
        const userId = storage.get("userId");
        const [mySkills, catalog] = await Promise.all([
          fetchSkills({ mentorId: userId }),
          fetchSkills()
        ]);
        setCreatedSkills(mySkills);
        setAllSkills(catalog);
        setSelectedSkills(mySkills.map(s => s.id || s._id));
      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData.nombre?.trim() || !editData.usuario?.trim()) {
      showError("El nombre y el nombre de usuario son obligatorios.");
      return;
    }
    
    setSaving(true);
    try {
      const updated = await httpClient.put("/auth/update-profile", {
        nombre: editData.nombre.trim(),
        usuario: editData.usuario.trim(),
        intereses: [editData.bio.trim()],
      });
      setUserData(updated);
      storage.set("userName", updated.nombre);
      setShowEditModal(false);
      showSuccess("¡Perfil actualizado con éxito!");
    } catch (err) {
      showError(err.message || "Error al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const { passwordActual, passwordNueva, confirmar } = passwordData;
    
    if (!passwordActual || !passwordNueva || !confirmar) {
      showError("Todos los campos de seguridad son obligatorios.");
      return;
    }
    
    if (passwordNueva.length < 6) {
      showError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (passwordActual === passwordNueva) {
      showError("La nueva contraseña no puede ser igual a la actual.");
      return;
    }

    if (passwordNueva !== confirmar) {
      showError("La confirmación no coincide.");
      return;
    }

    setPasswordLoading(true);
    try {
      await httpClient.put("/auth/change-password", { 
        passwordActual: passwordActual, 
        passwordNueva: passwordNueva 
      });
      showSuccess("Contraseña actualizada correctamente.");
      setShowPasswordModal(false);
      setPasswordData({ passwordActual: "", passwordNueva: "", confirmar: "" });
    } catch (err) { 
      showError(err.message || "Error al actualizar contraseña."); 
    } finally { 
      setPasswordLoading(false); 
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showError("Ingresa tu contraseña para confirmar.");
      return;
    }
    
    const result = await AuraSwal.fire({
      title: '¿ELIMINAR CUENTA?',
      text: "Esta acción es definitiva y borrará todos tus datos. ¿Proceder con la baja?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'SÍ, ELIMINAR',
      cancelButtonText: 'CANCELAR'
    });

    if (!result.isConfirmed) return;

    setDeleteLoading(true);
    try {
      await httpClient.delete("/auth/delete-account", { 
        body: JSON.stringify({ password: deletePassword }), 
        headers: { "Content-Type": "application/json" } 
      });
      showSuccess("Cuenta eliminada correctamente.");
      logoutUser();
      navigate("/login");
    } catch (err) { 
      showError(err.message || "Error al eliminar cuenta."); 
    } finally { 
      setDeleteLoading(false); 
    }
  };

  const handleToggleSkill = async (skillId) => {
    const isSelected = selectedSkills.includes(skillId);
    
    try {
      if (isSelected) {
        await unassignSkill(skillId);
        setSelectedSkills(prev => prev.filter(id => id !== skillId));
      } else {
        await assignSkill(skillId);
        setSelectedSkills(prev => [...prev, skillId]);
      }
      
      // Actualizar la lista de "Mis Habilidades" en segundo plano
      const userId = storage.get("userId");
      const updatedMySkills = await fetchSkills({ mentorId: userId });
      setCreatedSkills(updatedMySkills);
      showSuccess("Habilidades actualizadas.");
    } catch (err) {
      showError("Error al actualizar la habilidad.");
    }
  };

  const inputStyle = { background:"#1a1a2e", border:"1px solid #333", borderRadius:"8px", padding:"0.7rem 2.8rem 0.7rem 1rem", color:"#fff", width:"100%", fontSize:"0.95rem", boxSizing:"border-box" };

  if (loading || !userData) {
    return (
      <div className="home-container">
        <div className="home-main-layout">
          <Sidebar rol={rol} />
          <main className="home-content">
            <GlobalHeader />
            <div className="loading-global-container">
              <div className="aura-spinner"></div>
              <p className="loading-text-neon">Sincronizando Aura...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.usuario}`;

  return (
    <div className="home-container">
      <div className="home-main-layout">
        <Sidebar rol={rol} />
        <main className="home-content">
          <GlobalHeader />
          
          <div className="estado-mentor-pill" style={{ marginBottom: "2rem" }}>
            <span>{rol === "mentor" ? "Modo Enseñanza" : "Modo Aprendizaje"}</span>
          </div>

          {/* Profile Header */}
          <section className="perfil-section">
            <div className="neon-card perfil-header-card">
              <div className="perfil-avatar-container">
                <img src={avatarUrl} alt="Avatar" className="perfil-avatar" />
                <div className="avatar-glow"></div>
              </div>
              <div className="perfil-info">
                <div className="perfil-title-row">
                  <h1 className="perfil-nombre">{userData.nombre}</h1>
                  <span className={`perfil-rol-badge ${rol}`}>{rol === "mentor" ? "Mentor" : "Aprendiz"}</span>
                </div>
                <h3 className="perfil-usuario">@{userData.usuario}</h3>
                <p className="perfil-bio" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginTop: "4px" }}>{userData.correo}</p>
              </div>
              <div className="perfil-actions">
                <button className="primary-btn-neon-s edit-btn" onClick={() => setShowEditModal(true)}>
                  <Edit3 size={16} /> Editar Perfil
                </button>
              </div>
            </div>

            <div className="perfil-grid-layout">
              {/* COLUMNA IZQUIERDA: Contenido Principal */}
              <div className="perfil-main-col">
                <div className="neon-card perfil-identity-card">
                  {/* Sección Sobre mí */}
                  <div className="card-inner-section">
                    <h2 className="section-subtitle-neon">
                      <FileText size={20} className="section-icon" /> Sobre mí
                    </h2>
                    <p className={`bio-text ${!(userData.bio || userData.intereses?.[0]) ? 'bio-placeholder' : ''}`}>
                      {userData.bio || userData.intereses?.[0] || "Aún no has escrito una descripción. ¡Haz clic en Editar Perfil para contarnos un poco sobre ti y tus metas!"}
                    </p>
                  </div>

                  <div className="card-divider" />

                  {/* Sección Habilidades / Especialidades */}
                  <div className="card-inner-section">
                    {rol !== "mentor" ? (
                      <>
                        <h2 className="section-subtitle-neon">
                          <Award size={20} className="section-icon" /> Habilidades en progreso
                        </h2>
                        {aprendizSkills.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                            {aprendizSkills.map((hab, i) => (
                              <SkillTag 
                                key={i} 
                                nombre={hab.nombre} 
                                nivel={hab.nivel} 
                                color={hab.nivel === "Avanzado" ? "#ff00ff" : hab.nivel === "Intermedio" ? "#ffff00" : "#00ffff"} 
                              />
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontStyle: "italic" }}>
                            No tienes habilidades registradas aún. ¡Entra a una sala en vivo para empezar a aprender!
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="perfil-skills-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                          <h2 className="section-subtitle-neon" style={{ margin: 0 }}>
                            <BookOpen size={20} className="section-icon" /> Gestión de Especialidades
                          </h2>
                          <div className="skills-tab-switcher" style={{ display: "flex", gap: "10px", background: "#0d0d1a", padding: "4px", borderRadius: "10px", border: "1px solid #333" }}>
                            <button 
                              className={`tab-btn ${activeTab === "mis-skills" ? "active" : ""}`}
                              onClick={() => setActiveTab("mis-skills")}
                              style={{ all: "unset", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer", transition: "0.3s", background: activeTab === "mis-skills" ? "rgba(0,255,255,0.1)" : "transparent", color: activeTab === "mis-skills" ? "#00ffff" : "#aaa" }}
                            >
                              Mis Skills
                            </button>
                            <button 
                              className={`tab-btn ${activeTab === "catalogo" ? "active" : ""}`}
                              onClick={() => setActiveTab("catalogo")}
                              style={{ all: "unset", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer", transition: "0.3s", background: activeTab === "catalogo" ? "rgba(0,255,255,0.1)" : "transparent", color: activeTab === "catalogo" ? "#00ffff" : "#aaa" }}
                            >
                              Catálogo
                            </button>
                          </div>
                        </div>
                        
                        <div className="skills-tab-content">
                          {activeTab === "mis-skills" ? (
                            <div style={{ width: "100%" }}>
                              {createdSkills.length > 0 ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                  {createdSkills.map((skill, i) => (
                                    <SkillTag key={i} nombre={skill.nombre} color="#ff00ff" />
                                  ))}
                                </div>
                              ) : (
                                <p style={{ color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>No tienes especialidades asignadas. Ve al catálogo para elegir las tuyas.</p>
                              )}
                            </div>
                          ) : (
                            <div style={{ width: "100%" }}>
                              <p style={{ fontSize: "0.85rem", color: "#aaa", marginBottom: "1rem" }}>Selecciona las habilidades que dominas para enseñar:</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {allSkills.map((skill) => {
                                  const isSelected = selectedSkills.includes(skill.id || skill._id);
                                  return (
                                    <div 
                                      key={skill.id || skill._id} 
                                      onClick={() => handleToggleSkill(skill.id || skill._id)}
                                      style={{
                                        padding: "0.5rem 1rem",
                                        borderRadius: "20px",
                                        border: isSelected ? "1px solid #ff00ff" : "1px solid #333",
                                        background: isSelected ? "rgba(255, 0, 255, 0.1)" : "transparent",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        color: isSelected ? "#ff00ff" : "#ccc",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        boxShadow: isSelected ? "0 0 10px rgba(255, 0, 255, 0.3)" : "none"
                                      }}
                                    >
                                      {skill.nombre}
                                      {isSelected && <Check size={14} />}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: Configuración y Seguridad */}
              <div className="perfil-side-col">
                
                {/* Preferencias */}
                <div className="neon-card config-list-container pref-card">
                  <h3 className="section-subtitle-neon" style={{ margin: 0 }}>
                    <Settings size={20} className="section-icon" /> Preferencias
                  </h3>
                  <div className="settings-row" style={{ marginTop: "0.5rem" }}>
                    <span className="settings-label">Tema Visual</span>
                    <div className="settings-action" style={{ width: "145px" }}>
                      <AuraSelect 
                        value={theme}
                        onChange={setTheme}
                        options={[
                          { value: "neon", label: "Neón" },
                          { value: "classic", label: "Aura" }
                        ]}
                        icon={Palette}
                      />
                    </div>
                  </div>
                </div>

                {/* Seguridad */}
                <div className="neon-card config-list-container sec-card">
                  <h3 className="section-subtitle-neon" style={{ margin: 0 }}>
                    <Shield size={20} className="section-icon" /> Seguridad
                  </h3>
                  
                  <div className="settings-row" style={{ marginTop: "0.5rem" }}>
                    <span className="settings-label">Contraseña</span>
                    <div className="settings-action">
                      <button className="primary-btn-neon-s" style={{ padding: "0.6rem 1.4rem", fontSize: "0.8rem", minWidth: "120px" }} onClick={() => setShowPasswordModal(true)}>
                        <RefreshCw size={14} style={{ marginRight: "8px" }} /> Actualizar
                      </button>
                    </div>
                  </div>
                  
                  <div className="danger-zone">
                    <div className="settings-row">
                      <span className="settings-label danger-label">Gestión Cuenta</span>
                      <div className="settings-action">
                        <button className="danger-btn-neon-s" style={{ padding: "0.6rem 1.4rem", fontSize: "0.8rem", minWidth: "120px" }} onClick={() => setShowDeleteModal(true)}>
                          <Trash2 size={14} style={{ marginRight: "8px" }} /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </main>
      </div>

      {showEditModal && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
          background: "rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", 
          justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)" 
        }}>
          <div className="neon-card" style={{ 
            width: "min(90%, 450px)", 
            padding: "2.5rem", 
            border: "1px solid rgba(0, 255, 255, 0.3)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Decoración Neón superior */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #00ffff, transparent)" }}></div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Edit3 size={24} color="#00ffff" />
                <h3 style={{ color: "#fff", margin: 0, fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.02em" }}>Editar Perfil</h3>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.target.style.color = "#ff00ff"}
                onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.4)"}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="mini-input-group">
                <label style={{ color: "#00ffff", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "800", letterSpacing: "1.5px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <User size={14} /> Nombre Completo
                </label>
                <input 
                  type="text" 
                  className="neon-input-s" 
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}
                  value={editData.nombre} 
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                  placeholder="Tu nombre real"
                />
              </div>

              <div className="mini-input-group">
                <label style={{ color: "#00ffff", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "800", letterSpacing: "1.5px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={14} /> Usuario
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }}>@</span>
                  <input 
                    type="text" 
                    className="neon-input-s" 
                    style={{ paddingLeft: "32px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}
                    value={editData.usuario} 
                    onChange={(e) => setEditData({ ...editData, usuario: e.target.value })}
                    placeholder="usuario123"
                  />
                </div>
              </div>

              <div className="mini-input-group">
                <label style={{ color: "#00ffff", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "800", letterSpacing: "1.5px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={14} /> Sobre mí (Descripción)
                </label>
                <textarea 
                  className="neon-input-s" 
                  style={{ minHeight: "120px", resize: "none", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", lineHeight: "1.6" }}
                  value={editData.bio} 
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Cuéntanos un poco sobre ti, tus metas o qué estás aprendiendo..."
                />
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>Esta descripción aparecerá en tu perfil público.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem" }}>
              <button 
                className="primary-btn-neon-s" 
                style={{ flex: 2, height: "52px" }}
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? <div className="aura-spinner-mini"></div> : <><Check size={18} style={{ marginRight: "8px" }} /> Guardar Cambios</>}
              </button>
              <button 
                className="danger-btn-neon-s" 
                style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,0,255,0.3)", height: "52px" }}
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay-neon" style={{ position:"fixed", top:0, left:0, width:"100vw", height:"100vh", background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter: "blur(8px)" }}>
          <div className="neon-card" style={{ padding:"2.5rem", width:"100%", maxWidth:"420px", display:"flex", flexDirection:"column", gap:"1.5rem", animation: "fadeInDown 0.3s ease-out" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ background: "rgba(0,255,255,0.1)", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", border: "1px solid #00ffff" }}>
                <ShieldCheck size={32} color="#00ffff" />
              </div>
              <h3 style={{ color:"#00ffff", margin:"0 0 0.5rem 0", fontSize: "1.5rem", fontWeight: "800" }}>Seguridad de Acceso</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", margin: 0 }}>Actualiza tu llave de acceso para mantener tu cuenta blindada.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
              <div className="mini-input-group">
                <label style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", display: "block" }}>Contraseña Actual</label>
                <div style={{ position:"relative" }}>
                  <input type={showActual ? "text" : "password"} placeholder="Ingresa tu clave actual" value={passwordData.passwordActual}
                    onChange={(e) => setPasswordData({ ...passwordData, passwordActual: e.target.value })}
                    className="neon-input-s" style={{ background: "rgba(255,255,255,0.03)" }} />
                  <span onClick={() => setShowActual(!showActual)} style={{ position:"absolute", right:"1rem", top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#aaa" }}>
                    {showActual ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              <div className="mini-input-group">
                <label style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", display: "block" }}>Nueva Contraseña</label>
                <div style={{ position:"relative" }}>
                  <input type={showNueva ? "text" : "password"} placeholder="Mínimo 8 caracteres" value={passwordData.passwordNueva}
                    onChange={(e) => setPasswordData({ ...passwordData, passwordNueva: e.target.value })} className="neon-input-s" style={{ background: "rgba(255,255,255,0.03)" }} />
                  <span onClick={() => setShowNueva(!showNueva)} style={{ position:"absolute", right:"1rem", top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#aaa" }}>
                    {showNueva ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              <div className="mini-input-group">
                <label style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", display: "block" }}>Confirmar Nueva Clave</label>
                <div style={{ position:"relative" }}>
                  <input type={showConfirmar ? "text" : "password"} placeholder="Repite tu nueva clave" value={passwordData.confirmar}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })} className="neon-input-s" style={{ background: "rgba(255,255,255,0.03)" }} />
                  <span onClick={() => setShowConfirmar(!showConfirmar)} style={{ position:"absolute", right:"1rem", top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#aaa" }}>
                    {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection: "column", gap:"1rem", marginTop:"1rem" }}>
              <button className="primary-btn-neon-s" style={{ width: "100%", height: "48px" }} onClick={handleChangePassword} disabled={passwordLoading}>
                {passwordLoading ? <div className="aura-spinner-mini"></div> : "Actualizar Clave de Acceso"}
              </button>
              <button className="danger-btn-neon-s" style={{ width: "100%", height: "48px", background: "transparent", border: "1px solid rgba(255,0,255,0.3)" }} onClick={() => setShowPasswordModal(false)}>Cancelar Protocolo</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay-neon" style={{ position:"fixed", top:0, left:0, width:"100vw", height:"100vh", background:"rgba(20,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter: "blur(10px)" }}>
          <div className="neon-card" style={{ padding:"2.5rem", width:"100%", maxWidth:"420px", display:"flex", flexDirection:"column", gap:"1.5rem", border: "1px solid #ff0055", animation: "fadeInDown 0.3s ease-out" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ background: "rgba(255,0,85,0.1)", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", border: "1px solid #ff0055" }}>
                <AlertTriangle size={32} color="#ff0055" />
              </div>
              <h3 style={{ color:"#ff0055", margin:"0 0 0.5rem 0", fontSize: "1.5rem", fontWeight: "800" }}>Zona de Peligro</h3>
              <p style={{ color: "#ff80a4", fontSize: "0.9rem", margin: 0, fontWeight: "600" }}>¿Estás absolutamente seguro?</p>
            </div>

            <div style={{ background: "rgba(255,0,85,0.05)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid #ff0055" }}>
              <p style={{ color:"rgba(255,255,255,0.8)", margin:0, fontSize: "0.85rem", lineHeight: "1.5" }}>
                Esta acción es <strong>irreversible</strong>. Se eliminarán permanentemente tus logros, conexiones y todo el historial de tu cuenta en AuraSkill.
              </p>
            </div>

            <div className="mini-input-group">
              <label style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", display: "block" }}>Ingresa tu contraseña para confirmar</label>
              <input type="password" placeholder="Tu clave de acceso" value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="neon-input-s" style={{ border: "1px solid rgba(255,0,85,0.3)", background: "rgba(255,0,85,0.03)" }} />
            </div>

            <div style={{ display:"flex", flexDirection: "column", gap:"1rem", marginTop:"0.5rem" }}>
              <button className="danger-btn-neon-s" style={{ width: "100%", height: "48px" }} onClick={handleDeleteAccount} disabled={deleteLoading}>
                {deleteLoading ? "Procesando..." : "Eliminar Permanentemente"}
              </button>
              <button className="primary-btn-neon-s" style={{ width: "100%", height: "48px", background: "transparent", border: "1px solid rgba(0,255,255,0.3)" }} onClick={() => setShowDeleteModal(false)}>Cancelar y Volver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Perfil;

