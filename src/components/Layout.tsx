import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, isAdmin, getRoleDisplayName } from '../context/AuthContext';
import { 
  Home, 
  Calendar, 
  Zap, 
  BarChart3, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  ClipboardCheck,
  User,
  ChevronDown
} from 'lucide-react';

type Page = 'dashboard' | 'attendance' | 'engagement' | 'analytics' | 'reports';

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentPage, onNavigate, children }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdminUser = user && isAdmin(user.role);

  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: Home, adminOnly: false },
    { id: 'attendance' as Page, label: 'Attendance', icon: Calendar, adminOnly: false },
    { id: 'engagement' as Page, label: 'Engagement', icon: Zap, adminOnly: false },
    { id: 'analytics' as Page, label: 'Analytics', icon: BarChart3, adminOnly: true },
    { id: 'reports' as Page, label: 'Reports', icon: FileText, adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdminUser);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isDark ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}>
        {/* Logo */}
        <div className={`h-16 flex items-center justify-between px-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Smart Attendance
              </h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Tracking System
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1"
          >
            <X className={isDark ? 'text-gray-400' : 'text-gray-500'} size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : isDark 
                      ? 'text-gray-400 hover:bg-gray-700/50 hover:text-white' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info at Bottom */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${
            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.name}
              </p>
              <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {user ? getRoleDisplayName(user.role) : ''}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className={`sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 ${
          isDark ? 'bg-gray-800/95 border-b border-gray-700' : 'bg-white/95 border-b border-gray-200'
        } backdrop-blur-sm`}>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Menu className={isDark ? 'text-gray-300' : 'text-gray-600'} size={24} />
          </button>

          {/* Page Title (desktop) */}
          <h1 className={`hidden lg:block text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {filteredNavItems.find(item => item.id === currentPage)?.label}
          </h1>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name.charAt(0)}
                </div>
                <ChevronDown className={`hidden sm:block ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-50 ${
                    isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}>
                    <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user?.name}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user?.email}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user ? getRoleDisplayName(user.role) : ''}
                      </span>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          // Profile page would go here
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          isDark 
                            ? 'hover:bg-gray-700 text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <User size={18} />
                        <span>Profile</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-red-500 ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-red-50'
                        }`}
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className={`p-4 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          © 2024 Smart Attendance & Engagement Tracking System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};
