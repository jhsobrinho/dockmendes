import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useDockStore } from '../../store/dockStore';
import DockCard from './DockCard';
import Button from '../ui/Button';
import Input from '../ui/Input';

const DockList: React.FC = () => {
  const { 
    docks, 
    loading, 
    error, 
    filters,
    setFilters,
    fetchDocks 
  } = useDockStore();

  useEffect(() => {
    fetchDocks();
  }, []);

  const handleSearch = (search: string) => {
    setFilters({ search, page: 1 });
  };

  const handleNewDock = () => {
    const event = new CustomEvent('navigate', { 
      detail: { page: 'docks', mode: 'new' } 
    });
    window.dispatchEvent(event);
  };

  const handleEdit = (dock: any) => {
    const event = new CustomEvent('navigate', { 
      detail: { page: 'docks', mode: 'edit', dockId: dock.id } 
    });
    window.dispatchEvent(event);
  };

  if (loading && !docks.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Gerenciar Docas
        </h2>
        <Button
          onClick={handleNewDock}
          className="flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Nova Doca
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="w-64">
          <Input
            type="text"
            placeholder="Buscar docas..."
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {docks.length > 0 ? (
          docks.map((dock) => (
            <DockCard
              key={dock.id}
              dock={dock}
              onEdit={handleEdit}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Nenhuma doca encontrada.
              {!filters.search && ' Clique em "Nova Doca" para criar uma.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DockList;
