import { create } from 'zustand';
import { Client } from '../types';
import { clientAPI } from '../services/client.service';

interface ClientState {
  clients: Client[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedClient: Client | null;
  filters: {
    page: number;
    limit: number;
    search?: string;
    active?: boolean;
  };
  setFilters: (filters: Partial<ClientState['filters']>) => void;
  fetchClients: () => Promise<void>;
  getClientById: (id: string) => Promise<void>;
  createClient: (clientData: Partial<Client>) => Promise<void>;
  updateClient: (id: string, clientData: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  toggleClientStatus: (id: string, active: boolean) => Promise<void>;
  clearSelectedClient: () => void;
  clearError: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  total: 0,
  loading: false,
  error: null,
  selectedClient: null,
  filters: {
    page: 1,
    limit: 10,
    active: true,
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().fetchClients();
  },

  fetchClients: async () => {
    try {
      set({ loading: true, error: null });
      const response = await clientAPI.getClients(get().filters);
      console.log('Dados recebidos:', response);
      set({ 
        clients: response.clients || [], 
        total: response.total || 0 
      });
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar clientes',
        clients: [],
        total: 0
      });
    } finally {
      set({ loading: false });
    }
  },

  getClientById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await clientAPI.getClientById(id);
      set({ selectedClient: response });
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar cliente',
        selectedClient: null
      });
    } finally {
      set({ loading: false });
    }
  },

  createClient: async (clientData) => {
    try {
      set({ loading: true, error: null });
      await clientAPI.createClient(clientData);
      get().fetchClients();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao criar cliente' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateClient: async (id, clientData) => {
    try {
      set({ loading: true, error: null });
      await clientAPI.updateClient(id, clientData);
      get().fetchClients();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar cliente' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteClient: async (id) => {
    try {
      set({ loading: true, error: null });
      await clientAPI.deleteClient(id);
      get().fetchClients();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao excluir cliente' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  toggleClientStatus: async (id, active) => {
    try {
      set({ loading: true, error: null });
      await clientAPI.toggleClientStatus(id, active);
      get().fetchClients();
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
      set({ error: error instanceof Error ? error.message : 'Erro ao alterar status do cliente' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearSelectedClient: () => {
    set({ selectedClient: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));
