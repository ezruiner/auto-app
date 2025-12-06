// Функция для форматирования числа с разделением точками каждую тысячу
const formatPrice = (amount) => {
  if (amount == null || amount === '') return '';
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : Number(amount);
  if (isNaN(num)) return amount;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function Card({ id, client, car, service, price, date, payment_status, payment_amount, payment_comment, cancel_reason, cancelledAt, onEdit, onDelete, onConfirm }) {
  const status = (payment_status || '').toLowerCase();

  let icon = '⏳';
  let cls = 'in-progress';
  let statusLabel = 'В РАБОТЕ';

  if (status === 'cancelled' || status === 'canceled' || status === 'cancel' || status === 'отмена') {
    icon = '✕';
    cls = 'cancelled';
    statusLabel = 'ОТМЕНЕНО';
  } else if (status === 'completed' || status === 'done' || status === 'проведена') {
    icon = '✓';
    cls = 'completed';
    statusLabel = 'ВЫПОЛНЕНО';
  } else {
    // default: in progress / pending
    icon = '⏳';
    cls = 'in-progress';
    statusLabel = 'В РАБОТЕ';
  }

  return (
    <div className={`card ${cls}`}>
      <div className="status">
        <span className={`status-icon ${cls}`}>{icon}</span>
        <span className={`status-badge ${cls}`}>{statusLabel}</span>
      </div>
      <div className="desc">
        <p className="client">{client}</p>
        <p><span className="label">Автомобиль:</span> {car}</p>
        <p><span className="label">Услуга:</span> {service}</p>
        <p><span className="label">Дата записи:</span> {date}</p>
        <p><span className="label">К оплате:</span> <strong>{formatPrice(price)} ₽</strong></p>
        {payment_status === 'completed' && (
          <>
            <p><span className="label">Оплачено:</span> <strong>{formatPrice(payment_amount != null ? payment_amount : price)} ₽</strong></p>
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
        <button className="btn small" onClick={() => onEdit && onEdit(id)}>✏️ Редактировать</button>
        <button
          className="btn small danger"
          onClick={() => onDelete && onDelete(id)}
          disabled={cls === 'cancelled'}
        >🗑️ Удалить</button>
        <button
          className="btn small primary"
          onClick={() => onConfirm && onConfirm(id)}
          disabled={cls !== 'in-progress'}
        >✓ Подтвердить</button>
      </div>
    </div>
  );
}
