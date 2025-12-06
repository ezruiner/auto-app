import { useState, useEffect, useRef } from 'react';
import Card from './Card';

export default function RecordList({ records, onEdit, onDelete, onConfirm, users = [], services = [] }) {
  const [status, setStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [masterFilter, setMasterFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);

  const masters = users.filter(u => u.role === 'master');

  // Закрытие фильтра при клике вне окна
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilters]);

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

  const resolveMaster = (r) => {
    let masterDisplay = r.master || '';
    if (r.master && !isNaN(Number(r.master))) {
      const masterById = masters.find(m => String(m.id) === String(r.master));
      if (masterById) {
        masterDisplay = masterById.name;
      }
    } else if (r.master) {
      // Если master - строка, используем как есть
      masterDisplay = r.master;
    }
    return masterDisplay;
  };

  return (
    <div>
      <h2 className="page-title">Записи</h2>

      <div className="filter-compact" ref={filterRef}>
        <button 
          className="btn filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          title="Показать/скрыть фильтры"
        >
          🔍 Фильтры
        </button>
        
        {showFilters && (
          <div className="filter-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="filter-item">
              <label>Статус</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="all">Все статусы</option>
                <option value="in-progress">В работе</option>
                <option value="completed">Выполнено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Дата</label>
              <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            </div>
            <div className="filter-item">
              <label>Мастер</label>
              <select value={masterFilter} onChange={e => setMasterFilter(e.target.value)}>
                <option value="all">Все мастера</option>
                {masters.map(m => (
                  <option key={m.id} value={(m.name || m.id).toString()}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="list-header">
        <h3>Активные записи ({filtered.length})</h3>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{records.length === 0 ? 'Пока нет ни одной записи. Создайте первую! ➕' : 'По этому фильтру записей не найдено.'}</p>
        </div>
      ) : (
        filtered.map((r) => {
          const clientDisplay = resolveClient(r);
          const serviceDisplay = resolveService(r);
          const masterDisplay = resolveMaster(r);

          return (
            <Card
              key={r.id}
              {...r}
              client={clientDisplay}
              service={serviceDisplay}
              master={masterDisplay}
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
