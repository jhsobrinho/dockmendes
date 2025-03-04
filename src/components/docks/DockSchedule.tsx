import React, { useEffect, useState } from 'react';
import { useDockStore } from '../../store/dockStore';
import { DockSchedule as DockScheduleType } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface DockScheduleProps {
  dockId: string;
}

const DockSchedule: React.FC<DockScheduleProps> = ({ dockId }) => {
  const { 
    selectedDock,
    schedules,
    loading,
    error,
    scheduleFilters,
    setScheduleFilters,
    fetchSchedules,
    getDockById,
    createSchedule,
    updateSchedule,
    deleteSchedule
  } = useDockStore();

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    getDockById(dockId);
    fetchSchedules(dockId);
  }, [dockId]);

  useEffect(() => {
    setScheduleFilters({
      startDate,
      endDate
    });
  }, [startDate, endDate]);

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleStatusChange = async (scheduleId: string, status: DockScheduleType['status']) => {
    try {
      await updateSchedule(dockId, scheduleId, { status });
    } catch (error) {
      // Erro já está sendo tratado na store
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await deleteSchedule(dockId, scheduleId);
      } catch (error) {
        // Erro já está sendo tratado na store
      }
    }
  };

  const getStatusColor = (status: DockScheduleType['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: DockScheduleType['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (!selectedDock) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Agendamentos - {selectedDock.name}
        </h2>
        {selectedDock.isBlocked && (
          <div className="flex items-center text-red-600">
            <AlertTriangle size={20} className="mr-2" />
            <span>Doca Bloqueada</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data Inicial
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange(e.target.value, endDate)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data Final
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange(startDate, e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                      {getStatusText(schedule.status)}
                    </span>
                    <h4 className="font-medium">
                      Pedido #{schedule.order.id.slice(0, 8)}
                    </h4>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      {new Date(schedule.startTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock size={16} className="mr-1" />
                      {new Date(schedule.startTime).toLocaleTimeString()} - {new Date(schedule.endTime).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {schedule.status !== 'completed' && schedule.status !== 'cancelled' && (
                    <>
                      {schedule.status === 'scheduled' && (
                        <Button
                          onClick={() => handleStatusChange(schedule.id, 'in_progress')}
                          variant="outline"
                          size="sm"
                        >
                          Iniciar
                        </Button>
                      )}
                      {schedule.status === 'in_progress' && (
                        <Button
                          onClick={() => handleStatusChange(schedule.id, 'completed')}
                          variant="outline"
                          size="sm"
                        >
                          Concluir
                        </Button>
                      )}
                      <Button
                        onClick={() => handleStatusChange(schedule.id, 'cancelled')}
                        variant="danger"
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleDelete(schedule.id)}
                    variant="danger"
                    size="sm"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Nenhum agendamento encontrado para o período selecionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DockSchedule;
