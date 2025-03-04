import { create } from 'zustand';
import { User, UserCreate, UserUpdate, UserFilters } from '../types';
import { userService } from '../services/user.service';

interface UserState {
  // Estado
  users: User[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  selectedUser: User | null;

  // Ações
  fetchUsers: (filters: UserFilters) => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  createUser: (user: UserCreate) => Promise<void>;
  updateUser: (id: string, user: UserUpdate) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetPassword: (id: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  setSelectedUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Estado inicial
  users: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  selectedUser: null,

  // Ações
  fetchUsers: async (filters: UserFilters) => {
    try {
      set({ loading: true, error: null });
      const response = await userService.getUsers(filters);
      set({
        users: response.users,
        totalCount: response.totalCount,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchUser: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const user = await userService.getUser(id);
      set({ selectedUser: user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createUser: async (user: UserCreate) => {
    try {
      set({ loading: true, error: null });
      await userService.createUser(user);
      await get().fetchUsers({ page: 1 }); // Recarrega a primeira página
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateUser: async (id: string, user: UserUpdate) => {
    try {
      set({ loading: true, error: null });
      const updatedUser = await userService.updateUser(id, user);
      set(state => ({
        users: state.users.map(u => u.id === id ? updatedUser : u),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await userService.deleteUser(id);
      set(state => ({
        users: state.users.filter(u => u.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  resetPassword: async (id: string, newPassword: string) => {
    try {
      set({ loading: true, error: null });
      await userService.resetPassword(id, newPassword);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  setSelectedUser: (user) => set({ selectedUser: user })
}));