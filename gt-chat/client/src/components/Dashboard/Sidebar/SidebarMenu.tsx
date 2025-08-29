import { FiMessageSquare, FiArchive, FiBarChart } from 'react-icons/fi';
import '../../../styles/Sidebar.css';

interface Props {
  filterSystem: string;
  setFilterSystem: (value: string) => void;
  selectedMenu: string;
  setSelectedMenu: (value: string) => void;
}

const SidebarMenu = ({
  filterSystem,
  setFilterSystem,
  selectedMenu,
  setSelectedMenu,
}: Props) => {
  const menuItems = [
    {
      id: 'chats',
      label: 'Chats activos',
      icon: <FiMessageSquare className="icon" />,
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: <FiArchive className="icon" />,
    },    {
      id: 'estadisticas',
      label: 'Estadísticas',
      icon: <FiBarChart className="icon" />,
    },
  ];

  return (
    <div className="sidebar-menu">
      <h3>Filtrar por sistema</h3>
      <select
        value={filterSystem}
        onChange={(e) => setFilterSystem(e.target.value)}
      >
        <option value="all">Todos los sistemas</option>
        <option value="geoportal">Geoportal</option>
        <option value="erp">Sistema ERP</option>
        <option value="avaluos">Avalúos</option>
      </select>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={selectedMenu === item.id ? "active" : ""}
            >
              <button
                onClick={() => setSelectedMenu(item.id)}
                type="button"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SidebarMenu;
