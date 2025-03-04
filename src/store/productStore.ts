import { create } from 'zustand';
import { Product, ProductCreate, ProductUpdate, ProductFilters } from '../types';
import { productService } from '../services/product.service';

interface ProductState {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  selectedProduct: Product | null;
  
  // Ações
  setFilters: (filters: Partial<ProductFilters>) => void;
  fetchProducts: () => Promise<void>;
  createProduct: (product: ProductCreate) => Promise<void>;
  updateProduct: (id: string, product: ProductUpdate) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Estado inicial
  products: [],
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    active: true
  },
  selectedProduct: null,

  // Ações
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const response = await productService.getProducts(filters);
      
      set({
        products: response.products,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      set({
        error: error instanceof Error ? error.message : 'Erro ao buscar produtos',
        loading: false
      });
    }
  },

  createProduct: async (product) => {
    set({ loading: true, error: null });
    try {
      await productService.createProduct(product);
      await get().fetchProducts(); // Recarrega a lista após criar
      set({ loading: false });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      set({
        error: error instanceof Error ? error.message : 'Erro ao criar produto',
        loading: false
      });
      throw error; // Re-throw para tratamento no componente
    }
  },

  updateProduct: async (id, product) => {
    set({ loading: true, error: null });
    try {
      await productService.updateProduct(id, product);
      await get().fetchProducts(); // Recarrega a lista após atualizar
      set({ loading: false });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      set({
        error: error instanceof Error ? error.message : 'Erro ao atualizar produto',
        loading: false
      });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await productService.deleteProduct(id);
      await get().fetchProducts(); // Recarrega a lista após deletar
      set({ loading: false });
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      set({
        error: error instanceof Error ? error.message : 'Erro ao deletar produto',
        loading: false
      });
      throw error;
    }
  },

  setSelectedProduct: (product) => {
    set({ selectedProduct: product });
  },

  clearError: () => {
    set({ error: null });
  }
}));
