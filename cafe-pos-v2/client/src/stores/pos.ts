import { defineStore } from 'pinia';
import api from '../utils/api';
import type { Shift } from '@shared/types';

interface PosState {
  activeShift: Shift | null;
  loading: boolean;
  error: string | null;
}

export const usePosStore = defineStore('pos', {
  state: (): PosState => ({
    activeShift: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchActiveShift() {
      this.loading = true;
      try {
        const response = await api.get('/pos/data');
        // BUG-010 fix: server returns camelCase 'activeShift', not 'active_shift'
        this.activeShift = response.data.activeShift ?? response.data.active_shift ?? null;
      } catch (err: any) {
        console.error('Failed to fetch POS data', err);
        this.activeShift = null;
      } finally {
        this.loading = false;
      }
    },
    setActiveShift(shift: Shift | null) {
        this.activeShift = shift;
    }
  }
});
