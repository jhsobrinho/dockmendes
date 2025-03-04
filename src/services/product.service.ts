import api from './api';
import { Product, ProductCreate, ProductUpdate, ProductFilters, ProductPaginatedResponse } from '../types';

const PRODUCTS_URL = '/products';

export const productService = {
  // Buscar todos os produtos com paginação e filtros
  getProducts: async (filters: ProductFilters): Promise<ProductPaginatedResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.active !== undefined) params.append('active', filters.active.toString());

    const response = await api.get(`${PRODUCTS_URL}?${params.toString()}`);
    return response.data;
  },

  // Buscar um produto específico
  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`${PRODUCTS_URL}/${id}`);
    return response.data;
  },

  // Criar um novo produto
  createProduct: async (product: ProductCreate): Promise<Product> => {
    console.log('Service: Enviando requisição para criar produto:', product);
    try {
      const response = await api.post(PRODUCTS_URL, product);
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

  // Atualizar um produto
  updateProduct: async (id: string, product: ProductUpdate): Promise<Product> => {
    const response = await api.put(`${PRODUCTS_URL}/${id}`, product);
    return response.data;
  },

  // Deletar um produto
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`${PRODUCTS_URL}/${id}`);
  }
};
