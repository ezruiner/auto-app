import { useState, useEffect } from 'react';
import ResultCreateRecord from './ResultCreateRecord';
import { getServices, getUsers, getMasters, findOrCreateClient } from '../store/dataStore';

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

    // Автоматическое создание клиента, если это новое имя
    const clientName = formData.client;
    if (clientName && clientName.trim() !== '') {
      const client = findOrCreateClient(clientName);
      if (client) {
        // Обновим форму с ID клиента
        const updatedFormData = {
          ...formData,
          client: client.id // Сохраняем ID клиента
        };
        if (onAdd) onAdd(updatedFormData);
      } else {
        if (onAdd) onAdd(formData);
      }
    } else {
      if (onAdd) onAdd(formData);
    }

    setResult('Запись успешно создана!');
    // очистим форму и перейдём к списку
    setFormData({ client: '', car: '', service: '', price: '', date: '', payment_status: 'Pending' });
    // Если форма используется внутри модального окна — закроем модал
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="create-form">
        <div>
          <label>Клиент:</label>
          <select name="client" value={formData.client} onChange={handleChange} required>
            <option value="">-- выберите клиента --</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label>Автомобиль:</label>
          <input
            type="text"
            name="car"
            value={formData.car}
            onChange={handleChange}
            required
          />
        </div>

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
