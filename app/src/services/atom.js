import { create } from 'zustand';

import { api } from './axios.js';
const saveUserToStorage = (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  };
  
  const loadUserFromStorage = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

export const useUserStore = create((set) => ({
    user: loadUserFromStorage(), 
    checkSession: async () => {
        try {
          const { data } = await api.get('user/profile');
          set({ user: data });
          saveUserToStorage(data);
        } catch (error) {
          console.warn('Session not found or expired');
          set({ user: null });
          saveUserToStorage(null);
        }
      },    
      login: async (credentials) => {
        try {
          const { data } = await api.post('auth/login', credentials);
          set({ user: data });
          saveUserToStorage(data);
        } catch (error) {
          console.error('Login failed:', error.response?.data || error.message);
          throw error;
        }
      },
      signup: async (userData) => {
        try {
          const { data } = await api.post('auth/register', userData);
          set({ user: data });
          saveUserToStorage(data);
        } catch (error) {
          console.error('Signup failed:', error.response?.data || error.message);
          throw error;
        }
      },
      logout: async () => {
        try {
          await api.post('auth/logout');
          set({ user: null });
          saveUserToStorage(null);
        } catch (error) {
          console.error('Logout error:', error.response?.data || error.message);
          throw error;
        }
      },
  setuser: (user) => set({ user }),  
 
}));


