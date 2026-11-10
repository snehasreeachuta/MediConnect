import api from './api';

export const medicalRecordService = {
  async uploadRecord(formData, onProgress = null) {
    const res = await api.post('/medical-records/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return res.data;
  },

  async getMyRecords(appointmentId = null) {
    const params = appointmentId ? { appointmentId } : {};
    const res = await api.get('/medical-records/my', { params });
    return res.data.records || [];
  },

  async downloadRecord(id, filename = 'medical_document') {
    const res = await api.get(`/medical-records/${id}/download`, {
      responseType: 'blob'
    });
    const contentType = res.headers['content-type'] || 'application/pdf';
    const blob = new Blob([res.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async deleteRecord(id) {
    const res = await api.delete(`/medical-records/${id}`);
    return res.data;
  },

  async summarizeRecord(id) {
    const res = await api.post(`/medical-records/${id}/summarize`);
    return res.data;
  },

  async getAppointmentSummary(appointmentId) {
    const res = await api.get(`/appointments/${appointmentId}/summary`);
    return res.data;
  },

  async shareConsent(appointmentId) {
    const res = await api.post(`/appointments/${appointmentId}/summary/share`);
    return res.data;
  },

  async revokeConsent(appointmentId) {
    const res = await api.post(`/appointments/${appointmentId}/summary/revoke`);
    return res.data;
  }
};

export default medicalRecordService;
