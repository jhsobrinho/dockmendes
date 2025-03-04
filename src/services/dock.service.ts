import api from './api';
import { Dock, DockSchedule } from '../types';

interface DockFilters {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  isBlocked?: boolean;
}

interface DockScheduleFilters {
  startDate?: string;
  endDate?: string;
  status?: DockSchedule['status'];
}

const formatToLocalTime = (date: Date): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const dockAPI = {
  // Operações básicas de CRUD
  getDocks: async (filters: DockFilters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const { data } = await api.get(`/docks?${queryParams}`);
    return data;
  },

  getDockById: async (id: string) => {
    const { data } = await api.get(`/docks/${id}`);
    return data;
  },

  createDock: async (dockData: Partial<Dock>) => {
    const { data } = await api.post('/docks', dockData);
    return data;
  },

  updateDock: async (id: string, dockData: Partial<Dock>) => {
    const { data } = await api.put(`/docks/${id}`, dockData);
    return data;
  },

  deleteDock: async (id: string) => {
    const { data } = await api.delete(`/docks/${id}`);
    return data;
  },

  // Operações de bloqueio/desbloqueio
  blockDock: async (id: string, reason: string) => {
    const { data } = await api.post(`/docks/${id}/block`, { reason });
    return data;
  },

  unblockDock: async (id: string) => {
    const { data } = await api.post(`/docks/${id}/unblock`);
    return data;
  },

  // Operações de agendamento
  getDockSchedule: async (id: string, filters: DockScheduleFilters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const { data } = await api.get(`/docks/${id}/schedule?${queryParams}`);
    return data;
  },

  createSchedule: async (dockId: string, scheduleData: Partial<DockSchedule>) => {
    const { data } = await api.post(`/docks/${dockId}/schedule`, scheduleData);
    return data;
  },

  updateSchedule: async (dockId: string, scheduleId: string, scheduleData: Partial<DockSchedule>) => {
    const { data } = await api.put(`/docks/${dockId}/schedule/${scheduleId}`, scheduleData);
    return data;
  },

  deleteSchedule: async (dockId: string, scheduleId: string) => {
    const { data } = await api.delete(`/docks/${dockId}/schedule/${scheduleId}`);
    return data;
  },

  // Verificação de disponibilidade
  checkAvailability: async (dockId: string, startTime: string, endTime: string) => {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    console.log('Horários recebidos:');
    console.log('startTime:', startTime);
    console.log('endTime:', endTime);
    console.log('startDate:', startDate.toLocaleString());
    console.log('endDate:', endDate.toLocaleString());

    const formattedStartTime = formatToLocalTime(startDate);
    const formattedEndTime = formatToLocalTime(endDate);

    console.log('Horários formatados:');
    console.log('formattedStartTime:', formattedStartTime);
    console.log('formattedEndTime:', formattedEndTime);

    const queryParams = new URLSearchParams({
      date: startDate.toISOString().split('T')[0],
      startTime: formattedStartTime,
      endTime: formattedEndTime
    });

    console.log('URL final:', `/docks/${dockId}/availability?${queryParams}`);

    const { data } = await api.get(`/docks/${dockId}/availability?${queryParams}`);
    return data;
  }
};
