import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import DockList from '../components/docks/DockList';
import DockForm from '../components/docks/DockForm';
import DockKanban from '../components/docks/DockKanban';
import DockSchedule from '../components/docks/DockSchedule';
import DockScheduleForm from '../components/docks/DockScheduleForm';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, ListFilter } from 'lucide-react';
import Button from '../components/ui/Button';
import { useDockStore } from '../store/dockStore';

type ViewMode = 'list' | 'kanban';
type FormMode = 'none' | 'new-dock' | 'edit-dock' | 'new-schedule' | 'edit-schedule';

const DockManagement: React.FC = () => {
  const { docks, selectedDock, fetchDocks } = useDockStore();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [formMode, setFormMode] = useState<FormMode>('none');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDockId, setSelectedDockId] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocks();
  }, []);

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(selectedDate);

  const handleNewDock = () => {
    setFormMode('new-dock');
  };

  const handleEditDock = (dockId: string) => {
    setSelectedDockId(dockId);
    setFormMode('edit-dock');
  };

  const handleNewSchedule = (dockId: string) => {
    setSelectedDockId(dockId);
    setFormMode('new-schedule');
  };

  const handleEditSchedule = (dockId: string, scheduleId: string) => {
    setSelectedDockId(dockId);
    setSelectedScheduleId(scheduleId);
    setFormMode('edit-schedule');
  };

  const handleCloseForm = () => {
    setFormMode('none');
    setSelectedDockId(null);
    setSelectedScheduleId(null);
  };

  const renderContent = () => {
    switch (formMode) {
      case 'new-dock':
      case 'edit-dock':
        return (
          <DockForm 
            mode={formMode === 'new-dock' ? 'new' : 'edit'} 
            dockId={selectedDockId}
            onClose={handleCloseForm}
          />
        );
      case 'new-schedule':
      case 'edit-schedule':
        if (!selectedDockId) return null;
        return (
          <DockScheduleForm
            dockId={selectedDockId}
            scheduleId={selectedScheduleId}
            onClose={handleCloseForm}
          />
        );
      default:
        return viewMode === 'kanban' ? (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <button 
                  onClick={handlePreviousDay}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="mx-2 flex items-center">
                  <Calendar size={20} className="mr-2 text-blue-600" />
                  <span className="font-medium">{formattedDate}</span>
                </div>
                
                <button 
                  onClick={handleNextDay}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setViewMode('list')}
                  leftIcon={<ListFilter size={16} />}
                >
                  Visualização em Lista
                </Button>
                <Button
                  onClick={handleNewDock}
                  leftIcon={<Plus size={16} />}
                >
                  Nova Doca
                </Button>
              </div>
            </div>
            
            <DockKanban 
              docks={docks}
              selectedDate={selectedDate}
              onNewSchedule={handleNewSchedule}
              onEditSchedule={handleEditSchedule}
            />
          </>
        ) : (
          <DockList 
            onNewDock={handleNewDock}
            onEditDock={handleEditDock}
            onViewKanban={() => setViewMode('kanban')}
          />
        );
    }
  };

  return (
    <Layout title="Gerenciamento de Docas">
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default DockManagement;