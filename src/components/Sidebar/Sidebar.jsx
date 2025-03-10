import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import { FaChartBar, FaUsers, FaFilter, FaCog, FaBars } from 'react-icons/fa';

const Sidebar = ({ selectedTool, setSelectedTool }) => {
  const [collapsed, setCollapsed] = useState(false);

  const tools = [
    { id: 'ProductAnalytics', label: 'Продуктовая аналитика', icon: <FaChartBar className={styles.icon} /> },
    { id: 'RFMAnalysis', label: 'RFM анализ', icon: <FaUsers className={styles.icon} /> },
    { id: 'ClientFilter', label: 'Фильтр по клиентам', icon: <FaFilter className={styles.icon} /> },
    { id: 'LoyaltySettings', label: 'Настройки программы лояльности', icon: <FaCog className={styles.icon} /> },
  ];

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logo}>
        {!collapsed ? 'Логотип' : 'Л'}
      </div>
      <ul className={styles.toolList}>
        {tools.map(tool => (
          <li key={tool.id} className={styles.toolItem}>
            <button
              className={`${styles.toolButton} ${selectedTool === tool.id ? styles.active : ''}`}
              onClick={() => setSelectedTool(tool.id)}
              title={tool.label}
            >
              {tool.icon}
              <span className={styles.label}>{tool.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <button className={styles.toggleButton} onClick={() => setCollapsed(!collapsed)}>
        <FaBars />
      </button>
    </div>
  );
};

export default Sidebar;