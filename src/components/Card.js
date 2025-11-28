export default function Card({ id, client, car, service, price, date, payment_status, payment_amount, payment_comment, cancel_reason, cancelledAt, onEdit, onDelete, onConfirm }) {
  const status = (payment_status || '').toLowerCase();

  let icon = '⏳';
  let cls = 'in-progress';

  if (status === 'cancelled' || status === 'canceled' || status === 'cancel' || status === 'отмена') {
    icon = '✕';
    cls = 'cancelled';
  } else if (status === 'completed' || status === 'done' || status === 'проведена') {
    icon = '✓';
    cls = 'completed';
  } else {
    // default: in progress / pending
    icon = '⏳';
    cls = 'in-progress';
  }

  return (
    <div className={`card ${cls}`}>
      <div className="status">
        <span className={`status-icon ${cls}`}>{icon}</span>
      </div>
      <div className="desc">
        <p className="client">{client}</p>
        <p><span className="label">Автомобиль:</span> {car}</p>
        <p><span className="label">Услуга:</span> {service}</p>
        <p><span className="label">Дата:</span> {date}</p>
        <p><span className="label">К оплате:</span> <strong>{price} ₽</strong></p>
        {payment_status === 'completed' && (
          <>
            <p><span className="label">Оплачено:</span> <strong>{payment_amount != null ? payment_amount : price} ₽</strong></p>
            {payment_comment && <p><span className="label">Комментарий:</span> {payment_comment}</p>}
          </>
        )}
        {payment_status === 'cancelled' && (
          <>
            {cancel_reason && <div className="cancel-reason">Причина: {cancel_reason}</div>}
            {cancelledAt && <p className="cancelled-at">Отменено: {new Date(cancelledAt).toLocaleString('ru-RU')}</p>}
          </>
        )}
      </div>
      <div className="card-actions">
        <button className="btn btn.small" onClick={() => onEdit && onEdit(id)}>✏️ Редактировать</button>
        <button 
          className="btn btn.small danger" 
          onClick={() => onDelete && onDelete(id)}
          disabled={cls === 'cancelled'}
        >🗑️ Удалить</button>
        <button 
          className="btn btn.small primary" 
          onClick={() => onConfirm && onConfirm(id)}
          disabled={cls !== 'in-progress'}
        >✓ Подтвердить</button>
      </div>
    </div>
  );
}