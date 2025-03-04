import React, { useState, useEffect } from 'react';
import { useDockStore } from '../../store/dockStore';
import { DockSchedule } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ArrowLeft } from 'lucide-react';

interface DockScheduleFormProps {
  dockId: string;
  onClose: () => void;
  scheduleId?: string;
}

const DockScheduleForm: React.FC<DockScheduleFormProps> = ({ 
  dockId, 
  onClose, 
  scheduleId 
}) => {
  const { 
    selectedDock,
    loading,
    error,
    getDockById,
    createSchedule,
    updateSchedule,
    checkAvailability
  } = useDockStore();

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [orderId, setOrderId] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (dockId) {
      getDockById(dockId);
    }
  }, [dockId]);

  const validateTime = (time: Date, workingHours: { start: string; end: string }): boolean => {
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);

    const hours = time.getHours();
    const minutes = time.getMinutes();

    console.log('Validando horário:');
    console.log('Horário selecionado:', time.toLocaleString());
    console.log('Horas:', hours, 'Minutos:', minutes);
    console.log('Horário de funcionamento:', `${startHour}:${startMinute} - ${endHour}:${endMinute}`);

    // Verifica se o horário está dentro do período de funcionamento
    if (hours < startHour || (hours === startHour && minutes < startMinute)) {
      console.log('Horário antes do início do expediente');
      return false;
    }
    if (hours > endHour || (hours === endHour && minutes > endMinute)) {
      console.log('Horário após o fim do expediente');
      return false;
    }

    console.log('Horário dentro do expediente');
    return true;
  };

  const validateSchedule = async () => {
    if (!startTime || !endTime) {
      setValidationError('Por favor, preencha os horários de início e término.');
      return false;
    }

    console.log('Horários selecionados:');
    console.log('Início:', startTime);
    console.log('Término:', endTime);

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    console.log('Datas convertidas:');
    console.log('Início:', startDate.toLocaleString());
    console.log('Término:', endDate.toLocaleString());

    if (startDate >= endDate) {
      setValidationError('O horário de término deve ser posterior ao horário de início.');
      return false;
    }

    // Verifica se está dentro do horário de funcionamento da doca
    if (selectedDock?.workingHours) {
      console.log('Horário de funcionamento da doca:', selectedDock.workingHours);
      
      const isStartValid = validateTime(startDate, selectedDock.workingHours);
      const isEndValid = validateTime(endDate, selectedDock.workingHours);

      console.log('Validação dos horários:');
      console.log('Início válido:', isStartValid);
      console.log('Término válido:', isEndValid);

      if (!isStartValid || !isEndValid) {
        setValidationError(`O agendamento deve estar dentro do horário de funcionamento da doca (${selectedDock.workingHours.start} - ${selectedDock.workingHours.end}).`);
        return false;
      }
    }

    try {
      console.log('Verificando disponibilidade no backend...');
      const isAvailable = await checkAvailability(dockId, startTime, endTime);
      console.log('Resposta do backend:', isAvailable);
      
      if (!isAvailable) {
        setValidationError('Este horário já está ocupado.');
        return false;
      }
    } catch (error: any) {
      console.error('Erro ao verificar disponibilidade:', error);
      setValidationError(error.message || 'Erro ao verificar disponibilidade. Por favor, tente novamente.');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateSchedule();
    if (!isValid) {
      return;
    }

    const scheduleData: Partial<DockSchedule> = {
      startTime,
      endTime,
      orderId,
      status: 'scheduled'
    };

    try {
      if (scheduleId) {
        await updateSchedule(dockId, scheduleId, scheduleData);
      } else {
        await createSchedule(dockId, scheduleData);
      }
      onClose();
    } catch (error) {
      // Erro já está sendo tratado na store
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!selectedDock) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          onClick={onClose}
          variant="ghost"
          className="mr-4"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">
          {scheduleId ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h2>
      </div>

      {(error || validationError) && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error || validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Número do Pedido
              </label>
              <Input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ex: ORD123"
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data e Hora de Início
                </label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data e Hora de Término
                </label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Horário de funcionamento da doca: {selectedDock.workingHours.start} - {selectedDock.workingHours.end}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Salvando...' : scheduleId ? 'Salvar Alterações' : 'Criar Agendamento'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DockScheduleForm;
