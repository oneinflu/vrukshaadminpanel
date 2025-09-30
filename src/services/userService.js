import api from './api';

const userService = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
};

export default userService;