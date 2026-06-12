import { defineStore } from 'pinia';
import api from '../utils/api';
import type { Menu, Category, CafeTable, User } from '@shared/types';

interface AdminState {
  menus: Menu[];
  categories: Category[];
  tables: CafeTable[];
  rawMaterials: any[];
  suppliers: any[];
  cashiers: any[];
  stats: any;
  activityLogs: any[];
  
  loading: boolean;
  isMenusLoaded: boolean;
  isCategoriesLoaded: boolean;
  isTablesLoaded: boolean;
  isRawMaterialsLoaded: boolean;
  isSuppliersLoaded: boolean;
  isCashiersLoaded: boolean;
  error: string | null;
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    menus: [],
    categories: [],
    tables: [],
    rawMaterials: [],
    suppliers: [],
    cashiers: [],
    stats: {},
    activityLogs: [],
    
    loading: false,
    isMenusLoaded: false,
    isCategoriesLoaded: false,
    isTablesLoaded: false,
    isRawMaterialsLoaded: false,
    isSuppliersLoaded: false,
    isCashiersLoaded: false,
    error: null
  }),
  actions: {
    async fetchMenus(force = false) {
      if (this.isMenusLoaded && !force) return;
      this.loading = true;
      try {
        const response = await api.get('/admin/menus');
        this.menus = response.data.menus || [];
        this.categories = response.data.categories || [];
        this.isMenusLoaded = true;
        this.isCategoriesLoaded = true;
        this.error = null;
      } catch (err: any) {
        console.error('Failed to fetch admin menus', err);
        this.error = 'Failed to load menus data.';
      } finally {
        this.loading = false;
      }
    },
    async fetchCategories(force = false) {
      if (this.isCategoriesLoaded && !force) return;
      this.loading = true;
      try {
        const response = await api.get('/admin/categories');
        this.categories = response.data.categories || [];
        this.isCategoriesLoaded = true;
        this.error = null;
      } catch (err: any) {
        console.error('Failed to fetch admin categories', err);
        this.error = 'Failed to load categories data.';
      } finally {
        this.loading = false;
      }
    },
    async fetchTables(force = false) {
      if (this.isTablesLoaded && !force) return;
      this.loading = true;
      try {
        const response = await api.get('/admin/tables');
        this.tables = response.data.tables || [];
        this.isTablesLoaded = true;
        this.error = null;
      } catch (err: any) {
        console.error('Failed to fetch admin tables', err);
        this.error = 'Failed to load tables data.';
      } finally {
        this.loading = false;
      }
    },
    async fetchRawMaterials(force = false) {
      if (this.isRawMaterialsLoaded && !force) return;
      this.loading = true;
      try {
        const response = await api.get('/admin/raw-materials');
        this.rawMaterials = response.data.rawMaterials || [];
        this.isRawMaterialsLoaded = true;
        this.error = null;
      } catch (err: any) {
        console.error('Failed to fetch admin raw materials', err);
        this.error = 'Failed to load raw materials data.';
      } finally {
        this.loading = false;
      }
    },
    async fetchSuppliers(force = false) {
      if (this.isSuppliersLoaded && !force) return;
      this.loading = true;
      try {
        const response = await api.get('/admin/suppliers');
        this.suppliers = response.data.suppliers || [];
        this.isSuppliersLoaded = true;
        this.error = null;
      } catch (err: any) {
        console.error('Failed to fetch admin suppliers', err);
        this.error = 'Failed to load suppliers data.';
      } finally {
        this.loading = false;
      }
    },
    async fetchCashiers(force = false) {
      if (this.isCashiersLoaded && !force) return;
      this.loading = true;
      try {
        const response = await api.get('/admin/cashiers');
        this.cashiers = response.data.cashiers || [];
        this.stats = response.data.stats || {};
        this.activityLogs = response.data.activityLogs || [];
        this.isCashiersLoaded = true;
        this.error = null;
      } catch (err: any) {
        console.error('Failed to fetch admin cashiers', err);
        this.error = 'Failed to load cashiers data.';
      } finally {
        this.loading = false;
      }
    },
    clearCache() {
      this.isMenusLoaded = false;
      this.isCategoriesLoaded = false;
      this.isTablesLoaded = false;
      this.isRawMaterialsLoaded = false;
      this.isSuppliersLoaded = false;
      this.isCashiersLoaded = false;
    }
  }
});
