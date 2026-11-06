import api from './api';

export const reviewService = {
  async submitReview(data) {
    const res = await api.post('/reviews', data);
    return res.data;
  },

  async getDoctorReviews(doctorId) {
    const res = await api.get(`/reviews/doctor/${doctorId}`);
    return res.data.reviews || [];
  },

  async updateReview(id, data) {
    const res = await api.put(`/reviews/${id}`, data);
    return res.data;
  },

  async deleteReview(id) {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  }
};

export default reviewService;
