import { defineStore } from 'pinia';
import api from '../utils/api';
import type { Shift, Menu, Category, CafeTable, Order, PettyCash } from '@shared/types';

interface PosState {
  menus: Menu[];
  categories: Category[];
  tables: CafeTable[];
  todayOrders: Order[];
  todayPettyCash: PettyCash[];
  activeShift: Shift | null;
  loading: boolean;
  hasLoaded: boolean;
  error: string | null;
  isMobileSidebarOpen: boolean;
}

export const usePosStore = defineStore('pos', {
  state: (): PosState => ({
    menus: [],
    categories: [],
    tables: [],
    todayOrders: [],
    todayPettyCash: [],
    activeShift: null,
    loading: false,
    hasLoaded: false,
    error: null,
    isMobileSidebarOpen: false,
  }),
  actions: {
    async fetchPosData(force = false) {
      if (this.hasLoaded && !force) return;

      this.loading = true;
      try {
        const response = await api.get('/pos/data');
        this.menus = response.data.menus || [];
        this.categories = response.data.categories || [];
        this.tables = response.data.tables || [];
        this.todayOrders = response.data.todayOrders || [];
        this.todayPettyCash = response.data.todayPettyCash || [];
        // BUG-010 fix: server returns camelCase 'activeShift', not 'active_shift'
        this.activeShift = response.data.activeShift ?? response.data.active_shift ?? null;
        this.hasLoaded = true;
        this.error = null;
      } catch (err: any) {
        console.error('Failed to fetch POS data', err);
        this.error = 'Failed to load POS data.';
      } finally {
        this.loading = false;
      }
    },
    async fetchActiveShift() {
      // Keep this for backward compatibility if any component imports it directly
      await this.fetchPosData(true);
    },
    setActiveShift(shift: Shift | null) {
      this.activeShift = shift;
    }
  }
});
