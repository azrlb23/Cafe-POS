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
      // We should redirect to login if not already there, but we'll let the 
      // auth store / router guard handle the redirect for a cleaner flow.
      // We can emit a global event or just let the caller catch it.
      
      // Dispatch a custom event for global unauthorized handling
      window.dispatchEvent(new CustomEvent('unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
