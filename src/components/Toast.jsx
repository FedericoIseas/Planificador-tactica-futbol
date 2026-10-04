import React, { useEffect } from 'react';

export default function Toast({
  message = '',
  type = 'info', // 'info' | 'success' | 'warning' | 'error'
  duration = 3500,
  onClose,
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-notification ${type}`}>
      <span className="toast-icon">
        {type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span className="toast-message">{message}</span>
      {onClose && (
        <button className="toast-close" onClick={onClose} aria-label="Cerrar">✕</button>
      )}
    </div>
  );
}
