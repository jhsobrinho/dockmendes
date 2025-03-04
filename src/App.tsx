import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DockManagement from './pages/DockManagement';
import { CompaniesPage } from './pages/companies/CompaniesPage';
import UsersPage from './pages/users/UsersPage';
import ProductsPage from './pages/products/ProductsPage';
import ClientsPage from './pages/clients/ClientsPage';
import Orders from './pages/Orders';
import { useAuthStore } from './store/authStore';

interface NavigationEvent extends CustomEvent {
  detail: {
    page: string;
    orderId?: string;
  };
}

function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  
  useEffect(() => {
    const handleNavigation = (e: Event) => {
      const event = e as NavigationEvent;
      if (event.detail) {
        setCurrentPage(event.detail.page);
        if (event.detail.orderId) {
          setCurrentOrderId(event.detail.orderId);
        }
      }
    };
    
    window.addEventListener('navigate', handleNavigation);
    
    return () => {
      window.removeEventListener('navigate', handleNavigation);
    };
  }, []);
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'docks':
        return <DockManagement />;
      case 'companies':
        return <CompaniesPage />;
      case 'users':
        return <UsersPage />;
      case 'products':
        return <ProductsPage />;
      case 'clients':
        return <ClientsPage />;
      case 'orders':
        return <Orders />;
      case 'new-order':
        return <Orders mode="new" />;
      case 'edit-order':
        return <Orders mode="edit" orderId={currentOrderId} />;
      default:
        return <Dashboard />;
    }
  };

  return renderPage();
}

export default App;