import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ title, children, onCancel, onConfirm, confirmLabel = 'OK', disabled = false, confirmDisabledHint }) {
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

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

  useEffect(() => {
    const overlay = overlayRef.current;
    const modalEl = modalRef.current;
    if (overlay) {
      const cs = window.getComputedStyle(overlay);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) {
        overlay.style.display = 'flex';
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
        overlay.style.zIndex = '4000';
        overlay.style.pointerEvents = 'auto';
      }
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
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

  return createPortal(
    <div ref={overlayRef} className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleOverlayClick}>
      <div ref={modalRef} className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">{children}</div>
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
