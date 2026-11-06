import api from './api';

export const authService = {
  async registerPatient(data) {
    const res = await api.post('/auth/register/patient', data);
    if (res.data.token) {
      localStorage.setItem('mediconnect_token', res.data.token);
      localStorage.setItem('mediconnect_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async registerDoctor(data) {
    const res = await api.post('/auth/register/doctor', data);
    if (res.data.token) {
      localStorage.setItem('mediconnect_token', res.data.token);
      localStorage.setItem('mediconnect_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('mediconnect_token', res.data.token);
      localStorage.setItem('mediconnect_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async googleLogin(idToken, targetRole = 'patient') {
    const res = await api.post('/auth/google', { idToken, targetRole });
    if (res.data.token) {
      localStorage.setItem('mediconnect_token', res.data.token);
      localStorage.setItem('mediconnect_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    if (res.data.user) {
      localStorage.setItem('mediconnect_user', JSON.stringify(res.data.user));
    }
    return res.data.user;
  },

  logout() {
    localStorage.removeItem('mediconnect_token');
    localStorage.removeItem('mediconnect_user');
  },

  getCurrentUser() {
    const stored = localStorage.getItem('mediconnect_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('mediconnect_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('mediconnect_token');
  }
};

export default authService;
