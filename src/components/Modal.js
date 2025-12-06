import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ title, children, onCancel, onConfirm, confirmLabel = 'OK', disabled = false, confirmDisabledHint }) {
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const confirmCalledRef = useRef(false);

  // Функция закрытия с анимацией
  const handleClose = useCallback(() => {
    setIsClosing(true);
    
    // Задержка для завершения анимации перед вызовом onCancel
    setTimeout(() => {
      if (onCancel) {
        onCancel();
      }
      setIsClosing(false);
    }, 100); // Время должно соответствовать длительности анимации
  }, [onCancel]);

  // Обработчик нажатия Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  useEffect(() => {
    // Управляем overflow body при монтировании
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Функция подтверждения с анимацией
  const handleConfirm = useCallback(() => {
    if (isClosing || disabled || confirmCalledRef.current) return;
    
    confirmCalledRef.current = true;
    setIsClosing(true);
    
    // Сначала вызываем onConfirm с formData, а потом закрываем
    setTimeout(() => {
      onConfirm && onConfirm(formData);
      // Закрываем модал только через onCancel, но избегаем рекурсии
      if (onCancel) {
        onCancel();
      }
      setIsClosing(false);
      confirmCalledRef.current = false;
    }, 100);
  }, [onConfirm, onCancel, isClosing, disabled, formData]);

  // Обработчик клика по фону модала
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  // Мемоизируем children с onFormDataChange
  const childrenWithProps = React.useMemo(() => {
    return React.cloneElement(children, { onFormDataChange: setFormData });
  }, [children]);

  return createPortal(
    <div ref={overlayRef} className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleOverlayClick}>
      <div ref={modalRef} className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          {childrenWithProps}
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={handleClose}>Отмена</button>
          {onConfirm && (
            <button
              className="btn primary"
              onClick={handleConfirm}
              disabled={disabled}
              title={disabled && confirmDisabledHint ? confirmDisabledHint : undefined}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
