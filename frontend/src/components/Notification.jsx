import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Notification({ type = 'info', message, onClose = null }) {
  if (!message) return null;

  let alertClass = 'alert-info';
  let Icon = Info;

  if (type === 'success') {
    alertClass = 'alert-success';
    Icon = CheckCircle2;
  } else if (type === 'error') {
    alertClass = 'alert-error';
    Icon = AlertCircle;
  }

  return (
    <div className={`alert ${alertClass}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon size={18} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.7 }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
