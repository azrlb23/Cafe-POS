import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send cookies with every request
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401, it means session expired or unauthorized.
      // Do not trigger global redirect for the initial /auth/me check.
      const isAuthMe = error.config && error.config.url && error.config.url.includes('/auth/me');
      if (!isAuthMe) {
        // Dispatch a custom event for global unauthorized handling
        window.dispatchEvent(new CustomEvent('unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
