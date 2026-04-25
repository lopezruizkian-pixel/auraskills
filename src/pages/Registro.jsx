import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import mascotaImg from "../assets/mascota.png";
import "../Styles/Registro.css";
import { registerUser } from "../services/authService";
import { useToast } from "../hooks/useToast";

function Registro() {
  const { success: showSuccess, error: showError } = useToast();
  const [rol, setRol] = useState("alumno");
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleRegistro = async () => {
    if (!nombre || !usuario || !correo || !password) {
      showError("Todos los campos son obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      showError("Las contraseñas no coinciden");
      return;
    }
    try {
      const userData = {
        nombre,
        usuario,
        correo,
        password,
        rol,
        habilidades: [] // Se quitan del registro, se configuran en el perfil
      };
      await registerUser(userData);
      showSuccess("¡Bienvenido a AuraSkill! Registro completado.");
      navigate("/login");
    } catch (error) {
      showError(error.message);
    }
  };

  const handleBack = () => {
    const hasHistory = window.history.length > 1;
    const referrer = document.referrer;
    const isInternal = referrer.includes(window.location.origin);

    if (hasHistory && isInternal && !referrer.includes("/home") && !referrer.includes("/perfil") && !referrer.includes("/salas-activas")) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="registro-container">
      {/* Botón de Regreso */}
      <button className="back-btn-minimal" onClick={handleBack}>
        <ArrowLeft size={24} />
        <span>Volver</span>
      </button>

      <div className="split-screen-wrapper">
        <div className="mascota-side">
          <img src={mascotaImg} alt="Mascota Aura" className="mascota-img" />
          <div className="aura-core"></div>
          <div className="aura-ring"></div>
        </div>
        <div className="registro-box-extended">
          <div className="registro-header">
            <h2>Únete a la Aventura</h2>
            <p className="registro-subtitle">Crea tu cuenta y empieza a aprender</p>
          </div>

          <div className="registro-form-grid">
            <div className="input-group">
              <label>Nombre</label>
              <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Usuario</label>
              <input type="text" placeholder="Nombre de usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
            </div>
            <div className="input-group full-width">
              <label>Correo</label>
              <input type="email" placeholder="tu@correo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Contraseña</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", boxSizing: "border-box" }} />
                <span onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>
              </div>
            </div>
            <div className="input-group">
              <label>Confirmar</label>
              <div style={{ position: "relative" }}>
                <input type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: "100%", boxSizing: "border-box" }} />
                <span onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", cursor:"pointer", color: "rgba(255,255,255,0.4)" }}>
                  {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>
              </div>
            </div>
          </div>

          <div className="role-section">
            <label className="role-title">Escoge tu Rol</label>
            <div className="role-options">
              <label className="radio-label">
                <input type="radio" name="rol" value="mentor" checked={rol === "mentor"} onChange={(e) => setRol(e.target.value)} />
                <span>Mentor</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="rol" value="alumno" checked={rol === "alumno"} onChange={(e) => setRol(e.target.value)} />
                <span>Alumno</span>
              </label>
            </div>
          </div>

          <button className="primary-btn" onClick={handleRegistro}>
            Registrarse
          </button>

          <div className="register-link">
            <p>
              ¿Ya tienes una cuenta? <br />
              <Link to="/login" style={{ color: "var(--neon-cyan)", fontWeight: "700", textDecoration: "none" }}>
                ¡Inicia sesión aquí!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;
