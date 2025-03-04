import React, { useEffect } from 'react';
import { useDockStore } from '../../store/dockStore';
import { Dock, DockSchedule } from '../../types';
import { AlertTriangle, Plus } from 'lucide-react';
import Button from '../ui/Button';

interface DockKanbanProps {
  docks: Dock[];
  selectedDate: Date;
  onNewSchedule: (dockId: string) => void;
  onEditSchedule: (dockId: string, scheduleId: string) => void;
}

const DockKanban: React.FC<DockKanbanProps> = ({
  docks,
  selectedDate,
  onNewSchedule,
  onEditSchedule
}) => {
  const { 
    schedules,
    loading,
    error,
    fetchSchedules
  } = useDockStore();

  useEffect(() => {
    docks.forEach(dock => {
      fetchSchedules(dock.id);
    });
  }, [docks, selectedDate]);

  const getSchedulesByDock = (dockId: string) => {
    return schedules.filter(schedule => schedule.dockId === dockId);
  };

  const getSchedulePosition = (schedule: DockSchedule) => {
    const startHour = new Date(schedule.startTime).getHours();
    const startMinutes = new Date(schedule.startTime).getMinutes();
    const position = ((startHour * 60 + startMinutes) / (24 * 60)) * 100;
    const duration = schedule.duration;
    const height = (duration / (24 * 60)) * 100;
    
    return {
      top: `${position}%`,
      height: `${height}%`
    };
  };

  const getStatusColor = (status: DockSchedule['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusText = (status: DockSchedule['status']) => {
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

  if (loading && !docks.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-[100px_repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {/* Horários */}
          <div className="relative">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full text-xs text-gray-500"
                style={{ top: `${(i / 24) * 100}%` }}
              >
                {`${i.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Docas */}
          {docks.map((dock) => (
            <div
              key={dock.id}
              className="relative bg-white rounded-lg shadow p-4 h-[1200px]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-900">
                    {dock.name}
                  </h3>
                  {dock.isBlocked && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle size={12} className="mr-1" />
                      Bloqueada
                    </span>
                  )}
                </div>
                {!dock.isBlocked && (
                  <Button
                    onClick={() => onNewSchedule(dock.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus size={16} />
                  </Button>
                )}
              </div>

              {/* Grid de horas */}
              <div className="absolute inset-x-4 top-16 bottom-4">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-t border-gray-100"
                    style={{ top: `${(i / 24) * 100}%` }}
                  />
                ))}

                {/* Agendamentos */}
                {getSchedulesByDock(dock.id).map((schedule) => {
                  const { top, height } = getSchedulePosition(schedule);
                  return (
                    <div
                      key={schedule.id}
                      className={`absolute left-0 right-0 p-2 border rounded-md cursor-pointer transition-transform hover:scale-[1.02] ${getStatusColor(schedule.status)}`}
                      style={{ top, height }}
                      onClick={() => onEditSchedule(dock.id, schedule.id)}
                    >
                      <div className="text-xs font-medium">
                        {schedule.order.clientName}
                      </div>
                      <div className="text-xs">
                        {new Date(schedule.startTime).toLocaleTimeString()} - {new Date(schedule.endTime).toLocaleTimeString()}
                      </div>
                      <div className="text-xs mt-1">
                        {getStatusText(schedule.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DockKanban;