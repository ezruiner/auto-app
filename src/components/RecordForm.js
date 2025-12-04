import { useState, useEffect } from 'react';
import ResultCreateRecord from './ResultCreateRecord';
import ClientSelector from './ClientSelector';
import CarSelector from './CarSelector';
import { getServices, getUsers, getMasters, findOrCreateClient, addCarToHistory } from '../store/dataStore';

export default function CreateCard({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    client: '',
    car: '',
    service: '', // service id
    price: '',
    date: '',
    master: '',
    payment_status: "Pending"
  });

  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [masters, setMasters] = useState([]);

  const [result, setResult] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    setServices(getServices());
    setClients(getUsers().filter(u => u.role === 'client'));
    setMasters(getMasters());
  }, []);

  // when service selected, fill price by default and filter masters
  useEffect(() => {
    if (!formData.service) return;
    const svc = services.find(s => String(s.id) === String(formData.service));
    if (svc && (!formData.price || Number(formData.price) === 0)) {
      setFormData(prev => ({ ...prev, price: svc.price }));
    }
    // обновим список мастеров и сбросим текущего мастера если он не предоставляет услугу
    setMasters(getMasters());
    setFormData(prev => {
      const curMaster = prev.master;
      if (!curMaster) return prev;
      try {
        const m = getMasters().find(x => String(x.id) === String(curMaster));
        if (!m) return { ...prev, master: '' };
        const has = (m.services || []).map(s => String(s)).includes(String(formData.service));
        if (!has) return { ...prev, master: '' };
      } catch (err) {
        return { ...prev, master: '' };
      }
      return prev;
    });
  }, [formData.service, services]);

  const handleSubmit = (e) => {
    e.preventDefault(); // предотвращаем перезагрузку страницы

    // Автоматическое создание или поиск клиента
    const clientName = formData.client.trim();
    let finalClientData = { id: clientName, name: clientName };
    
    if (clientName) {
      // Проверяем, есть ли уже такой клиент
      const existingClient = clients.find(c => 
        c.name.toLowerCase() === clientName.toLowerCase()
      );
      
      if (!existingClient) {
        // Создаем нового клиента
        const newClient = findOrCreateClient(clientName);
        if (newClient) {
          finalClientData = { id: newClient.id, name: newClient.name };
          // Обновляем список клиентов для будущих использований
          setClients(getUsers().filter(u => u.role === 'client'));
        }
      } else {
        finalClientData = { id: existingClient.id, name: existingClient.name };
      }
    }

    // Сохраняем данные записи с ID клиента (для совместимости с существующим кодом)
    const updatedFormData = {
      ...formData,
      client: finalClientData.id, // Сохраняем ID клиента
      clientName: finalClientData.name // И сохраняем имя для отображения
    };

    // Добавляем автомобиль в историю
    if (formData.car && formData.car.trim()) {
      addCarToHistory(formData.car.trim());
    }

    if (onAdd) onAdd(updatedFormData);

    setResult('Запись успешно создана!');
    // очистим форму и перейдём к списку
    setFormData({ client: '', car: '', service: '', price: '', date: '', payment_status: 'Pending', master: '' });
    // Если форма используется внутри модального окна — закроем модал
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="create-form">
        <ClientSelector
          clients={clients}
          value={formData.client}
          onChange={(clientName) => setFormData(prev => ({ ...prev, client: clientName }))}
          required
        />

        <CarSelector
          value={formData.car}
          onChange={(carName) => setFormData(prev => ({ ...prev, car: carName }))}
          required
        />

        <div>
          <label>Услуга:</label>
          <select name="service" value={formData.service} onChange={handleChange} required>
            <option value="">-- выберите услугу --</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.price} ₽</option>)}
          </select>
        </div>

        <div>
          <label>Цена:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Мастер:</label>
          <select name="master" value={formData.master} onChange={handleChange} required>
            <option value="">-- выберите мастера --</option>
            {masters
              .filter(m => formData.service && (m.services || []).map(s => String(s)).includes(String(formData.service)))
              .map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div>
          <label>Дата записи:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Создать запись</button>
      </form>

      {result && <ResultCreateRecord result={result} />}
    </>
  );
}
