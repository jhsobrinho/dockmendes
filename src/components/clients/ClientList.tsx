import React, { useEffect } from 'react';
import { Search } from 'lucide-react';
import { useClientStore } from '../../store/clientStore';
import ClientCard from './ClientCard';
import { Client } from '../../types';

interface ClientListProps {
  onEditClient: (client: Client) => void;
}

const ClientList: React.FC<ClientListProps> = ({ onEditClient }) => {
  const {
    clients,
    total,
    loading,
    error,
    filters,
    setFilters,
    fetchClients,
    clearError
  } = useClientStore();

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: event.target.value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const totalPages = Math.ceil(total / filters.limit);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-2 rounded flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-sm underline"
          >
            Limpar
          </button>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={filters.search || ''}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filters.limit}
          onChange={(e) => setFilters({ limit: Number(e.target.value), page: 1 })}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
        </select>

        <select
          value={filters.active === undefined ? '' : filters.active.toString()}
          onChange={(e) => {
            const value = e.target.value;
            setFilters({
              active: value === '' ? undefined : value === 'true',
              page: 1
            });
          }}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(clients || []).map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={onEditClient}
          />
        ))}
      </div>

      {(!clients || clients.length === 0) && !loading && (
        <div className="text-center py-8 text-gray-500">
          Nenhum cliente encontrado
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          
          <span className="px-3 py-1">
            Página {filters.page} de {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientList;
