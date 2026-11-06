import api from './api';

export const appointmentService = {
  async createAppointment(data) {
    const res = await api.post('/appointments', data);
    return res.data;
  },

  async getMyAppointments() {
    const res = await api.get('/appointments/my');
    return res.data.appointments || [];
  },

  async getAppointmentById(id) {
    const res = await api.get(`/appointments/${id}`);
    return res.data.appointment;
  },

  async cancelAppointment(id, cancellationReason) {
    const res = await api.patch(`/appointments/${id}/cancel`, { cancellationReason });
    return res.data;
  },

  async updateStatus(id, status, doctorNotes = null) {
    const res = await api.patch(`/appointments/${id}/status`, { status, doctorNotes });
    return res.data;
  },

  async saveDoctorNotes(id, doctorNotes) {
    const res = await api.patch(`/appointments/${id}/notes`, { doctorNotes });
    return res.data;
  }
};

export default appointmentService;
