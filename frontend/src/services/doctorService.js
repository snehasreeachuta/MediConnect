import api from './api';

export const doctorService = {
  async getDoctors(params = {}) {
    const res = await api.get('/doctors', { params });
    return res.data;
  },

  async getDoctorById(id) {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },

  async getDoctorAvailability(id, date) {
    const res = await api.get(`/doctors/${id}/availability`, { params: { date } });
    return res.data;
  },

  async getSpecializations() {
    const res = await api.get('/doctors/specializations');
    return res.data.specializations || [];
  },

  async updateProfile(data) {
    const res = await api.put('/doctors/profile', data);
    return res.data;
  },

  async updateAvailability(availability) {
    const res = await api.put('/doctors/availability', { availability });
    return res.data;
  }
};

export default doctorService;
