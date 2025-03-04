import { create } from 'zustand';
import { Dock, DockSchedule } from '../types';
import { dockAPI } from '../services/dock.service';

interface DockState {
  docks: Dock[];
  selectedDock: Dock | null;
  schedules: DockSchedule[];
  loading: boolean;
  error: string | null;
  filters: {
    page: number;
    limit: number;
    search?: string;
    companyId?: string;
    isBlocked?: boolean;
  };
  scheduleFilters: {
    startDate?: string;
    endDate?: string;
    status?: DockSchedule['status'];
  };
  setFilters: (filters: Partial<DockState['filters']>) => void;
  setScheduleFilters: (filters: Partial<DockState['scheduleFilters']>) => void;
  fetchDocks: () => Promise<void>;
  getDockById: (id: string) => Promise<void>;
  createDock: (dockData: Partial<Dock>) => Promise<void>;
  updateDock: (id: string, dockData: Partial<Dock>) => Promise<void>;
  deleteDock: (id: string) => Promise<void>;
  blockDock: (id: string, reason: string) => Promise<void>;
  unblockDock: (id: string) => Promise<void>;
  fetchSchedules: (dockId: string) => Promise<void>;
  createSchedule: (dockId: string, scheduleData: Partial<DockSchedule>) => Promise<void>;
  updateSchedule: (dockId: string, scheduleId: string, scheduleData: Partial<DockSchedule>) => Promise<void>;
  deleteSchedule: (dockId: string, scheduleId: string) => Promise<void>;
  checkAvailability: (dockId: string, startTime: string, endTime: string) => Promise<boolean>;
  clearSelectedDock: () => void;
  clearError: () => void;
}

const transformDockData = (data: any): Dock => ({
  ...data,
  workingHours: {
    start: data.workingHoursStart,
    end: data.workingHoursEnd
  }
});

export const useDockStore = create<DockState>((set, get) => ({
  docks: [],
  selectedDock: null,
  schedules: [],
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10
  },
  scheduleFilters: {},

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().fetchDocks();
  },

  setScheduleFilters: (newFilters) => {
    set((state) => ({
      scheduleFilters: { ...state.scheduleFilters, ...newFilters }
    }));
    if (get().selectedDock) {
      get().fetchSchedules(get().selectedDock.id);
    }
  },

  fetchDocks: async () => {
    try {
      set({ loading: true, error: null });
      const response = await dockAPI.getDocks(get().filters);
      set({ 
        docks: response.docks.map(transformDockData),
        loading: false
      });
    } catch (error) {
      console.error('Erro ao buscar docas:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar docas',
        loading: false,
        docks: []
      });
    }
  },

  getDockById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await dockAPI.getDockById(id);
      set({ selectedDock: transformDockData(response.dock), loading: false });
    } catch (error) {
      console.error('Erro ao buscar doca:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar doca',
        loading: false
      });
    }
  },

  createDock: async (dockData) => {
    try {
      set({ loading: true, error: null });
      await dockAPI.createDock(dockData);
      get().fetchDocks();
    } catch (error) {
      console.error('Erro ao criar doca:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao criar doca',
        loading: false
      });
      throw error;
    }
  },

  updateDock: async (id, dockData) => {
    try {
      set({ loading: true, error: null });
      await dockAPI.updateDock(id, dockData);
      get().fetchDocks();
      if (get().selectedDock?.id === id) {
        get().getDockById(id);
      }
    } catch (error) {
      console.error('Erro ao atualizar doca:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar doca',
        loading: false
      });
      throw error;
    }
  },

  deleteDock: async (id) => {
    try {
      set({ loading: true, error: null });
      await dockAPI.deleteDock(id);
      set(state => ({
        docks: state.docks.filter(dock => dock.id !== id),
        selectedDock: state.selectedDock?.id === id ? null : state.selectedDock,
        loading: false
      }));
    } catch (error) {
      console.error('Erro ao excluir doca:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao excluir doca',
        loading: false
      });
      throw error;
    }
  },

  blockDock: async (id, reason) => {
    try {
      set({ loading: true, error: null });
      await dockAPI.blockDock(id, reason);
      get().fetchDocks();
      if (get().selectedDock?.id === id) {
        get().getDockById(id);
      }
    } catch (error) {
      console.error('Erro ao bloquear doca:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao bloquear doca',
        loading: false
      });
      throw error;
    }
  },

  unblockDock: async (id) => {
    try {
      set({ loading: true, error: null });
      await dockAPI.unblockDock(id);
      get().fetchDocks();
      if (get().selectedDock?.id === id) {
        get().getDockById(id);
      }
    } catch (error) {
      console.error('Erro ao desbloquear doca:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao desbloquear doca',
        loading: false
      });
      throw error;
    }
  },

  fetchSchedules: async (dockId) => {
    try {
      set({ loading: true, error: null });
      const response = await dockAPI.getDockSchedule(dockId, get().scheduleFilters);
      set({ 
        schedules: response.schedules || [],
        loading: false
      });
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar agendamentos',
        loading: false,
        schedules: []
      });
    }
  },

  createSchedule: async (dockId, scheduleData) => {
    try {
      set({ loading: true, error: null });
      await dockAPI.createSchedule(dockId, scheduleData);
      get().fetchSchedules(dockId);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao criar agendamento',
        loading: false
      });
      throw error;
    }
  },

  updateSchedule: async (dockId, scheduleId, scheduleData) => {
    try {
      set({ loading: true, error: null });
      await dockAPI.updateSchedule(dockId, scheduleId, scheduleData);
      get().fetchSchedules(dockId);
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar agendamento',
        loading: false
      });
      throw error;
    }
  },

  deleteSchedule: async (dockId, scheduleId) => {
    try {
      set({ loading: true, error: null });
      await dockAPI.deleteSchedule(dockId, scheduleId);
      get().fetchSchedules(dockId);
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao excluir agendamento',
        loading: false
      });
      throw error;
    }
  },

  checkAvailability: async (dockId, startTime, endTime) => {
    try {
      set({ loading: true, error: null });
      const response = await dockAPI.checkAvailability(dockId, startTime, endTime);
      set({ loading: false });
      return response.available;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao verificar disponibilidade',
        loading: false
      });
      throw error;
    }
  },

  clearSelectedDock: () => {
    set({ selectedDock: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));
