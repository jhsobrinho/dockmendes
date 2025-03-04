import api from './api';
import { Company, CompanyCreate, CompanyUpdate, CompanyFilters, CompanyPaginatedResponse } from '../types/company.types';

const COMPANIES_URL = '/companies';

export const companyService = {
  // Buscar todas as empresas com paginação e filtros
  getCompanies: async (filters: CompanyFilters): Promise<CompanyPaginatedResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.active !== undefined) params.append('active', filters.active.toString());

    const response = await api.get(`${COMPANIES_URL}?${params.toString()}`);
    return response.data;
  },

  // Buscar uma empresa específica
  getCompany: async (id: string): Promise<Company> => {
    const response = await api.get(`${COMPANIES_URL}/${id}`);
    return response.data;
  },

  // Criar uma nova empresa
  createCompany: async (company: CompanyCreate): Promise<Company> => {
    console.log('Service: Enviando requisição para criar empresa:', company);
    try {
      const response = await api.post(COMPANIES_URL, company);
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

  // Atualizar uma empresa
  updateCompany: async (id: string, company: CompanyUpdate): Promise<Company> => {
    const response = await api.put(`${COMPANIES_URL}/${id}`, company);
    return response.data;
  },

  // Deletar uma empresa
  deleteCompany: async (id: string): Promise<void> => {
    await api.delete(`${COMPANIES_URL}/${id}`);
  },

  // Alternar status ativo/inativo
  toggleCompanyActive: async (id: string): Promise<Company> => {
    const response = await api.patch(`${COMPANIES_URL}/${id}/toggle-active`);
    return response.data;
  }
};
