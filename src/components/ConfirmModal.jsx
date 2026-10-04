import React from 'react';

export default function ConfirmModal({
  isOpen = false,
  title = 'Confirmar Acción',
  message = '¿Estás seguro de realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger', // 'danger' | 'warning' | 'info'
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="print-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className={`confirm-modal-icon ${type}`}>
          {type === 'danger' ? '🗑️' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <div className="confirm-modal-content">
          <div className="confirm-modal-title">{title}</div>
          <div className="confirm-modal-message">{message}</div>
        </div>
        <div className="confirm-modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`btn ${type === 'danger' ? 'btn-danger-solid' : 'btn-print'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
