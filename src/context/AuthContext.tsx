import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loading: boolean;
  isDemo: boolean;
  login: (...args: any[]) => Promise<void>;
  register: (...args: any[]) => Promise<void>;
  startDemo: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
        setIsDemo(res.user.email.includes('demo@'));
      } else {
        setUser(null);
        setIsDemo(false);
      }
    } catch (err) {
      setUser(null);
      setIsDemo(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (...args: any[]) => {
    let payload;
    if (args.length === 2 && typeof args[0] === 'string') {
      payload = { email: args[0], password: args[1] };
    } else {
      payload = args[0];
    }
    const res = await api.login(payload);
    setUser(res.user);
    setIsDemo(res.user.email.includes('demo@'));
  };

  const register = async (...args: any[]) => {
    let payload;
    if (args.length >= 3 && typeof args[0] === 'string') {
      payload = { name: args[0], email: args[1], password: args[2], confirmPassword: args[3] };
    } else {
      payload = args[0];
    }
    const res = await api.register(payload);
    setUser(res.user);
    setIsDemo(false);
  };

  const startDemo = async () => {
    const res = await api.startDemo();
    setUser(res.user);
    setIsDemo(true);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setIsDemo(false);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loading: isLoading,
        isDemo,
        login,
        register,
        startDemo,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
