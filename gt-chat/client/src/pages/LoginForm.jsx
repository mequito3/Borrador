import { useState, useRef } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import "../styles/LoginForm.css"; // Ensure you have the correct path to your CSS file
const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas. Por favor verifique.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="login-glass-container">
        <div className="login-content">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-circle">
                <FiArrowRight className="logo-icon" />
              </div>
              <h1>Soporte<span>Pro</span></h1>
            </div>
            <p className="login-tagline">Sistema de gestión para agentes</p>
          </div>

          <form onSubmit={handleLogin} className="login-form" ref={formRef}>
            {error && <div className="error-message">{error}</div>}

            <div className="input-group">
              <div className="input-icon">
                <FiUser />
              </div>
              <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <FiLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Recordar sesión</span>
              </label>
              <a href="/forgot-password" className="forgot-password">¿Olvidó su contraseña?</a>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="button-spinner"></div>
              ) : (
                <>
                  Iniciar sesión
                  <FiArrowRight className="button-icon" />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>¿No tienes una cuenta? <a href="/register">Solicitar acceso</a></p>
            <p className="version-text">v</p>
          </div>
        </div>

        <div className="login-decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;