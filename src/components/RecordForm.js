import { useState } from 'react';
import ResultCreateRecord from './ResultCreateRecord';

export default function CreateCard({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    client: '',
    car: '',
    service: '',
    price: '',
    date: '',
    payment_status: "Pending"
  });

  const [result, setResult] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // предотвращаем перезагрузку страницы
    // вызвать переданный обработчик добавления записи
    if (onAdd) onAdd(formData);
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
          <input
            type="text"
            name="client"
            value={formData.client}
            onChange={handleChange}
            required
          />
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
          <input
            type="text"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
          />
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
          <label>Дата:</label>
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
