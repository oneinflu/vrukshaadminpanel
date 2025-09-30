import api from './api';

const statsService = {
  getStats: async () => {
    const response = await api.get('/stats/');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },

  // Helper function to format currency values
  formatCurrency: (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },

  // Helper function to format large numbers with K/M/B suffix
  formatNumber: (value) => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + 'B';
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  },

  // Helper function to calculate percentage change
  calculatePercentageChange: (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  },

  // Helper function to get trend color based on percentage change
  getTrendColor: (percentageChange) => {
    if (percentageChange > 0) return '#2E7D32'; // Green
    if (percentageChange < 0) return '#D32F2F'; // Red
    return '#757575'; // Grey
  },
};

export default statsService;