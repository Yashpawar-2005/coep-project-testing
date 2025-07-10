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
      console.warn('Session not found or expired:', error.response?.data || error.message);
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
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  },

  signup: async (userData) => {
    try {
      const { data } = await api.post('auth/register', userData);
      console.log(data)
      set({ user: data });
      saveUserToStorage(data);
    } catch (error) {
      console.error('Signup failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Signup failed. Please try again.');
    }
  },

  logout: async () => {
    try {
      await api.post('auth/logout');
      set({ user: null });
      saveUserToStorage(null);
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      throw new Error('Logout failed. Please try again.');
    }
  },

  setuser: (user) => set({ user }),
}));


export const useTeamStore=create((set)=>({
  teamdata:null,
setteamdata:(data)=>set({teamdata:data}),
}))

export const useSendtoAdmin=create((set)=>({
  dataforadmin:null,
  setadmindata:(data)=>set({dataforadmin:data}),
}))
