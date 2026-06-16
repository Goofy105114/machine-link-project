import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const machinesAPI = {
  getAll: async () => {
    const response = await api.get('/machines');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/machines/${id}`);
    return response.data;
  },
  create: async (machineData) => {
    const response = await api.post('/machines', machineData);
    return response.data;
  },
  update: async (id, machineData) => {
    const response = await api.put(`/machines/${id}`, machineData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/machines/${id}`);
    return response.data;
  }
};

export const metricsAPI = {
  getAll: async (limit = 50) => {
    const response = await api.get('/metrics', { params: { limit } });
    return response.data;
  },
  getByMachineId: async (machineId, limit = 50) => {
    const response = await api.get(`/metrics/${machineId}`, { params: { limit } });
    return response.data;
  }
};

export const alertsAPI = {
  getAll: async (active = false, limit = 50) => {
    const response = await api.get('/alerts', { params: { active, limit } });
    return response.data;
  },
  resolve: async (id) => {
    const response = await api.put(`/alerts/${id}/resolve`);
    return response.data;
  }
};

export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};

export default api;
