import { useState } from 'react';
import Card from './Card';

export default function RecordList({ records, onEdit, onDelete, onConfirm, users = [], services = [] }) {
  const [filter, setFilter] = useState('all');

  const filtered = records.filter(r => {
    if (filter === 'completed') return r.payment_status === 'completed';
    if (filter === 'cancelled') return r.payment_status === 'cancelled';
    if (filter === 'in-progress') return r.payment_status === 'in-progress';
    return true;
  });

  return (
    <div>
      <div className="list-header">
        <h2>Записи ({filtered.length})</h2>
        <div className="filters">
          <button className={`btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все записи</button>
          <button className={`btn ${filter === 'in-progress' ? 'active' : ''}`} onClick={() => setFilter('in-progress')}>В работе</button>
          <button className={`btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>✓ Проведённые</button>
          <button className={`btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>✕ Отменённые</button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>
            {records.length === 0 
              ? 'Пока нет ни одной записи. Создайте первую! ➕' 
              : 'По этому фильтру записей не найдено.'}
          </p>
        </div>
      ) : (
        filtered.map((r) => {
          // Smart client resolution: prioritize clientName, fallback to client (ID)
          let clientDisplay = r.clientName || r.client;
          
          // If we only have an ID, try to resolve it
          if (!r.clientName && r.client && !isNaN(Number(r.client))) {
            const clientById = users.find(u => String(u.id) === String(r.client));
            if (clientById) {
              clientDisplay = clientById.name;
            }
          } else if (r.client && !isNaN(Number(r.client))) {
            // If clientName exists but seems wrong, try ID lookup
            const clientById = users.find(u => String(u.id) === String(r.client));
            if (clientById) {
              clientDisplay = clientById.name;
            }
          }
          
          // Smart service resolution
          let serviceDisplay = r.service;
          
          // If service looks like an ID (number), try to resolve it
          if (r.service && !isNaN(Number(r.service))) {
            const serviceById = services.find(s => String(s.id) === String(r.service));
            if (serviceById) {
              serviceDisplay = serviceById.name;
            }
          } else {
            // If service looks like a name, try exact match
            const serviceByName = services.find(s => s.name === r.service);
            if (serviceByName) {
              serviceDisplay = serviceByName.name;
            }
          }

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