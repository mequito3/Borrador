// components/Dashboard/Sidebar/UserInfo.tsx
import { useEffect, useState } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { getToken, logout, parseToken } from "../../../services/authService";

const UserInfo = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    const payload = parseToken(token);
    if (payload && payload.sub) {
      setUsername(payload.sub);
    }
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      logout(); // 🔐 Limpia el token
      window.location.href = "/"; // Redirige al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="sidebar-userinfo">
      <div className="user-profile">
        <div className="user-avatar">
          <FiUser size={16} />
        </div>
        <div className="user-details">
          <p className="user-label">Agente conectado</p>
          <p className="user-name">{username || "Cargando..."}</p>
        </div>
      </div>
      <button 
        className="logout-button" 
        onClick={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <>
            <FiLogOut size={16} />
            Cerrar sesión
          </>
        )}
      </button>
    </div>
  );
};

export default UserInfo;
