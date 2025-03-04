import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Dock } from '../../types';
import { useDockStore } from '../../store/dockStore';
import Button from '../ui/Button';

interface DockCardProps {
  dock: Dock;
  onEdit: (dock: Dock) => void;
}

const DockCard: React.FC<DockCardProps> = ({ dock, onEdit }) => {
  const { blockDock, unblockDock, deleteDock } = useDockStore();

  const handleBlock = async () => {
    const reason = window.prompt('Por favor, informe o motivo do bloqueio:');
    if (reason) {
      try {
        await blockDock(dock.id, reason);
      } catch (error) {
        // Erro já está sendo tratado na store
      }
    }
  };

  const handleUnblock = async () => {
    if (window.confirm('Tem certeza que deseja desbloquear esta doca?')) {
      try {
        await unblockDock(dock.id);
      } catch (error) {
        // Erro já está sendo tratado na store
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta doca?')) {
      try {
        await deleteDock(dock.id);
      } catch (error) {
        // Erro já está sendo tratado na store
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {dock.name}
            </h3>
            {dock.isBlocked && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertTriangle size={12} className="mr-1" />
                Bloqueada
              </span>
            )}
          </div>
          {dock.blockReason && (
            <p className="text-sm text-red-600 mt-1">
              Motivo: {dock.blockReason}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => onEdit(dock)}
            variant="outline"
            size="sm"
          >
            Editar
          </Button>
          {dock.isBlocked ? (
            <Button
              onClick={handleUnblock}
              variant="outline"
              size="sm"
            >
              Desbloquear
            </Button>
          ) : (
            <Button
              onClick={handleBlock}
              variant="outline"
              size="sm"
            >
              Bloquear
            </Button>
          )}
          <Button
            onClick={handleDelete}
            variant="danger"
            size="sm"
          >
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center text-gray-600">
          <Clock size={16} className="mr-2" />
          <span className="text-sm">
            {dock.workingHours.start} - {dock.workingHours.end}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DockCard;
