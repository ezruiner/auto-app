import { useState, useEffect, useRef } from 'react';
import { getUsers, getServices, addUser, updateUser, deleteUser } from '../store/dataStore';
import Modal from './Modal';

export default function UsersManagement({ filters = {}, onFiltersChange = () => {} }) {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    role: 'client',
    services: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);
  
  const search = filters.search || '';
  const roleFilter = filters.role || 'all';

  useEffect(() => {
    setUsers(getUsers());
    setServices(getServices());
  }, []);

  // Закрытие фильтра при клике вне окна
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilters]);

  const handleAdd = () => {
    setFormData({ name: '', role: 'client', services: [] });
    setModal({ type: 'add' });
  };

  const handleEdit = (user) => {
    setFormData({ 
      name: user.name, 
      role: user.role,
      services: user.services || []
    });
    setModal({ type: 'edit', id: user.id });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Введите имя пользователя');
      return;
    }

    if (modal.type === 'add') {
      addUser(formData);
    } else {
      updateUser(modal.id, formData);
    }

    setUsers(getUsers());
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить пользователя?')) {
      deleteUser(id);
      setUsers(getUsers());
    }
  };

  const getRoleName = (role) => {
    const roles = { operator: 'Оператор', master: 'Мастер', client: 'Клиент' };
    return roles[role] || role;
  };

  const total = users.length;
  const operators = users.filter(u => u.role === 'operator').length;
  const masters = users.filter(u => u.role === 'master').length;
  const clients = users.filter(u => u.role === 'client').length;

  const filteredUsers = users.filter(u => {
    const roleOk = roleFilter === 'all' ? true : u.role === roleFilter;
    const searchOk = (u.name || '').toLowerCase().includes(search.toLowerCase());
    return roleOk && searchOk;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Управление пользователями</h2>
        <button className="btn primary" onClick={handleAdd}>+ Добавить пользователя</button>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px', marginTop: '-14px' }}>
        <div className="panel stat-card"><div className="panel-body"><div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Всего пользователей</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{total}</div></div></div>
        <div className="panel stat-card"><div className="panel-body"><div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Операторов</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{operators}</div></div></div>
        <div className="panel stat-card"><div className="panel-body"><div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Мастеров</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{masters}</div></div></div>
        <div className="panel stat-card"><div className="panel-body"><div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Клиентов</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{clients}</div></div></div>
      </div>

      <div className="filter-compact" ref={filterRef}>
        <button 
          className="btn filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          title="Показать/скрыть фильтры"
        >
          🔍 Фильтры
        </button>
        
        {showFilters && (
          <div className="filter-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="filter-item">
              <label>Поиск</label>
              <input 
                className="filter-input" 
                value={search} 
                onChange={e => onFiltersChange({ ...filters, search: e.target.value })} 
                placeholder="Поиск по имени" 
                aria-label="Поиск по имени пользователя" 
                role="searchbox"
              />
            </div>
            <div className="filter-item">
              <label>Роль</label>
              <select 
                className="filter-select" 
                value={roleFilter} 
                onChange={e => onFiltersChange({ ...filters, role: e.target.value })}
                aria-label="Фильтр по роли"
              >
                <option value="all">Все роли</option>
                <option value="operator">Оператор</option>
                <option value="master">Мастер</option>
                <option value="client">Клиент</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Имя</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Роль</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Услуги/Информация</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => {
            const userServices = services.filter(s => user.services?.includes(s.id));
            return (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px' }}>{user.name}</td>
                <td style={{ padding: '12px' }}>{getRoleName(user.role)}</td>
                <td style={{ padding: '12px' }}>
                  {user.role === 'master' && userServices.length > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {userServices.map(s => s.name).join(', ')}
                    </div>
                  )}
                  {user.role === 'operator' && user.currentShift && (
                    <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>✓ Смена открыта</div>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <button className="btn btn.small" onClick={() => handleEdit(user)}>✏️</button>
                  <button className="btn btn.small danger" onClick={() => handleDelete(user.id)}>🗑️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {modal && (
        <Modal 
          title={modal.type === 'add' ? 'Добавить пользователя' : 'Редактировать пользователя'} 
          onCancel={() => setModal(null)} 
          onConfirm={handleSave}
          confirmLabel={modal.type === 'add' ? 'Добавить' : 'Сохранить'}
        >
          <div className="modal-form">
            <label>Имя
              <input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Иван Иванов"
              />
            </label>
            <label>Роль
              <select 
                value={formData.role} 
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="client">Клиент</option>
                <option value="operator">Оператор</option>
                <option value="master">Мастер</option>
              </select>
            </label>
            {formData.role === 'master' && (
              <div style={{ display: 'block', marginBottom: '16px' }}>
                <div style={{ fontWeight: 500, marginBottom: '8px' }}>Услуги (выберите несколько)</div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px',
                  backgroundColor: 'var(--bg-secondary)'
                }}>
                  {services.map(service => (
                    <div key={service.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const newServices = formData.services.includes(service.id)
                        ? formData.services.filter(id => id !== service.id)
                        : [...formData.services, service.id];
                      setFormData({ ...formData, services: newServices });
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>{service.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{service.price} ₽</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const newServices = e.target.checked
                              ? [...formData.services, service.id]
                              : formData.services.filter(id => id !== service.id);
                            setFormData({ ...formData, services: newServices });
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
