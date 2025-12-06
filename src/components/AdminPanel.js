import { useState, useEffect } from 'react';
import ServicesManagement from './ServicesManagement';
import UsersManagement from './UsersManagement';
import ShiftsManagement from './ShiftsManagement';

export default function AdminPanel() {
  const isMobile = () => window.innerWidth < 768;
  const [activeTab, setActiveTab] = useState(isMobile() ? 'users' : 'shifts');

  const tabs = [
    { id: 'users', label: '👥 Пользователи' },
    { id: 'shifts', label: '⏰ Смены' },
    { id: 'services', label: '🔧 Услуги' },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '12px',
        paddingTop: '12px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content-area">
        {activeTab === 'shifts' && <ShiftsManagement />}
        {activeTab === 'services' && <ServicesManagement />}
        {activeTab === 'users' && <UsersManagement />}
      </div>
    </div>
  );
}
