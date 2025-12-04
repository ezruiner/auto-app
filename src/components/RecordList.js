import { useState } from 'react';
import Card from './Card';

export default function RecordList({ records, onEdit, onDelete, onConfirm }) {
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
        filtered.map((r) => (
          <Card 
            key={r.id} 
            {...r} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onConfirm={onConfirm}
          />
        ))
      )}
    </div>
  );
}