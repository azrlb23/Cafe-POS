import { defineStore } from 'pinia';
import api from '../utils/api';
import type { User } from '@shared/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    initialized: false, // Indicates if the initial fetchUser has been done
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    userRole: (state) => state.user?.role,
    isAdmin: (state) => state.user?.role === 'admin',
    isKasir: (state) => state.user?.role === 'kasir',
  },
  actions: {
    async fetchUser() {
      this.loading = true;
      try {
        const response = await api.get('/auth/me');
        this.user = response.data.user;
        this.error = null;
      } catch (err: any) {
        this.user = null;
        if (err.response && err.response.status !== 401) {
          this.error = 'Failed to fetch user profile';
        }
      } finally {
        this.loading = false;
        this.initialized = true;
      }
    },
    
    async login(email: string, password: string): Promise<boolean> {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', { email, password });
        this.user = response.data.user;
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async logout() {
      this.loading = true;
      try {
        await api.post('/auth/logout');
      } catch (err) {
        console.error('Logout failed on server', err);
      } finally {
        this.user = null;
        this.loading = false;
        // Optionally redirect to login page here or in the component
      }
    },
    
    clearError() {
      this.error = null;
    }
  }
});
