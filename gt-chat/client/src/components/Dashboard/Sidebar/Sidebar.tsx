import { useState, useEffect } from "react";
import SidebarMenu from "./SidebarMenu";
import UserInfo from "./UserInfo";
import Logo from "./Logo";
import '../../../styles/Sidebar.css';

interface SidebarProps {
  filterSystem: string;
  setFilterSystem: (value: string) => void;
  currentView: string;
  setCurrentView: (value: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({
  filterSystem,
  setFilterSystem,
  currentView,
  setCurrentView,
  isOpen = false,
  onClose,
}: SidebarProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar sidebar al hacer clic en el overlay
  const handleOverlayClick = () => {
    if (onClose) {
      onClose();
    }
  };

  // Prevenir cierre al hacer clic dentro del sidebar
  const handleSidebarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
          onClick={handleOverlayClick}
        />
      )}
      
      {/* Sidebar principal */}
      <aside 
        className={`sidebar ${isOpen ? 'open' : ''}`}
        onClick={handleSidebarClick}
      >
        <div className="sidebar-logo">
          <Logo />
          <span>SoportePro</span>
        </div>

        <SidebarMenu
          filterSystem={filterSystem}
          setFilterSystem={setFilterSystem}
          selectedMenu={currentView}
          setSelectedMenu={setCurrentView}
        />

        <UserInfo />
      </aside>
    </>
  );
};

export default Sidebar;
