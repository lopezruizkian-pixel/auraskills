import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader, Eye, EyeOff, ArrowLeft } from "lucide-react";
import mascotaImg from "../assets/mascota.png";
import "../Styles/Login.css";
import { loginUser } from "../services/authService";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { validateEmail } from "../services/validation";

function Login() {
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();
  const { setAuthUser } = useAuth();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!correo.trim()) {
      newErrors.correo = "El correo es requerido";
    } else if (!validateEmail(correo)) {
      newErrors.correo = "El correo no es válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginUser(correo, password);

      // Guardar datos del usuario usando el hook
      if (data.token) {
        setAuthUser({
          token: data.token,
          userId: data.user?.id,
          userName: data.user?.nombre,
          userRole: data.user?.rol
        });
      }

      showSuccess("¡Sesión iniciada correctamente!");
      setTimeout(() => navigate("/home"), 500);

    } catch (err) {
      const errorMessage = err.message || "Error al iniciar sesión";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Botón de Regreso */}
      <button className="back-btn-minimal" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} />
        <span>Volver</span>
      </button>

      <div className="split-screen-wrapper">
        
        <div className="mascota-side">
          <img src={mascotaImg} alt="Mascota Aura" className="mascota-img" />
          <div className="aura-core"></div>
          <div className="aura-ring"></div>
        </div>

        <div className="login-box">
          <div className="login-header">
            <h2>Bienvenido</h2>
            <p className="login-subtitle">Ingresa a tu cuenta de AuraSkill</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Correo"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  if (errors.correo) setErrors({ ...errors, correo: "" });
                }}
                disabled={isLoading}
                className={errors.correo ? "input-error" : ""}
              />
              {errors.correo && <span className="error-text">{errors.correo}</span>}
            </div>

            <div className="input-group">
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  disabled={isLoading}
                  className={errors.password ? "input-error" : ""}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ 
                    position: "absolute", 
                    right: "1rem", 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    cursor: "pointer", 
                    color: "rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button 
              className="primary-btn" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="spinner" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="register-link">
            <p>
              ¿No tienes una cuenta? <br />
              <Link to="/registro">¡Regístrate ahora!</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;