import { useState } from 'react';
import ServicesManagement from './ServicesManagement';
import UsersManagement from './UsersManagement';
import ShiftsManagement from './ShiftsManagement';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('shifts');

  const tabs = [
    { id: 'shifts', label: '⏰ Смены' },
    { id: 'services', label: '🔧 Услуги' },
    { id: 'users', label: '👥 Пользователи' }
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px', 
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '12px'
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

      <div>
        {activeTab === 'shifts' && <ShiftsManagement />}
        {activeTab === 'services' && <ServicesManagement />}
        {activeTab === 'users' && <UsersManagement />}
      </div>
    </div>
  );
}
