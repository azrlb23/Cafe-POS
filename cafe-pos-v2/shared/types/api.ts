import type { User, Shift, Menu, Category, CafeTable, Order, PettyCash } from './models';

// === Auth API ===
export interface LoginResponse {
  user: User;
  message: string;
}

// === POS API ===
export interface PosDataResponse {
  menus: Menu[];
  categories: Category[];
  tables: CafeTable[];
  active_shift: Shift | null;
  activeShift?: Shift | null;
  todayOrders: Order[];
  todayPettyCash: PettyCash[];
}

export interface OrderItemPayload {
  menu_id: number;
  quantity: number;
  unit_price: number | string;
  notes?: string;
  options: { id: number }[];
}

export interface CreateOrderRequest {
  shift_id: number;
  order_type: string;
  cafe_table_id: number | null;
  items: OrderItemPayload[];
  payment_method: string;
  payment_amount: number | string;
  notes?: string;
}

export interface CreateOrderResponse {
  order: Order;
  message: string;
}

// === Shift API ===
export interface StartShiftRequest {
  opening_cash: number | string;
}

export interface EndShiftRequest {
  closing_cash: number | string;
  notes?: string;
}
