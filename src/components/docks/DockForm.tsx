import React, { useEffect, useState } from 'react';
import { useDockStore } from '../../store/dockStore';
import { Dock } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ArrowLeft } from 'lucide-react';

interface DockFormProps {
  mode: 'new' | 'edit';
  dockId?: string;
}

const DockForm: React.FC<DockFormProps> = ({ mode, dockId }) => {
  const { selectedDock, loading, error, getDockById, createDock, updateDock } = useDockStore();

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');

  useEffect(() => {
    if (mode === 'edit' && dockId) {
      getDockById(dockId);
    }
  }, [mode, dockId]);

  useEffect(() => {
    if (mode === 'edit' && selectedDock) {
      setName(selectedDock.name);
      setStartTime(selectedDock.workingHours.start);
      setEndTime(selectedDock.workingHours.end);
    }
  }, [mode, selectedDock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dockData = {
      name,
      workingHours: {
        start: startTime,
        end: endTime
      }
    };

    try {
      if (mode === 'edit' && dockId) {
        await updateDock(dockId, dockData);
      } else {
        await createDock(dockData);
      }

      // Voltar para a lista de docas
      const event = new CustomEvent('navigate', { 
        detail: { page: 'docks' } 
      });
      window.dispatchEvent(event);
    } catch (error) {
      // Erro já está sendo tratado na store
    }
  };

  const handleBack = () => {
    const event = new CustomEvent('navigate', { 
      detail: { page: 'docks' } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="mr-4"
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'new' ? 'Nova Doca' : 'Editar Doca'}
          </h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome da Doca
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Doca 1"
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Horário de Início
                </label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Horário de Término
                </label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Salvando...' : mode === 'new' ? 'Criar Doca' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DockForm;
