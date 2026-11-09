export type OrderStatus = 'Pending' | 'Preparing' | 'Completed' | 'Cancelled';
export type TableStatus = 'Available' | 'Occupied' | 'Reserved';
export type Role = 'Admin' | 'Manager' | 'Chef' | 'Waiter' | 'Cashier';

export const CATEGORIES = ['Starters', 'Seafood', 'Main Course', 'Desserts', 'Beverages'];
export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'Completed', 'Cancelled'];
export const ROLES: Role[] = ['Admin', 'Manager', 'Chef', 'Waiter', 'Cashier'];

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string; // base64 data URL (empty = show emoji placeholder)
  available: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  orderNo: number;
  customerId: string | null;
  customerName: string;
  tableId: string | null;
  tableName: string;
  items: OrderItem[];
  subtotal: number;
  gstPercent: number;
  gst: number;
  total: number;
  status: OrderStatus;
  paid: boolean;
  createdAt: string;
}

export interface RestaurantTable {
  id: string;
  name: string;
  seats: number;
  status: TableStatus;
  reservedFor?: string;
  reservedTime?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: Role;
  phone: string;
  email: string;
  salary: number;
  joinDate: string;
}

export interface Settings {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstPercent: number;
}

export interface AppUser {
  username: string;
  password: string;
  name: string;
  role: Role;
}
