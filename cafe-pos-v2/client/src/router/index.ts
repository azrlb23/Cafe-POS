import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  // ==========================================
  // Public Routes
  // ==========================================
  {
    path: '/',
    name: 'Welcome',
    component: () => import('../views/Welcome.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Auth/Login.vue'),
    meta: { guestOnly: true }
  },

  // ==========================================
  // POS Routes (Requires Kasir Role)
  // ==========================================
  {
    path: '/pos',
    component: () => import('../layouts/PosLayout.vue'),
    meta: { requiresAuth: true, role: 'kasir' },
    children: [
      {
        path: '',
        name: 'Pos',
        component: () => import('../views/Pos/Pos.vue')
      },
      {
        path: 'active-orders',
        name: 'PosActiveOrders',
        component: () => import('../views/Pos/ActiveOrders.vue')
      },
      {
        path: 'history',
        name: 'PosHistory',
        component: () => import('../views/Pos/History.vue')
      }
    ]
  },
  
  // ==========================================
  // Dedicated Print Route (No Layout)
  // ==========================================
  {
    path: '/pos/print/:id',
    name: 'PrintReceipt',
    component: () => import('../views/Pos/ReceiptPrint.vue'),
    meta: { requiresAuth: true, role: 'kasir' }
  },

  // ==========================================
  // Admin Routes (Requires Admin Role)
  // ==========================================
  {
    path: '/admin',
    component: () => import('../layouts/AuthenticatedLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/Dashboard.vue')
      },
      // Admin CRUD pages will be added here
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('../views/Admin/Categories/Index.vue')
      },
      {
        path: 'categories/create',
        name: 'AdminCategoriesCreate',
        component: () => import('../views/Admin/Categories/Create.vue')
      },
      {
        path: 'categories/:id/edit',
        name: 'AdminCategoriesEdit',
        component: () => import('../views/Admin/Categories/Edit.vue'),
        props: true
      },
      {
        path: 'menus',
        name: 'AdminMenus',
        component: () => import('../views/Admin/Menus/Index.vue')
      },
      {
        path: 'menus/create',
        name: 'AdminMenusCreate',
        component: () => import('../views/Admin/Menus/Create.vue')
      },
      {
        path: 'menus/:id/edit',
        name: 'AdminMenusEdit',
        component: () => import('../views/Admin/Menus/Edit.vue'),
        props: true
      },
      {
        path: 'raw-materials',
        name: 'AdminRawMaterials',
        component: () => import('../views/Admin/RawMaterials/Index.vue')
      },
      {
        path: 'raw-materials/create',
        name: 'AdminRawMaterialsCreate',
        component: () => import('../views/Admin/RawMaterials/Create.vue')
      },
      {
        path: 'raw-materials/:id/edit',
        name: 'AdminRawMaterialsEdit',
        component: () => import('../views/Admin/RawMaterials/Edit.vue'),
        props: true
      },
      {
        path: 'tables',
        name: 'AdminTables',
        component: () => import('../views/Admin/Tables/Index.vue')
      },
      {
        path: 'suppliers',
        name: 'AdminSuppliers',
        component: () => import('../views/Admin/Suppliers/Index.vue')
      },
      {
        path: 'suppliers/create',
        name: 'AdminSuppliersCreate',
        component: () => import('../views/Admin/Suppliers/Create.vue')
      },
      {
        path: 'suppliers/:id/edit',
        name: 'AdminSuppliersEdit',
        component: () => import('../views/Admin/Suppliers/Edit.vue'),
        props: true
      },
      {
        path: 'purchase-orders',
        name: 'AdminPurchaseOrders',
        component: () => import('../views/Admin/PurchaseOrders/Index.vue')
      },
      {
        path: 'purchase-orders/create',
        name: 'AdminPurchaseOrdersCreate',
        component: () => import('../views/Admin/PurchaseOrders/Create.vue')
      },
      {
        path: 'purchase-orders/:id',
        name: 'AdminPurchaseOrdersShow',
        component: () => import('../views/Admin/PurchaseOrders/Show.vue'),
        props: true
      },
      {
        path: 'cashiers',
        name: 'AdminCashiers',
        component: () => import('../views/Admin/Cashiers/Index.vue')
      },
      {
        path: 'cashiers/create',
        name: 'AdminCashiersCreate',
        component: () => import('../views/Admin/Cashiers/Create.vue')
      },
      {
        path: 'cashiers/:id/edit',
        name: 'AdminCashiersEdit',
        component: () => import('../views/Admin/Cashiers/Edit.vue'),
        props: true
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: () => import('../views/Admin/Reports/Index.vue')
      }
    ]
  },
  
  // ==========================================
  // Fallback Route
  // ==========================================
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guards
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore();
  
  // Ensure user is fetched on initial load
  if (!authStore.initialized) {
    await authStore.fetchUser();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Requires auth but not logged in -> Redirect to login
    next({ name: 'Login' });
  } else if (to.meta.guestOnly && isAuthenticated) {
    // Guest only but logged in -> Redirect based on role
    if (userRole === 'admin') {
      next({ name: 'AdminDashboard' });
    } else if (userRole === 'kasir') {
      next({ name: 'Pos' });
    } else {
      next({ name: 'Welcome' });
    }
  } else if (to.meta.requiresAuth && to.meta.role && to.meta.role !== userRole) {
    // Logged in but wrong role
    if (userRole === 'admin') {
      next({ name: 'AdminDashboard' });
    } else if (userRole === 'kasir') {
      next({ name: 'Pos' });
    } else {
      next({ name: 'Welcome' });
    }
  } else {
    // All good
    next();
  }
});

export default router;
