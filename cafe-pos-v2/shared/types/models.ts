export interface User {
  id: number;
  name: string;
  email: string | null;
  role: 'admin' | 'kasir';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  menus?: Menu[];
}

export interface Menu {
  id: number;
  categoryId: number;
  category?: Category;
  name: string;
  description: string | null;
  imagePath: string | null;
  basePrice: number | string;
  base_price?: number | string; // Compatibility
  isActive: boolean;
  menuOptionGroups?: MenuOptionGroup[];
  menu_option_groups?: MenuOptionGroup[]; // Compatibility
}

export interface MenuOptionGroup {
  id: number;
  menuId: number;
  name: string;
  minSelect: number;
  maxSelect: number;
  options?: MenuOptionItem[];
  menuOptionItems?: MenuOptionItem[];
}

export interface MenuOptionItem {
  id: number;
  menuOptionGroupId: number;
  name: string;
  priceModifier: number | string;
  price_modifier?: number | string;
  isAvailable: boolean;
}

export interface CafeTable {
  id: number;
  number: number;
  name?: string;
  status: 'available' | 'occupied';
}

export interface Shift {
  id: number;
  userId: number;
  user?: User;
  openedAt: string;
  openingCash: number | string;
  opening_cash?: number | string;
  closedAt: string | null;
  closingCash: number | string | null;
  totalSales: number | string;
  totalCashSales: number | string;
  totalPettyCash: number | string;
  expectedClosingCash: number | string;
  notes: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  shiftId: number;
  userId: number;
  user?: User;
  cafeTableId: number | null;
  cafeTable?: CafeTable | null;
  orderType: 'dine_in' | 'takeaway';
  subtotal: number | string;
  total: number | string;
  paymentMethod: string;
  paymentAmount: number | string;
  change: number | string;
  status: 'pending' | 'completed' | 'cancelled' | 'void';
  voidReason: string | null;
  notes: string | null;
  createdAt: string;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuId: number;
  menu?: Menu;
  menuName: string;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  notes: string | null;
  orderItemOptions?: OrderItemOption[];
}

export interface OrderItemOption {
  id: number;
  orderItemId: number;
  menuOptionItemId: number;
  optionGroupName: string;
  optionName: string;
  priceModifier: number | string;
}

export interface PettyCash {
  id: number;
  shiftId: number;
  userId: number;
  amount: number | string;
  description: string;
  createdAt: string;
}
