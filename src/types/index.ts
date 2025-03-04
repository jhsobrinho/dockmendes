// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'client';
  companyId?: string;
  discountLimit: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: Company;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'operator' | 'client';
  companyId?: string;
  discountLimit?: number;
  active?: boolean;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  role?: 'admin' | 'operator' | 'client';
  companyId?: string;
  discountLimit?: number;
  active?: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'operator' | 'client';
  companyId?: string;
  active?: boolean;
}

export interface UserPaginatedResponse {
  users: User[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  document: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyCreate {
  name: string;
  document: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface CompanyUpdate {
  name?: string;
  document?: string;
  address?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}

export interface CompanyFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export interface CompanyPaginatedResponse {
  companies: Company[];
  total: number;
  pages: number;
  currentPage: number;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  loadingTime: number;
  active: boolean;
  companyId?: string;
  company?: Company;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCreate {
  name: string;
  description?: string;
  price: number;
  stock: number;
  loadingTime?: number;
  companyId?: string;
  active?: boolean;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  loadingTime?: number;
  active?: boolean;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  active?: boolean;
}

export interface ProductPaginatedResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Client types
export interface Client {
  id: string;
  name: string;
  document: string;
  address: string;
  phone: string;
  email: string;
  isLoyal: boolean; // Flag for loyal clients
  quotas: number; // Available quotas in minutes (multiples of 10)
  autoReserve: boolean; // Flag for automatic reservation
  preferredDays: string[]; // Days of the week for automatic reservation
  preferredTime: string; // Preferred time for reservation
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  clientId: string;
  client: Client;
  userId: string;
  user: User;
  items: OrderItem[];
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  totalAmount: number;
  totalDiscount: number;
  scheduledDate?: Date;
  dockId?: string;
  estimatedTime: number; // Time in minutes
  createdAt: Date;
  updatedAt: Date;
}

// Dock types
export interface Dock {
  id: string;
  name: string;
  companyId: string;
  workingHours: {
    start: string; // Format: "HH:MM"
    end: string; // Format: "HH:MM"
  };
  isBlocked: boolean;
  blockReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dock Scheduling
export interface DockSchedule {
  id: string;
  dockId: string;
  dock: Dock;
  orderId: string;
  order: Order;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Holiday types
export interface Holiday {
  id: string;
  date: Date;
  description: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Reservation types
export interface Reservation {
  id: string;
  clientId: string;
  client: Client;
  dockId: string;
  dock: Dock;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // In minutes (multiples of 10)
  isAutomatic: boolean;
  status: 'scheduled' | 'used' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}