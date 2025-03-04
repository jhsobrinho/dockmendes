import { create } from 'zustand';
import { Company, CompanyCreate, CompanyUpdate, CompanyFilters, CompanyPaginatedResponse } from '../types/company.types';
import { companyService } from '../services/company.service';

interface CompanyState {
  // Estado
  companies: Company[];
  total: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  selectedCompany: Company | null;

  // Ações
  fetchCompanies: (filters: CompanyFilters) => Promise<void>;
  fetchCompany: (id: string) => Promise<void>;
  createCompany: (company: CompanyCreate) => Promise<void>;
  updateCompany: (id: string, company: CompanyUpdate) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  toggleCompanyActive: (id: string) => Promise<void>;
  clearError: () => void;
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  // Estado inicial
  companies: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  selectedCompany: null,

  // Ações
  fetchCompanies: async (filters: CompanyFilters) => {
    try {
      set({ loading: true, error: null });
      const response: CompanyPaginatedResponse = await companyService.getCompanies(filters);
      set({
        companies: response.companies,
        total: response.total,
        currentPage: response.currentPage,
        totalPages: response.pages,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchCompany: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const company = await companyService.getCompany(id);
      set({ selectedCompany: company, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createCompany: async (company: CompanyCreate) => {
    try {
      console.log('Store: Iniciando criação da empresa:', company);
      set({ loading: true, error: null });
      const response = await companyService.createCompany(company);
      console.log('Store: Empresa criada com sucesso:', response);
      await get().fetchCompanies({ page: 1 }); // Recarrega a primeira página
      set({ loading: false });
    } catch (error) {
      console.error('Store: Erro detalhado ao criar empresa:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateCompany: async (id: string, company: CompanyUpdate) => {
    try {
      set({ loading: true, error: null });
      const updatedCompany = await companyService.updateCompany(id, company);
      set(state => ({
        companies: state.companies.map(c => c.id === id ? updatedCompany : c),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deleteCompany: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await companyService.deleteCompany(id);
      set(state => ({
        companies: state.companies.filter(c => c.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  toggleCompanyActive: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const updatedCompany = await companyService.toggleCompanyActive(id);
      set(state => ({
        companies: state.companies.map(c => c.id === id ? updatedCompany : c),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
  setSelectedCompany: (company) => set({ selectedCompany: company })
}));
