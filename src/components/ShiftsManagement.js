import { useState, useEffect } from 'react';
import { getOperators, getShifts, openShift, closeShift, getCurrentShift, cleanupOrphanedShifts, updateShift, reopenShift, addMinutesToDate } from '../store/dataStore';
import Modal from './Modal';

export default function ShiftsManagement() {
  const [operators, setOperators] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [modal, setModal] = useState(null);
  const [closeNotes, setCloseNotes] = useState('');
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [editShiftData, setEditShiftData] = useState(null);
  const [editOpenedAt, setEditOpenedAt] = useState('');
  const [editClosedAt, setEditClosedAt] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    // Clean up any orphaned shifts on component load
    cleanupOrphanedShifts();
    setOperators(getOperators());
    setShifts(getShifts());
  }, []);

  const handleOpenShift = (operatorId) => {
    const operator = operators.find(o => o.id === operatorId);
    const currentShift = getCurrentShift(operatorId);

    if (currentShift) {
      alert(`У оператора ${operator.name} уже открыта смена!`);
      return;
    }

    if (window.confirm(`Открыть смену для ${operator.name}?`)) {
      openShift(operatorId);
      setShifts(getShifts());
      setOperators(getOperators());
    }
  };

  const handleCloseShift = (operatorId) => {
    const operator = operators.find(o => o.id === operatorId);
    const currentShift = getCurrentShift(operatorId);

    if (!currentShift) {
      alert(`У оператора ${operator.name} нет открытой смены!`);
      return;
    }

    setSelectedOperator(operatorId);
    setCloseNotes('');
    setModal({ type: 'closeShift', shiftId: currentShift.id });
  };

  const handleConfirmCloseShift = () => {
    if (modal.shiftId) {
      closeShift(modal.shiftId, closeNotes);
      setShifts(getShifts());
      setOperators(getOperators());
      setModal(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  const getShiftDuration = (openedAt, closedAt) => {
    if (!closedAt) return 'Открыта';
    const duration = Math.round((new Date(closedAt) - new Date(openedAt)) / 60000);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}ч ${minutes}м`;
  };

  const handleEditShift = (shift) => {
    setEditShiftData(shift);
    setEditOpenedAt(shift.openedAt);
    setEditClosedAt(shift.closedAt || '');
    setEditNotes(shift.notes || '');
    setModal({ type: 'editShift', shiftId: shift.id });
  };

  const handleSaveEdit = () => {
    if (!editShiftData) return;

    const updates = {
      openedAt: editOpenedAt,
      notes: editNotes
    };

    if (editClosedAt) {
      updates.closedAt = editClosedAt;
    }

    updateShift(editShiftData.id, updates);
    setShifts(getShifts());
    setModal(null);
  };

  const handleReopenShift = () => {
    if (!editShiftData) return;

    reopenShift(editShiftData.id);
    setShifts(getShifts());
    setOperators(getOperators());
    setModal(null);
  };

  const adjustTime = (fieldType, minutes) => {
    if (modal?.type !== 'editShift') return;

    const newDate = fieldType === 'openedAt'
      ? addMinutesToDate(editOpenedAt, minutes)
      : addMinutesToDate(editClosedAt, minutes);

    if (fieldType === 'openedAt') {
      setEditOpenedAt(newDate);
    } else {
      setEditClosedAt(newDate);
    }
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  // Helper function to convert local time to ISO string
  const localToISO = (localDateStr) => {
    if (!localDateStr) return '';
    const date = new Date(localDateStr);
    return date.toISOString();
  };

  // Helper function to convert ISO to local datetime-local format
  const isoToLocalInput = (isoDateStr) => {
    if (!isoDateStr) return '';
    const date = new Date(isoDateStr);
    // Convert to local time and format for datetime-local input
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <div>
      <h2>Управление сменами</h2>

      <div style={{ marginBottom: '24px' }}>
        <h3>Операторы</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {operators.map(operator => {
            const currentShift = shifts.find(s => s.operatorId === operator.id && !s.closedAt);
            const isActive = !!currentShift;

            return (
              <div key={operator.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>{operator.name}</h4>
                  <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-secondary)' }}>Оператор</p>
                  {isActive && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
                      ✓ Смена открыта с {formatDate(currentShift.openedAt)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  {!isActive ? (
                    <button className="btn primary" onClick={() => handleOpenShift(operator.id)} style={{ flex: 1 }}>
                      🟢 Открыть смену
                    </button>
                  ) : (
                    <button className="btn danger" onClick={() => handleCloseShift(operator.id)} style={{ flex: 1 }}>
                      🔴 Закрыть смену
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3>История смен</h3>

        {/* Desktop table view */}
        <div className="shifts-history-table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Оператор</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Открыта</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Закрыта</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Длительность</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Статус</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Примечания</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {shifts.slice().reverse().map(shift => {
                const operator = operators.find(o => o.id === shift.operatorId);
                const isOpen = !shift.closedAt;

                return (
                  <tr key={shift.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px' }}>{operator?.name || 'Неизвестный'}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>{formatDate(shift.openedAt)}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {shift.closedAt ? formatDate(shift.closedAt) : '—'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {getShiftDuration(shift.openedAt, shift.closedAt)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: isOpen ? '#d1fae5' : '#f3f4f6',
                        color: isOpen ? '#065f46' : '#374151'
                      }}>
                        {isOpen ? 'Открыта' : 'Закрыта'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {shift.notes ? (
                        <div style={{
                          backgroundColor: 'var(--shift-notes-bg)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          borderLeft: '3px solid var(--shift-notes-border)',
                          maxWidth: '200px',
                          color: 'var(--shift-notes-text)'
                        }}>
                          {shift.notes}
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      {isOpen ? (
                        <button
                          className="btn danger small"
                          onClick={() => handleCloseShift(operator?.id)}
                          style={{ padding: '4px 8px', fontSize: '12px', marginRight: '4px' }}
                        >
                          🔴 Закрыть
                        </button>
                      ) : (
                        <button
                          className="btn primary small"
                          onClick={() => handleEditShift(shift)}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Изменить
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="shifts-history-cards">
          {shifts.slice().reverse().map(shift => {
            const operator = operators.find(o => o.id === shift.operatorId);
            const isOpen = !shift.closedAt;

            return (
              <div key={shift.id} className="shift-history-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4>Смена: {operator?.name || 'Неизвестный'}</h4>
                  {isOpen ? (
                    <button
                      className="btn danger small"
                      onClick={() => handleCloseShift(operator?.id)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      🔴 Закрыть
                    </button>
                  ) : (
                    <button
                      className="btn primary small"
                      onClick={() => handleEditShift(shift)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Изменить
                    </button>
                  )}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Открыта:</span>
                  <span className="detail-value">{formatDate(shift.openedAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Закрыта:</span>
                  <span className="detail-value">{shift.closedAt ? formatDate(shift.closedAt) : '—'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Длительность:</span>
                  <span className="detail-value">{getShiftDuration(shift.openedAt, shift.closedAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Статус:</span>
                  <span className={`status-badge ${isOpen ? 'status-open' : 'status-closed'}`}>
                    {isOpen ? 'Открыта' : 'Закрыта'}
                  </span>
                </div>
                {shift.notes && (
                  <div className="notes">
                    {shift.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {modal && modal.type === 'closeShift' && (
        <Modal
          title="Закрыть смену"
          onCancel={() => setModal(null)}
          onConfirm={handleConfirmCloseShift}
          confirmLabel="Закрыть"
        >
          <div className="modal-form">
            <label>Примечания (опционально)
              <textarea
                value={closeNotes}
                onChange={e => setCloseNotes(e.target.value)}
                placeholder="Например: Всё прошло гладко, никаких проблем"
                style={{ minHeight: '80px' }}
              />
            </label>
          </div>
        </Modal>
      )}

      {modal && modal.type === 'editShift' && (
        <Modal
          title="Редактировать смену"
          onCancel={() => setModal(null)}
          onConfirm={handleSaveEdit}
          confirmLabel="Сохранить"
        >
          <div className="modal-form">
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Время открытия:
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="datetime-local"
                    value={editOpenedAt ? isoToLocalInput(editOpenedAt) : ''}
                    onChange={e => setEditOpenedAt(localToISO(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      className="btn small"
                      onClick={() => adjustTime('openedAt', 15)}
                      style={{ padding: '4px 8px' }}
                    >
                      +15м
                    </button>
                    <button
                      className="btn small"
                      onClick={() => adjustTime('openedAt', -15)}
                      style={{ padding: '4px 8px' }}
                    >
                      -15м
                    </button>
                  </div>
                </div>
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Время закрытия:
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="datetime-local"
                    value={editClosedAt ? isoToLocalInput(editClosedAt) : ''}
                    onChange={e => setEditClosedAt(localToISO(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      className="btn small"
                      onClick={() => adjustTime('closedAt', 15)}
                      style={{ padding: '4px 8px' }}
                    >
                      +15м
                    </button>
                    <button
                      className="btn small"
                      onClick={() => adjustTime('closedAt', -15)}
                      style={{ padding: '4px 8px' }}
                    >
                      -15м
                    </button>
                  </div>
                </div>
              </label>
            </div>

            <label>
              Примечания:
              <textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Комментарии к смене"
                style={{ minHeight: '80px' }}
              />
            </label>

            {editShiftData?.closedAt && (
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn primary"
                  onClick={handleReopenShift}
                  style={{ marginRight: '8px' }}
                >
                  Повторно открыть смену
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
