import React, { useEffect, useState } from 'react';

export default function Modal({ title, children, onCancel, onConfirm, confirmLabel = 'OK', disabled = false }) {
  const [isClosing, setIsClosing] = useState(false);

  // Обработчик нажатия Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Функция закрытия с анимацией
  const handleClose = () => {
    if (isClosing) return;
    
    setIsClosing(true);
    
    // Задержка для завершения анимации перед вызовом onCancel
    setTimeout(() => {
      onCancel && onCancel();
      setIsClosing(false);
    }, 100); // Время должно соответствовать длительности анимации
  };

  // Функция подтверждения с анимацией
  const handleConfirm = () => {
    if (isClosing || disabled) return;
    
    setIsClosing(true);
    
    // Сначала вызываем onConfirm, а потом закрываем
    setTimeout(() => {
      onConfirm && onConfirm();
      // onCancel будет вызван для завершения анимации
      onCancel && onCancel();
      setIsClosing(false);
    }, 100);
  };

  // Обработчик клика по фону модала
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="btn" onClick={handleClose}>Отмена</button>
          {onConfirm && <button className="btn primary" onClick={handleConfirm} disabled={disabled}>{confirmLabel}</button>}
        </div>
      </div>
    </div>
  );
}
