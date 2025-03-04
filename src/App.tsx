import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DockManagement from './pages/DockManagement';
import { useAuthStore } from './store/authStore';

function App() {
  // In a real app, you would use a router like react-router-dom
  // For this demo, we'll use a simple state to switch between pages
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'docks'>('dashboard');
  const { isAuthenticated, user } = useAuthStore();
  
  // Listen for navigation events from sidebar
  useEffect(() => {
    const handleNavigation = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.page === 'string') {
        if (e.detail.page === 'docks') {
          setCurrentPage('docks');
        } else {
          setCurrentPage('dashboard');
        }
      }
    };
    
    window.addEventListener('navigate' as any, handleNavigation);
    
    return () => {
      window.removeEventListener('navigate' as any, handleNavigation);
    };
  }, []);
  
  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login />;
  }
  
  // Render the appropriate page based on currentPage state
  switch (currentPage) {
    case 'dashboard':
      return <Dashboard />;
    case 'docks':
      return <DockManagement />;
    default:
      return <Dashboard />;
  }
}

export default App;