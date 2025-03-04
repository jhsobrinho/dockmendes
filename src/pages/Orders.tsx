import React from 'react';
import OrderList from '@/components/orders/OrderList';
import OrderForm from '@/components/orders/OrderForm';

interface OrdersProps {
  mode?: 'list' | 'new' | 'edit';
  orderId?: string | null;
}

const Orders: React.FC<OrdersProps> = ({ mode = 'list', orderId = null }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {mode === 'list' && <OrderList />}
      {(mode === 'new' || mode === 'edit') && (
        <OrderForm mode={mode} orderId={orderId} />
      )}
    </div>
  );
};

export default Orders;
