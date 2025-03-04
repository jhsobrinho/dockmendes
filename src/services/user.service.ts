import api from './api';
import { User, UserCreate, UserUpdate, UserFilters, UserPaginatedResponse } from '../types';

const USERS_URL = '/users';

export const userService = {
  // Buscar todos os usuários com paginação e filtros
  getUsers: async (filters: UserFilters): Promise<UserPaginatedResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.active !== undefined) params.append('active', filters.active.toString());

    const response = await api.get(`${USERS_URL}?${params.toString()}`);
    return response.data;
  },

  // Buscar um usuário específico
  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`${USERS_URL}/${id}`);
    return response.data;
  },

  // Criar um novo usuário
  createUser: async (user: UserCreate): Promise<User> => {
    console.log('Service: Enviando requisição para criar usuário:', user);
    try {
      const response = await api.post(USERS_URL, user);
      console.log('Service: Resposta da API:', response);
      if (!response || !response.data) {
        throw new Error('Resposta da API inválida');
      }
      return response.data;
    } catch (error) {
      console.error('Service: Erro detalhado na requisição:', error);
      throw error;
    }
  },

  // Atualizar um usuário
  updateUser: async (id: string, user: UserUpdate): Promise<User> => {
    const response = await api.put(`${USERS_URL}/${id}`, user);
    return response.data;
  },

  // Deletar um usuário
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`${USERS_URL}/${id}`);
  },

  // Resetar senha do usuário
  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await api.post(`${USERS_URL}/${id}/reset-password`, { newPassword });
  }
};