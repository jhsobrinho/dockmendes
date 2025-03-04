import { create } from 'zustand';
import { Order, OrderItem, Product } from '../types';
import { orderAPI } from '../services/order.service';

interface OrderState {
  orders: Order[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
  currentOrderItems: OrderItem[];
  filters: {
    page: number;
    limit: number;
    search?: string;
    status?: Order['status'];
    startDate?: string;
    endDate?: string;
  };
  setFilters: (filters: Partial<OrderState['filters']>) => void;
  fetchOrders: () => Promise<void>;
  getOrderById: (id: string) => Promise<void>;
  createOrder: (orderData: Partial<Order>) => Promise<void>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  // Gerenciamento de itens do pedido atual
  addOrderItem: (product: Product, quantity: number) => void;
  updateOrderItem: (itemId: string, quantity: number) => void;
  removeOrderItem: (itemId: string) => void;
  clearOrderItems: () => void;
  calculateTotals: () => { subtotal: number; discount: number; total: number };
  clearSelectedOrder: () => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  total: 0,
  loading: false,
  error: null,
  selectedOrder: null,
  currentOrderItems: [],
  filters: {
    page: 1,
    limit: 10,
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().fetchOrders();
  },

  fetchOrders: async () => {
    try {
      set({ loading: true, error: null });
      const response = await orderAPI.getOrders(get().filters);
      console.log('Pedidos recebidos:', response);
      set({ 
        orders: response.orders || [], 
        total: response.total || 0 
      });
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar pedidos',
        orders: [],
        total: 0
      });
    } finally {
      set({ loading: false });
    }
  },

  getOrderById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await orderAPI.getOrderById(id);
      set({ selectedOrder: response });
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar pedido',
        selectedOrder: null
      });
    } finally {
      set({ loading: false });
    }
  },

  createOrder: async (orderData) => {
    try {
      set({ loading: true, error: null });
      await orderAPI.createOrder({
        ...orderData,
        items: get().currentOrderItems
      });
      get().clearOrderItems();
      get().fetchOrders();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao criar pedido' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      set({ loading: true, error: null });
      await orderAPI.updateOrder(id, orderData);
      get().fetchOrders();
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar pedido' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteOrder: async (id) => {
    try {
      set({ loading: true, error: null });
      await orderAPI.deleteOrder(id);
      get().fetchOrders();
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao excluir pedido' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      set({ loading: true, error: null });
      await orderAPI.updateOrderStatus(id, status);
      get().fetchOrders();
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar status do pedido' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addOrderItem: (product, quantity) => {
    set((state) => {
      const existingItem = state.currentOrderItems.find(
        item => item.productId === product.id
      );

      if (existingItem) {
        return {
          currentOrderItems: state.currentOrderItems.map(item =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  total: (item.quantity + quantity) * item.price
                }
              : item
          )
        };
      }

      const newItem: OrderItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        product,
        quantity,
        price: Number(product.price),
        discount: 0,
        total: quantity * Number(product.price)
      };

      return {
        currentOrderItems: [...state.currentOrderItems, newItem]
      };
    });
  },

  updateOrderItem: (itemId, quantity) => {
    set((state) => ({
      currentOrderItems: state.currentOrderItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              total: quantity * item.price
            }
          : item
      )
    }));
  },

  removeOrderItem: (itemId) => {
    set((state) => ({
      currentOrderItems: state.currentOrderItems.filter(item => item.id !== itemId)
    }));
  },

  clearOrderItems: () => {
    set({ currentOrderItems: [] });
  },

  calculateTotals: () => {
    const items = get().currentOrderItems;
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discount = items.reduce((acc, item) => acc + item.discount, 0);
    const total = subtotal - discount;

    return { subtotal, discount, total };
  },

  clearSelectedOrder: () => {
    set({ selectedOrder: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));
