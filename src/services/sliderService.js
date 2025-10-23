import api from './api';

const sliderService = {
  getAllSliders: async () => {
    const response = await api.get('/sliders');
    return response.data;
  },

  getSliderById: async (id) => {
    const response = await api.get(`/sliders/${id}`);
    return response.data;
  },

  createSlider: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/sliders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteSlider: async (id) => {
    const response = await api.delete(`/sliders/${id}`);
    return response.data;
  },
};

export default sliderService;