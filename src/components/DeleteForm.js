import React, { useState, useEffect } from 'react';

export default function DeleteForm({ initial = {}, onChange }) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (initial && initial.cancel_reason) setReason(initial.cancel_reason);
  }, [initial]);

  useEffect(() => onChange && onChange({ reason }), [reason]);

  return (
    <div className="modal-form">
      <textarea value={reason} onChange={e=>setReason(e.target.value)} />
    </div>
  );
}
