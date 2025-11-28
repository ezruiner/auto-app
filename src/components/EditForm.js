import React, { useState, useEffect } from 'react';

export default function EditForm({ initial = {}, onChange }) {
  const [form, setForm] = useState({
    client: '', car: '', service: '', price: '', date: '', payment_status: ''
  });

  useEffect(() => {
    if (initial) setForm({ client: initial.client || '', car: initial.car || '', service: initial.service || '', price: initial.price || '', date: initial.date || '', payment_status: initial.payment_status || '' });
  }, [initial]);

  useEffect(() => onChange && onChange(form), [form]);

  const statusOptions = [
    { value: 'in-progress', label: 'В работе' },
    { value: 'completed', label: 'Проведена' },
    { value: 'cancelled', label: 'Отменена' }
  ];

  return (
    <div className="modal-form">
      <label>Клиент<input value={form.client} onChange={e=>setForm({...form, client: e.target.value})} /></label>
      <label>Автомобиль<input value={form.car} onChange={e=>setForm({...form, car: e.target.value})} /></label>
      <label>Услуга<input value={form.service} onChange={e=>setForm({...form, service: e.target.value})} /></label>
      <label>Цена<input type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} /></label>
      <label>Дата<input type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} /></label>
      <label>Статус
        <select value={form.payment_status} onChange={e=>setForm({...form, payment_status: e.target.value})}>
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>
    </div>
  );
}
