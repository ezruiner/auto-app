import { useState, useEffect } from 'react';
import ClientSelector from './ClientSelector';
import CarSelector from './CarSelector';
import MasterSelector from './MasterSelector';
import ServiceSelector from './ServiceSelector';
import { getServices, getUsers, getMasters, findOrCreateClient, addCarToHistory } from '../store/dataStore';

export default function RecordForm({ initial = {}, onChange, onFormDataChange }) {
  // Простая форма состояний - каждое поле отдельно
  const [client, setClient] = useState('');
  const [car, setCar] = useState('');
  const [service, setService] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [master, setMaster] = useState('');

  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [masters, setMasters] = useState([]);
  const [filteredMasters, setFilteredMasters] = useState([]);

  useEffect(() => {
    setServices(getServices());
    setClients(getUsers().filter(u => u.role === 'client'));
    setMasters(getMasters());
  }, []);

  // Инициализация формы только при изменении initial
  useEffect(() => {
    const hasInitialData = initial && (
      initial.client || 
      initial.car || 
      initial.service || 
      initial.price || 
      initial.date || 
      initial.master || 
      initial.payment_status
    );
    
    if (hasInitialData) {
      // Режим редактирования
      let clientDisplayValue = initial.client || '';
      
      // Находим клиента если нужно
      if (initial.client && !initial.clientName) {
        const foundClient = clients.find(c => String(c.id) === String(initial.client));
        if (foundClient) {
          clientDisplayValue = foundClient.name;
        }
      } else if (initial.clientName) {
        clientDisplayValue = initial.clientName;
      }
      
      setClient(clientDisplayValue);
      setCar(initial.car || '');
      setService(initial.service || '');
      setPrice(initial.price || '');
      setDate(initial.date || '');
      setMaster(initial.master || '');
    }
  }, [initial, clients]);

  // Обновляем onFormDataChange при любом изменении
  useEffect(() => {
    // Убеждаемся, что цена всегда соответствует выбранной услуге
    const currentPrice = service ? getServicePrice(service) : price;
    const formData = {
      client,
      car,
      service,
      price: currentPrice,
      date,
      master,
      payment_status: 'Pending' // Автоматически устанавливаем начальный статус
    };
    onFormDataChange && onFormDataChange(formData);
  }, [client, car, service, price, date, master, services, onFormDataChange]);

  const getServicePrice = (id) => {
    const s = services.find(x => x.id === id);
    return s ? s.price : '';
  };

  const handleServiceChange = (value) => {
    setService(value);
    // Автоматически обновляем цену при смене услуги
    const selected = services.find(s => s.id === value);
    setPrice(selected ? selected.price : '');
  };



  // Фильтрация мастеров по услуге
  useEffect(() => {
    const filtered = service
      ? masters.filter(m => (m.services || []).map(s => String(s)).includes(String(service)))
      : masters;
    setFilteredMasters(filtered);
  }, [service, masters]);

  // Helper function для разрешения данных клиента
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
          // Обновляем список клиентов
          const updatedClients = getUsers().filter(u => u.role === 'client');
          setClients(updatedClients);
        }
      } else {
        finalClientData = { id: existingClient.id, name: existingClient.name };
      }
    }

    return finalClientData;
  };

  // Экспортируем helper функцию
  RecordForm.resolveClientData = resolveClientData;

  return (
    <div className="modal-form">
      <ClientSelector
        clients={clients}
        value={client}
        onChange={setClient}
        required
      />
      
      <CarSelector
        value={car}
        onChange={setCar}
        required
      />
      
      <ServiceSelector
        services={services}
        value={service}
        onChange={handleServiceChange}
        required
      />
      
      <label htmlFor="record-price">Цена
        <input 
          id="record-price"
          name="price"
          type="text" 
          value={service ? `${getServicePrice(service)} ₽` : ''} 
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
      
      <MasterSelector
        masters={filteredMasters}
        value={master}
        onChange={setMaster}
        required
      />
      
      <label htmlFor="record-date">Дата записи
        <input 
          id="record-date"
          name="date"
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>
    </div>
  );
}
