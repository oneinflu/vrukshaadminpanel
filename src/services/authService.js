import api from './api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/admin/login', { email, password });
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      // Store user data separately
      const userData = {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      return userData;
    }
    throw new Error('Login failed: No token received');
  },

  register: async (userData) => {
    const response = await api.post('/admin/register', userData);
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      const newUserData = {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(newUserData));
      return newUserData;
    }
    throw new Error('Registration failed: No token received');
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      
      if (!token || !userStr) {
        return null;
      }

      const user = JSON.parse(userStr);
      return { ...user, token };
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;