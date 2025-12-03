import { useState, useEffect } from 'react';
import { getUsers, getServices, addUser, updateUser, deleteUser } from '../store/dataStore';
import Modal from './Modal';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    role: 'client',
    services: []
  });

  useEffect(() => {
    setUsers(getUsers());
    setServices(getServices());
  }, []);

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Пользователи</h2>
        <button className="btn primary" onClick={handleAdd}>+ Добавить пользователя</button>
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
          {users.map(user => {
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
              <label>Услуги (выберите несколько)
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {services.map(service => (
                    <div key={service.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '6px 8px', borderRadius: 6, background: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ fontWeight: 500 }}>{service.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{service.price} ₽</div>
                      </div>
                      <div>
                        <input 
                          type="checkbox" 
                          checked={formData.services.includes(service.id)}
                          onChange={e => {
                            const newServices = e.target.checked 
                              ? [...formData.services, service.id]
                              : formData.services.filter(id => id !== service.id);
                            setFormData({ ...formData, services: newServices });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </label>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
