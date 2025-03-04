import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          // In development mode, use mock data if API is not available
          if (import.meta.env.DEV && !import.meta.env.VITE_USE_API) {
            // Mock successful login
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockUser: User = {
              id: '1',
              name: 'John Doe',
              email: email,
              role: 'admin',
              companyId: '1',
              discountLimit: 10,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            const mockToken = 'mock-jwt-token';
            
            set({
              user: mockUser,
              token: mockToken,
              isAuthenticated: true,
            });
            
            return;
          }
          
          // Real API call
          const response = await authAPI.login(email, password);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);