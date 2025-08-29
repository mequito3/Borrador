import React from "react";
import "../../../styles/StatisticsPanel.css";

interface Stats {
  totalSessions: number;
  activeSessions: number;
  closedSessions: number;
  lastSession: string | null;
}

interface Props {
  stats: Stats;
}

const StatisticsPanel: React.FC<Props> = ({ stats }) => {
  const statisticsData = [
    {
      label: "Total de sesiones",
      value: stats.totalSessions,
      type: "primary"
    },
    {
      label: "Sesiones activas",
      value: stats.activeSessions,
      type: "positive"
    },
    {
      label: "Sesiones cerradas",
      value: stats.closedSessions,
      type: "neutral"
    },
    {
      label: "Última sesión iniciada",
      value: stats.lastSession
        ? new Date(stats.lastSession).toLocaleString("es-ES")
        : "No disponible",
      type: "info"
    }
  ];

  return (
    <section className="estadisticas-section">
      <h2>Estadísticas generales</h2>
      <ul>
        {statisticsData.map((stat, index) => (
          <li key={index} className={`stat-item stat-${stat.type}`}>
            <strong>{stat.label}:</strong>
            <span className="stat-value">{stat.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default StatisticsPanel;
