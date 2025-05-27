import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'client' | 'worker') => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'client' | 'worker') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Optionally verify token with backend
        try {
          const profile = await authAPI.getProfile();
          setUser(profile);
          await AsyncStorage.setItem('user_data', JSON.stringify(profile));
        } catch (error) {
          console.log('Token verification failed, using cached user data');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role: 'client' | 'worker') => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login({ email, password });
      
      // Store tokens
      await AsyncStorage.setItem('auth_token', response.tokens.access);
      await AsyncStorage.setItem('refresh_token', response.tokens.refresh);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'client' | 'worker') => {
    try {
      setIsLoading(true);
      
      // Split name into first and last name
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const response = await authAPI.register({
        email,
        password,
        confirm_password: password,
        first_name: firstName,
        last_name: lastName,
        role,
      });
      
      // Store tokens
      await AsyncStorage.setItem('auth_token', response.tokens.access);
      await AsyncStorage.setItem('refresh_token', response.tokens.refresh);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local data
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 