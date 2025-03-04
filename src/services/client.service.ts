import api from './api';
import { Client } from '../types';

interface ClientsResponse {
  clients: Client[];
  total: number;
}

interface SingleClientResponse {
  data: Client;
}

export const clientAPI = {
  getClients: async (params: any = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/clients?${queryParams}`);
    return response.data;
  },

  getClientById: async (id: string) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  createClient: async (clientData: Partial<Client>) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  updateClient: async (id: string, clientData: Partial<Client>) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id: string) => {
    return api.delete(`/clients/${id}`);
  },

  toggleClientStatus: async (id: string, active: boolean) => {
    const response = await api.patch(`/clients/${id}`, { active });
    return response.data;
  }
};
