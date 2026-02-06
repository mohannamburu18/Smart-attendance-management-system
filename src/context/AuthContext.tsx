import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { getUsers, saveUsers, generateId, initializeData } from '../services/mockData';

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (data: { email: string; password: string; name: string; role: UserRole; department?: string }) => Promise<{ success: boolean; message: string }>;
  updateLastLogin: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data and check for existing session on mount
  useEffect(() => {
    initializeData();
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (foundUser) {
      // Update last login
      const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
      const updatedUsers = users.map(u => u.id === foundUser.id ? updatedUser : u);
      saveUsers(updatedUsers);
      
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      return { success: true, message: 'Login successful!' };
    }
    
    return { success: false, message: 'Invalid email or password' };
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // Register function
  const register = async (data: { 
    email: string; 
    password: string; 
    name: string; 
    role: UserRole; 
    department?: string 
  }): Promise<{ success: boolean; message: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getUsers();
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'Email already registered' };
    }
    
    // Create new user
    const newUser: User = {
      id: generateId(),
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      department: data.department,
      createdAt: new Date().toISOString(),
    };
    
    // Save to localStorage
    saveUsers([...users, newUser]);
    
    // Auto-login after registration
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { success: true, message: 'Registration successful!' };
  };

  // Update last login timestamp
  const updateLastLogin = () => {
    if (user) {
      const users = getUsers();
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      saveUsers(updatedUsers);
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateLastLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to check if user has admin privileges
export const isAdmin = (role: UserRole): boolean => {
  return ['admin', 'teacher', 'hr'].includes(role);
};

// Helper function to get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    teacher: 'Teacher',
    hr: 'HR Manager',
    student: 'Student',
    employee: 'Employee',
  };
  return roleNames[role];
};
