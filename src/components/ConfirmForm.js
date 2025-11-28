import React, { useState, useEffect } from 'react';

export default function ConfirmForm({ initial = {}, onChange }) {
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (initial) {
      setAmount(initial.payment_amount != null ? String(initial.payment_amount) : String(initial.price || ''));
      setComment(initial.payment_comment || '');
    }
  }, [initial]);

  useEffect(() => onChange && onChange({ amount, comment }), [amount, comment]);

  return (
    <div className="modal-form">
      <label>Сумма оплаты<input type="number" value={amount} onChange={e=>setAmount(e.target.value)} /></label>
      <label>Комментарий<textarea value={comment} onChange={e=>setComment(e.target.value)} /></label>
    </div>
  );
}
