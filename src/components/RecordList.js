import { useState } from 'react';
import Card from './Card';

export default function RecordList({ records, onEdit, onDelete, onConfirm, users = [], services = [] }) {
  const [status, setStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [masterFilter, setMasterFilter] = useState('all');

  const masters = users.filter(u => u.role === 'master');

  const sameDay = (recordDate, ymd) => {
    if (!ymd) return true;
    try {
      const d = new Date(recordDate);
      const target = new Date(ymd);
      return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth() && d.getDate() === target.getDate();
    } catch (_) {
      return (recordDate || '').includes(ymd);
    }
  };

  const filtered = records.filter(r => {
    const statusOk = status === 'all' ? true : r.payment_status === status;
    const dateOk = sameDay(r.date, dateFilter);
    const masterOk = masterFilter === 'all' ? true : (r.master || '').toString() === masterFilter;
    return statusOk && dateOk && masterOk;
  });

  const resolveClient = (r) => {
    let clientDisplay = r.clientName || r.client;
    if (!r.clientName && r.client && !isNaN(Number(r.client))) {
      const clientById = users.find(u => String(u.id) === String(r.client));
      if (clientById) {
        clientDisplay = clientById.name;
      }
    } else if (r.client && !isNaN(Number(r.client))) {
      const clientById = users.find(u => String(u.id) === String(r.client));
      if (clientById) {
        clientDisplay = clientById.name;
      }
    }
    return clientDisplay;
  };

  const resolveService = (r) => {
    let serviceDisplay = r.service;
    if (r.service && !isNaN(Number(r.service))) {
      const serviceById = services.find(s => String(s.id) === String(r.service));
      if (serviceById) {
        serviceDisplay = serviceById.name;
      }
    } else {
      const serviceByName = services.find(s => s.name === r.service);
      if (serviceByName) {
        serviceDisplay = serviceByName.name;
      }
    }
    return serviceDisplay;
  };

  return (
    <div>
      <h2 className="page-title">Управление записями</h2>

      <div className="panel filter-panel">
        <div className="panel-body">
          <div className="filter-grid">
            <div>
              <label>Статус</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="all">Все статусы</option>
                <option value="in-progress">В работе</option>
                <option value="completed">Выполнено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>
            <div>
              <label>Дата</label>
              <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            </div>
            <div>
              <label>Мастер</label>
              <select value={masterFilter} onChange={e => setMasterFilter(e.target.value)}>
                <option value="all">Все мастера</option>
                {masters.map(m => (
                  <option key={m.id} value={(m.name || m.id).toString()}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="apply-cell">
              <button className="btn primary">Применить</button>
            </div>
          </div>
        </div>
      </div>

      <div className="list-header">
        <h3>Активные записи ({filtered.length})</h3>
        <div className="filters">
          <button className={`btn ${status === 'all' ? 'active' : ''}`} onClick={() => setStatus('all')}>Все</button>
          <button className={`btn ${status === 'in-progress' ? 'active' : ''}`} onClick={() => setStatus('in-progress')}>В работе</button>
          <button className={`btn ${status === 'completed' ? 'active' : ''}`} onClick={() => setStatus('completed')}>Выполнено</button>
          <button className={`btn ${status === 'cancelled' ? 'active' : ''}`} onClick={() => setStatus('cancelled')}>Отменено</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{records.length === 0 ? 'Пока нет ни одной записи. Создайте первую! ➕' : 'По этому фильтру записей не найдено.'}</p>
        </div>
      ) : (
        filtered.map((r) => {
          const clientDisplay = resolveClient(r);
          const serviceDisplay = resolveService(r);

          return (
            <Card
              key={r.id}
              {...r}
              client={clientDisplay}
              service={serviceDisplay}
              onEdit={onEdit}
              onDelete={onDelete}
              onConfirm={onConfirm}
            />
          );
        })
      )}
    </div>
  );
}
