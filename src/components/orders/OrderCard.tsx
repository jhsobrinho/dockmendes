import React from 'react';
import { Calendar, Clock, Truck, User, Package, DollarSign } from 'lucide-react';
import { Order } from '../../types';
import { useOrderStore } from '../../store/orderStore';
import { formatCurrency } from '../../utils/format';

interface OrderCardProps {
  order: Order;
  onEdit: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onEdit }) => {
  const { updateOrderStatus, deleteOrder } = useOrderStore();

  const handleStatusChange = async (status: Order['status']) => {
    try {
      await updateOrderStatus(order.id, status);
    } catch (error) {
      // Erro já está sendo tratado na store
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await deleteOrder(order.id);
      } catch (error) {
        // Erro já está sendo tratado na store
      }
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
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

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 mt-2">
            Pedido #{order.id.slice(0, 8)}
          </h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(order)}
            className="text-blue-600 hover:text-blue-800"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
          >
            Excluir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center text-gray-600">
          <User size={16} className="mr-2" />
          <span className="text-sm">{order.client.name}</span>
        </div>

        <div className="flex items-center text-gray-600">
          <Package size={16} className="mr-2" />
          <span className="text-sm">{order.items.length} itens</span>
        </div>

        {order.scheduledDate && (
          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span className="text-sm">
              {new Date(order.scheduledDate).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="flex items-center text-gray-600">
          <Clock size={16} className="mr-2" />
          <span className="text-sm">{order.estimatedTime} min</span>
        </div>

        {order.dock && (
          <div className="flex items-center text-gray-600">
            <Truck size={16} className="mr-2" />
            <span className="text-sm">{order.dock.name}</span>
          </div>
        )}

        <div className="flex items-center text-gray-600">
          <DollarSign size={16} className="mr-2" />
          <span className="text-sm">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {order.status !== 'completed' && order.status !== 'cancelled' && (
        <div className="flex justify-end pt-4 space-x-2">
          {order.status === 'pending' && (
            <button
              onClick={() => handleStatusChange('in_progress')}
              className="px-3 py-1 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              Iniciar
            </button>
          )}
          
          {order.status === 'in_progress' && (
            <button
              onClick={() => handleStatusChange('completed')}
              className="px-3 py-1 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
            >
              Concluir
            </button>
          )}
          
          <button
            onClick={() => handleStatusChange('cancelled')}
            className="px-3 py-1 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
