import React, { useEffect } from 'react';
import { useOrderStore } from '../../store/orderStore';
import OrderCard from './OrderCard';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Search, Plus } from 'lucide-react';

const OrderList: React.FC = () => {
  const { 
    orders, 
    total, 
    loading, 
    error,
    filters,
    setFilters,
    fetchOrders 
  } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value, page: 1 });
  };

  const handleStatusFilter = (status: string | undefined) => {
    setFilters({ status: status as any, page: 1 });
  };

  const handleDateFilter = (startDate: string, endDate: string) => {
    setFilters({ startDate, endDate, page: 1 });
  };

  const handleNewOrder = () => {
    // Dispatch evento de navegação para a página de novo pedido
    const event = new CustomEvent('navigate', { 
      detail: { page: 'new-order' } 
    });
    window.dispatchEvent(event);
  };

  const handleEditOrder = (orderId: string) => {
    // Dispatch evento de navegação para a página de edição
    const event = new CustomEvent('navigate', { 
      detail: { page: 'edit-order', orderId } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pedidos</h2>
        <Button
          onClick={handleNewOrder}
          className="flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Novo Pedido
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar pedidos..."
            value={filters.search || ''}
            onChange={handleSearch}
            leftIcon={<Search size={18} className="text-gray-400" />}
          />
        </div>

        <select
          className="form-select rounded-md border-gray-300"
          value={filters.status || ''}
          onChange={(e) => handleStatusFilter(e.target.value || undefined)}
        >
          <option value="">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="in_progress">Em Andamento</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>

        <Input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => handleDateFilter(e.target.value, filters.endDate || '')}
          className="w-auto"
        />

        <Input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => handleDateFilter(filters.startDate || '', e.target.value)}
          className="w-auto"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onEdit={() => handleEditOrder(order.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum pedido encontrado</p>
        </div>
      )}

      {total > filters.limit && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setFilters({ page: (filters.page || 1) - 1 })}
            disabled={filters.page === 1}
            className="mr-2"
          >
            Anterior
          </Button>
          <Button
            onClick={() => setFilters({ page: (filters.page || 1) + 1 })}
            disabled={(filters.page || 1) * filters.limit >= total}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderList;
