import { useState, useEffect } from 'react';
import ClientSelector from './ClientSelector';
import CarSelector from './CarSelector';
import { getServices, getUsers, getMasters, findOrCreateClient, addCarToHistory } from '../store/dataStore';

export default function RecordForm({ initial = {}, onChange }) {
  const [form, setForm] = useState({
    client: '',
    car: '',
    service: '',
    price: '',
    date: '',
    master: '',
    payment_status: "Pending"
  });

  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [masters, setMasters] = useState([]);

  useEffect(() => {
    setServices(getServices());
    setClients(getUsers().filter(u => u.role === 'client'));
    setMasters(getMasters());
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
        master: initial.master || '',
        payment_status: initial.payment_status || 'Pending'
      });
    }
  }, [initial, clients]);

  useEffect(() => onChange && onChange(form), [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // when service selected, update price automatically and filter masters
  useEffect(() => {
    if (!form.service) return;
    const svc = services.find(s => String(s.id) === String(form.service));
    if (svc) {
      // Always update price when service changes
      setForm(prev => ({ ...prev, price: svc.price }));
    }
  }, [form.service, services]);

  // Filter masters based on selected service
  const filteredMasters = form.service
    ? masters.filter(m => (m.services || []).map(s => String(s)).includes(String(form.service)))
    : masters;

  // Helper function to resolve client data (used by parent component)
  const resolveClientData = (clientValue) => {
    const clientName = clientValue.trim();
    let finalClientData = { id: clientName, name: clientName };
    
    if (clientName) {
      const existingClient = clients.find(c => 
        c.name.toLowerCase() === clientName.toLowerCase()
      );
      
      if (!existingClient) {
        const newClient = findOrCreateClient(clientName);
        if (newClient) {
          finalClientData = { id: newClient.id, name: newClient.name };
          setClients(getUsers().filter(u => u.role === 'client'));
        }
      } else {
        finalClientData = { id: existingClient.id, name: existingClient.name };
      }
    }

    return finalClientData;
  };

  // Expose helper function for parent component to use
  RecordForm.resolveClientData = resolveClientData;

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
        <select 
          value={form.service} 
          onChange={e => setForm({...form, service: e.target.value, master: ''})}
          required
        >
          <option value="">-- выберите услугу --</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.price} ₽</option>)}
        </select>
      </label>
      
      <label>Цена
        <input 
          type="number" 
          value={form.price} 
          onChange={e => setForm({...form, price: e.target.value})}
          required
          min="0"
          step="0.01"
        />
      </label>
      
      <label>Мастер
        <select 
          value={form.master} 
          onChange={e => setForm({...form, master: e.target.value})}
          disabled={!form.service}
          required
        >
          <option value="">-- выберите мастера --</option>
          {filteredMasters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </label>
      
      <label>Дата записи
        <input 
          type="date" 
          value={form.date} 
          onChange={e => setForm({...form, date: e.target.value})}
          required
        />
      </label>
      
      <label>Статус
        <select 
          value={form.payment_status} 
          onChange={e => setForm({...form, payment_status: e.target.value})}
        >
          <option value="Pending">Ожидает</option>
          <option value="in-progress">В работе</option>
          <option value="completed">Проведена</option>
          <option value="cancelled">Отменена</option>
        </select>
      </label>
    </div>
  );
}
