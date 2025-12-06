import React, { useState, useEffect } from 'react';

export default function DeleteForm({ initial = {}, onChange, onFormDataChange }) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (initial && initial.cancel_reason) setReason(initial.cancel_reason);
  }, [initial]);

  useEffect(() => {
    const formData = { reason };
    onFormDataChange && onFormDataChange(formData);
  }, [reason, onFormDataChange]);

  return (
    <div className="modal-form">
      <textarea 
        id="delete-reason"
        name="reason"
        value={reason} 
        onChange={e=>setReason(e.target.value)} 
      />
    </div>
  );
}
