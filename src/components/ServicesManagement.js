import { useState, useEffect } from 'react';
import { getServices, addService, updateService, deleteService } from '../store/dataStore';
import Modal from './Modal';

export default function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '' });

  useEffect(() => {
    setServices(getServices());
  }, []);

  const handleAdd = () => {
    setFormData({ name: '', price: '' });
    setModal({ type: 'add' });
  };

  const handleEdit = (service) => {
    setFormData({ name: service.name, price: service.price });
    setModal({ type: 'edit', id: service.id });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Введите название услуги');
      return;
    }

    if (modal.type === 'add') {
      addService(formData);
    } else {
      updateService(modal.id, formData);
    }

    setServices(getServices());
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить услугу?')) {
      deleteService(id);
      setServices(getServices());
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Услуги</h2>
        <button className="btn primary" onClick={handleAdd}>+ Добавить услугу</button>
      </div>

      <div className="admin-grid">
        {services.map(service => (
          <div key={service.id} className="card service-card">
            <div>
              <h4 style={{ margin: '0 0 8px 0' }}>{service.name}</h4>
              <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>{service.price} ₽</p>
            </div>
            <div className="service-actions">
              <button className="btn btn.small" onClick={() => handleEdit(service)}>✏️ Редактировать</button>
              <button className="btn btn.small danger" onClick={() => handleDelete(service.id)}>🗑️ Удалить</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal 
          title={modal.type === 'add' ? 'Добавить услугу' : 'Редактировать услугу'} 
          onCancel={() => setModal(null)} 
          onConfirm={handleSave}
          confirmLabel={modal.type === 'add' ? 'Добавить' : 'Сохранить'}
        >
          <div className="modal-form">
            <label>Название услуги
              <input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Замена масла"
              />
            </label>
            <label>Цена (₽)
              <input 
                type="number"
                value={formData.price} 
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="1000"
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
