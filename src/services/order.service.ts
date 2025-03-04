import api from './api';
import { Order } from '../types';

export const orderAPI = {
  getOrders: async (params: any = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/orders?${queryParams}`);
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: Partial<Order>) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateOrder: async (id: string, orderData: Partial<Order>) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  deleteOrder: async (id: string) => {
    return api.delete(`/orders/${id}`);
  },

  updateOrderStatus: async (id: string, status: Order['status']) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  }
};
