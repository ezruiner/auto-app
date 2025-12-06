import React, { useState, useEffect } from 'react';

export default function ConfirmForm({ initial = {}, onChange, onFormDataChange }) {
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (initial) {
      setAmount(initial.payment_amount != null ? String(initial.payment_amount) : String(initial.price || ''));
      setComment(initial.payment_comment || '');
    }
  }, [initial]);

  useEffect(() => {
    const formData = { amount, comment };
    onFormDataChange && onFormDataChange(formData);
  }, [amount, comment, onFormDataChange]);

  return (
    <div className="modal-form">
      <label htmlFor="confirm-amount">Сумма оплаты<input id="confirm-amount" name="amount" type="number" value={amount} onChange={e=>setAmount(e.target.value)} /></label>
      <label htmlFor="confirm-comment">Комментарий<textarea id="confirm-comment" name="comment" value={comment} onChange={e=>setComment(e.target.value)} /></label>
    </div>
  );
}
