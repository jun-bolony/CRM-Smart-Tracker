// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

interface AuthContextType {
  token: string | null;
  user: { email: string } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{ email: string } | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!token && !!user;

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    const { token, email: userEmail } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ email: userEmail }));
    setToken(token);
    setUser({ email: userEmail });
  };

  const register = async (email: string, password: string) => {
    const data = await apiRegister(email, password);
    const { token, email: userEmail } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ email: userEmail }));
    setToken(token);
    setUser({ email: userEmail });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // If token exists but no user, clear (optional)
  useEffect(() => {
    if (token && !user) {
      logout();
    }
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};