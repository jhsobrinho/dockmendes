import React, { useEffect, useState } from 'react';
import { useOrderStore } from '../../store/orderStore';
import { useClientStore } from '../../store/clientStore';
import { useProductStore } from '../../store/productStore';
import { Client, Product } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ArrowLeft, Plus, Trash } from 'lucide-react';

interface OrderFormProps {
  mode: 'new' | 'edit';
  orderId: string | null;
}

const OrderForm: React.FC<OrderFormProps> = ({ mode, orderId }) => {
  const { 
    selectedOrder,
    currentOrderItems,
    loading,
    error,
    getOrderById,
    createOrder,
    updateOrder,
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
    clearOrderItems,
    calculateTotals
  } = useOrderStore();

  const { clients, fetchClients } = useClientStore();
  const { products, fetchProducts } = useProductStore();

  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    fetchClients();
    fetchProducts();

    if (mode === 'edit' && orderId) {
      getOrderById(orderId);
    }

    return () => {
      clearOrderItems();
    };
  }, [mode, orderId]);

  useEffect(() => {
    if (mode === 'edit' && selectedOrder) {
      setSelectedClient(selectedOrder.clientId);
      setScheduledDate(selectedOrder.scheduledDate?.split('T')[0] || '');
      setEstimatedTime(selectedOrder.estimatedTime);
      setNotes(selectedOrder.notes || '');
    }
  }, [mode, selectedOrder]);

  const handleAddItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (product) {
      addOrderItem(product, quantity);
      setSelectedProduct('');
      setQuantity(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderData = {
      clientId: selectedClient,
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null,
      estimatedTime,
      notes,
      items: currentOrderItems
    };

    try {
      if (mode === 'edit' && orderId) {
        await updateOrder(orderId, orderData);
      } else {
        await createOrder(orderData);
      }

      // Voltar para a lista de pedidos
      const event = new CustomEvent('navigate', { 
        detail: { page: 'orders' } 
      });
      window.dispatchEvent(event);
    } catch (error) {
      // Erro já está sendo tratado na store
    }
  };

  const handleBack = () => {
    const event = new CustomEvent('navigate', { 
      detail: { page: 'orders' } 
    });
    window.dispatchEvent(event);
  };

  const { subtotal, discount, total } = calculateTotals();

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
            {mode === 'new' ? 'Novo Pedido' : 'Editar Pedido'}
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
          <h3 className="text-lg font-medium mb-4">Informações do Pedido</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={mode === 'edit'}
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client: Client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data Agendada
              </label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tempo Estimado (minutos)
              </label>
              <Input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
                min={1}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Itens do Pedido</h3>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione um produto</option>
                {products.map((product: Product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-32">
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                min={1}
                placeholder="Qtd"
              />
            </div>

            <Button
              type="button"
              onClick={handleAddItem}
              disabled={!selectedProduct}
              className="flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Adicionar
            </Button>
          </div>

          {currentOrderItems.length > 0 ? (
            <div className="space-y-4">
              {currentOrderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      Quantidade: {item.quantity} x R$ {Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">
                      R$ {(item.quantity * Number(item.price)).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeOrderItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto:</span>
                  <span>R$ {discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg mt-2">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Nenhum item adicionado
            </p>
          )}
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
            disabled={loading || currentOrderItems.length === 0}
          >
            {loading ? 'Salvando...' : mode === 'new' ? 'Criar Pedido' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
