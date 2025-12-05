import React, { useState, useEffect } from 'react';
import { getServices, getMasters, getUsers } from '../store/dataStore';
import ClientSelector from './ClientSelector';
import CarSelector from './CarSelector';

export default function EditForm({ initial = {}, onChange }) {
  const [form, setForm] = useState({
    client: '', car: '', service: '', price: '', date: '', payment_status: '', master: ''
  });
  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [clients, setClients] = useState([]);

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
      
      setForm({
        client: clientDisplayValue,
        car: initial.car || '',
        service: initial.service || '',
        price: initial.price || '',
        date: initial.date || '',
        payment_status: initial.payment_status || '',
        master: initial.master || ''
      });
    }
  }, [initial, clients]);

  // when service selected, update price automatically
  useEffect(() => {
    if (!form.service) return;
    const svc = services.find(s => String(s.id) === String(form.service));
    if (svc) {
      // Always update price when service changes
      setForm(prev => ({ ...prev, price: svc.price }));
    }
  }, [form.service, services]);

  useEffect(() => onChange && onChange(form), [form]);

  const statusOptions = [
    { value: 'in-progress', label: 'В работе' },
    { value: 'completed', label: 'Проведена' },
    { value: 'cancelled', label: 'Отменена' }
  ];

  // Filter masters based on selected service
  const filteredMasters = form.service
    ? masters.filter(m => (m.services || []).map(s => String(s)).includes(String(form.service)))
    : masters;

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
      <label>Услуга
        <select value={form.service} onChange={e=>setForm({...form, service: e.target.value, master: ''})}>
          <option value="">-- выберите услугу --</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.price} ₽</option>)}
        </select>
      </label>
      <label>Цена<input type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} /></label>
      <label>Дата записи<input type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} /></label>
      <label>Мастер
        <select value={form.master} onChange={e=>setForm({...form, master: e.target.value})} disabled={!form.service}>
          <option value="">-- выберите мастера --</option>
          {filteredMasters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </label>
      <label>Статус
        <select value={form.payment_status} onChange={e=>setForm({...form, payment_status: e.target.value})}>
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>
    </div>
  );
}
