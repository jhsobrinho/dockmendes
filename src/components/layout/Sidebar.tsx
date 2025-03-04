import React from 'react';
import { 
  Home, 
  Users, 
  Package, 
  ShoppingCart, 
  Calendar, 
  BarChart2, 
  Settings, 
  LogOut,
  Truck,
  Building,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active = false, onClick }) => {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex items-center w-full p-2 rounded-md transition-colors ${
          active 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
      </button>
    </li>
  );
};

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeItem = 'dashboard',
  onItemClick = () => {}
}) => {
  const { logout } = useAuthStore();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'companies', label: 'Companies', icon: <Building size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'products', label: 'Products', icon: <Package size={20} /> },
    { id: 'clients', label: 'Clients', icon: <Users size={20} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
    { id: 'docks', label: 'Dock Management', icon: <Truck size={20} /> },
    { id: 'reservations', label: 'Reservations', icon: <Clock size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart2 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleItemClick = (itemId: string) => {
    onItemClick(itemId);
    
    // Dispatch a custom event to notify App component about navigation
    const event = new CustomEvent('navigate', { 
      detail: { page: itemId } 
    });
    window.dispatchEvent(event);
  };
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">DockFlow</h1>
        <p className="text-sm text-gray-500">Dock Management System</p>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeItem === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <SidebarItem
          icon={<LogOut size={20} />}
          label="Logout"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Sidebar;