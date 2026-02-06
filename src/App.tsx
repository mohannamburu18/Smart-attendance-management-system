import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Attendance } from './components/Attendance';
import { Engagement } from './components/Engagement';
import { Analytics } from './components/Analytics';
import { Reports } from './components/Reports';
import { initializeData } from './services/mockData';

type Page = 'dashboard' | 'attendance' | 'engagement' | 'analytics' | 'reports';

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Main application content
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  // Initialize mock data on first load
  useEffect(() => {
    initializeData();
  }, []);

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onSuccess={() => setCurrentPage('dashboard')} />;
  }

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'attendance':
        return <Attendance />;
      case 'engagement':
        return <Engagement />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

// Root App component with providers
export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
