import React from 'react';
import Layout from '../components/layout/Layout';
import StatCard from '../components/dashboard/StatCard';
import { ShoppingCart, Users, Truck, DollarSign, BarChart2 } from 'lucide-react';
import Card from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  
  // Mock data for demonstration
  const stats = [
    { 
      title: 'Total Orders', 
      value: '1,284', 
      icon: <ShoppingCart size={24} />,
      change: { value: 12, type: 'increase' }
    },
    { 
      title: 'Active Clients', 
      value: '342', 
      icon: <Users size={24} />,
      change: { value: 8, type: 'increase' }
    },
    { 
      title: 'Dock Utilization', 
      value: '78%', 
      icon: <Truck size={24} />,
      change: { value: 5, type: 'increase' }
    },
    { 
      title: 'Revenue', 
      value: '$48,294', 
      icon: <DollarSign size={24} />,
      change: { value: 3, type: 'decrease' }
    },
  ];

  return (
    <Layout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Welcome back, {user?.name || 'User'}</h2>
        <p className="text-gray-600">Here's what's happening with your docks today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Sales Overview">
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <BarChart2 size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Sales chart will be displayed here</p>
            </div>
          </div>
        </Card>

        <Card title="Upcoming Deliveries">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-md text-blue-600 mr-3">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Client {item}</p>
                  <p className="text-sm text-gray-500">Today, 2:00 PM</p>
                  <div className="mt-1 text-xs font-medium text-blue-600">Dock {item}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;