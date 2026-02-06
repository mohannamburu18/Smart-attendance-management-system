import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Building, 
  Sun, 
  Moon,
  AlertCircle,
  CheckCircle,
  ClipboardCheck
} from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  
  // State management
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [department, setDepartment] = useState('');

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    const result = await login(email, password);
    
    setIsLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(onSuccess, 500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      setIsLoading(false);
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }
    
    const result = await register({ email, password, name, role, department });
    
    setIsLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(onSuccess, 500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  // Demo login helper
  const fillDemoCredentials = (type: 'admin' | 'student') => {
    if (type === 'admin') {
      setEmail('admin@school.edu');
      setPassword('admin123');
    } else {
      setEmail('alice@student.edu');
      setPassword('student123');
    }
    setMessage(null);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 ${
          isDark 
            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`w-full max-w-md transition-all duration-300 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            isDark 
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          } shadow-lg`}>
            <ClipboardCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Smart Attendance</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Engagement & Tracking System
          </p>
        </div>

        {/* Login/Register Card */}
        <div className={`rounded-2xl shadow-xl p-8 transition-all duration-300 ${
          isDark 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white'
        }`}>
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => { setIsRegistering(false); setMessage(null); }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                !isRegistering 
                  ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <LogIn className="inline-block w-4 h-4 mr-2" />
              Login
            </button>
            <button
              onClick={() => { setIsRegistering(true); setMessage(null); }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                isRegistering 
                  ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <UserPlus className="inline-block w-4 h-4 mr-2" />
              Register
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'error' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {/* Name field (registration only) */}
            {isRegistering && (
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' 
                        : 'bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    placeholder="John Doe"
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' 
                      : 'bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' 
                      : 'bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Role and Department (registration only) */}
            {isRegistering && (
              <>
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' 
                        : 'bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  >
                    <option value="student">Student</option>
                    <option value="employee">Employee</option>
                    <option value="teacher">Teacher</option>
                    <option value="hr">HR Manager</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Department (Optional)
                  </label>
                  <div className="relative">
                    <Building className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' 
                          : 'bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isLoading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                isRegistering ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          {!isRegistering && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-sm text-center mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Try demo accounts:
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fillDemoCredentials('admin')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Admin Demo
                </button>
                <button
                  onClick={() => fillDemoCredentials('student')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Student Demo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className={`text-center mt-6 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          © 2024 Smart Attendance System. All rights reserved.
        </p>
      </div>
    </div>
  );
};
