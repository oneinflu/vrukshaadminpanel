import api from './api';

const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const formData = new FormData();
    Object.keys(categoryData).forEach(key => {
      if (key === 'icon') {
        formData.append('icon', categoryData[key]);
      } else {
        formData.append(key, categoryData[key]);
      }
    });

    const response = await api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const formData = new FormData();
    Object.keys(categoryData).forEach(key => {
      if (key === 'icon' && categoryData[key]) {
        formData.append('icon', categoryData[key]);
      } else {
        formData.append(key, categoryData[key]);
      }
    });

    const response = await api.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;