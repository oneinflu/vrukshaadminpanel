import api from './api';

const productService = {
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const formData = new FormData();
    
    // Handle basic fields
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('category', productData.category);
    
    // Handle variations as JSON string
    formData.append('variation', JSON.stringify(productData.variation));
    
    // Handle multiple images
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const formData = new FormData();
    
    // Handle basic fields
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('category', productData.category);
    
    // Handle variations as JSON string
    formData.append('variation', JSON.stringify(productData.variation));
    
    // Handle multiple images
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },
};

export default productService;