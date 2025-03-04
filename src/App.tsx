import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DockManagement from './pages/DockManagement';
import { CompaniesPage } from './pages/companies/CompaniesPage';
import UsersPage from './pages/users/UsersPage';
import { useAuthStore } from './store/authStore';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const { isAuthenticated, user } = useAuthStore();
  
  useEffect(() => {
    const handleNavigation = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.page === 'string') {
        setCurrentPage(e.detail.page);
      }
    };
    
    window.addEventListener('navigate' as any, handleNavigation);
    
    return () => {
      window.removeEventListener('navigate' as any, handleNavigation);
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
      default:
        return <Dashboard />;
    }
  };

  return renderPage();
}

export default App;