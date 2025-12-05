import React, { useState, useEffect } from 'react';
import { getServices, getMasters, getUsers } from '../store/dataStore';
import ClientSelector from './ClientSelector';
import CarSelector from './CarSelector';
import MasterSelector from './MasterSelector';
import ServiceSelector from './ServiceSelector';

export default function EditForm({ initial = {}, onChange }) {
  const [form, setForm] = useState({
    client: '', car: '', service: '', price: '', date: '', payment_status: '', master: ''
  });
  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredMasters, setFilteredMasters] = useState([]);

  useEffect(() => {
    setServices(getServices());
    setMasters(getMasters());
    setClients(getUsers().filter(u => u.role === 'client'));
  }, []);

  useEffect(() => {
    if (initial) {
      // Resolve client ID to client name if needed
      let clientDisplayValue = initial.client || '';
      if (initial.client && !initial.clientName) {
        // Try to find client by ID if only ID is available
        const foundClient = clients.find(c => String(c.id) === String(initial.client));
        if (foundClient) {
          clientDisplayValue = foundClient.name;
        }
      } else if (initial.clientName) {
        clientDisplayValue = initial.clientName;
      }

      // Resolve master ID to master name if needed
      let masterDisplayValue = initial.master || '';
      if (initial.master && typeof initial.master === 'number') {
        // Try to find master by ID if only ID is available
        const foundMaster = masters.find(m => m.id === initial.master);
        if (foundMaster) {
          masterDisplayValue = foundMaster.name;
        }
      }

      setForm({
        client: clientDisplayValue,
        car: initial.car || '',
        service: initial.service || '',
        price: initial.price || '',
        date: initial.date || '',
        payment_status: initial.payment_status || '',
        master: masterDisplayValue
      });
    }
  }, [initial, clients, masters]);

  useEffect(() => {
    // Убеждаемся, что цена всегда соответствует выбранной услуге
    const formData = { ...form };
    if (formData.service) {
      const selected = services.find(s => s.id === formData.service);
      if (selected) {
        formData.price = selected.price;
      }
    }
    onChange && onChange(formData);
  }, [form, services, onChange]);

  const statusOptions = [
    { value: 'in-progress', label: 'В работе' },
    { value: 'completed', label: 'Проведена' },
    { value: 'cancelled', label: 'Отменена' }
  ];

  // Filter masters based on selected service
  useEffect(() => {
    const filtered = form.service
      ? masters.filter(m => (m.services || []).map(s => String(s)).includes(String(form.service)))
      : masters;
    setFilteredMasters(filtered);
  }, [form.service, masters]);

  const getServicePrice = (id) => {
    const s = services.find(x => x.id === id);
    return s ? s.price : '';
  };

  return (
    <div className="modal-form">
      <ClientSelector
        clients={clients}
        value={form.client}
        onChange={(clientName) => setForm({...form, client: clientName})}
        required
      />
      <CarSelector
        value={form.car}
        onChange={(carName) => setForm({...form, car: carName})}
        required
      />
      <ServiceSelector
        services={services}
        value={form.service}
        onChange={(serviceId) => {
          const selected = services.find(s => s.id === serviceId);
          setForm(prev => ({ ...prev, service: serviceId, price: selected ? selected.price : prev.price }));
        }}
        required
      />
      <label>Цена
        <input
          type="text"
          value={form.service ? `${getServicePrice(form.service)} ₽` : (form.price ? `${form.price} ₽` : '')}
          readOnly
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => e.preventDefault()}
          style={{
            appearance: 'textfield',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '16px',
            width: '100%',
            outline: 'none',
            cursor: 'default'
          }}
        />
      </label>
      <label>Дата записи<input type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} /></label>
      <MasterSelector
        masters={filteredMasters}
        value={form.master}
        onChange={(masterName) => setForm({...form, master: masterName})}
        required
      />
      <label>Статус
        <select value={form.payment_status} onChange={e=>setForm({...form, payment_status: e.target.value})}>
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>
    </div>
  );
}
