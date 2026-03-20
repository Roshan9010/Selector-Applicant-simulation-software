import axios from 'axios';

const api = axios.create({
  // Point to the FastAPI backend
  baseURL: 'http://localhost:8000',
});

// Request interceptor to attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
