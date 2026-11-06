import React from 'react';
import { FileText, Download, Trash2, Sparkles, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import medicalRecordService from '../services/medicalRecordService';

export default function MedicalRecordCard({ record, onDelete = null, onSummarize = null }) {
  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
  };

  const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'summary_ready':
        return (
          <span className="badge badge-success">
            <CheckCircle2 size={12} /> Summary Ready
          </span>
        );
      case 'processing':
        return (
          <span className="badge badge-warning">
            <Clock size={12} /> Processing AI...
          </span>
        );
      case 'failed':
        return (
          <span className="badge badge-danger">
            <AlertCircle size={12} /> Extraction Failed
          </span>
        );
      default:
        return (
          <span className="badge badge-info">
            <Clock size={12} /> Uploaded
          </span>
        );
    }
  };

  const handleDownload = () => {
    medicalRecordService.downloadRecord(record.id, record.original_filename);
  };

  return (
    <div className="record-card">
      <div className="record-info">
        <div className="record-file-icon">
          <FileText size={24} />
        </div>
        <div className="record-meta">
          <h4>{record.original_filename}</h4>
          <p>
            {formatSize(record.file_size)} • Uploaded on {formatDate(record.uploaded_at)}
          </p>
          <div style={{ marginTop: '6px' }}>{getStatusDisplay(record.processing_status)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {record.processing_status !== 'summary_ready' && onSummarize && (
          <button
            onClick={() => onSummarize(record.id)}
            className="btn btn-outline btn-sm"
            title="Generate AI Summary"
          >
            <Sparkles size={14} /> Summarize
          </button>
        )}

        <button onClick={handleDownload} className="btn btn-secondary btn-sm" title="Download Document">
          <Download size={15} />
        </button>

        {onDelete && (
          <button onClick={() => onDelete(record.id)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }} title="Delete Record">
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
