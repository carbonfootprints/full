import axios from 'axios';

// ─── Real API instance ────────────────────────────────────────────────────────
// Points to the backend defined in VITE_API_URL (.env).
// Reads the Bearer token from localStorage on every request so it stays fresh
// after login/refresh — no stale tokens baked in at module load time.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const axiosServices = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// ─── Request interceptor: attach current auth token ──────────────────────────
axiosServices.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 globally ───────────────────────────────
axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth state; redirect to the appropriate login page
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      const isOrguser = window.location.pathname.startsWith('/orguser');
      window.location.href = isOrguser ? '/orguser/login' : '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default axiosServices;

// ─── SWR / React-Query compatible fetchers ────────────────────────────────────
export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosServices.get(url, config);
  return res.data;
};

export const fetcherPost = async (args) => {
  const [url, data, config] = Array.isArray(args) ? args : [args];
  const res = await axiosServices.post(url, data, config);
  return res.data;
};
