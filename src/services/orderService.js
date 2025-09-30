import api from './api';

const orderService = {
  getAllOrders: async () => {
    const response = await api.get('/orders/all');
    return response.data;
  },

  getOrderDetails: async (id) => {
    const response = await api.get(`/orders/details/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/status/${id}`, { status });
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.put(`/orders/cancel/${id}`);
    return response.data;
  },

  cancelRecurringOrder: async (orderId, recurringOrderId) => {
    const response = await api.put(
      `/orders/recurring/${orderId}/${recurringOrderId}/cancel`
    );
    return response.data;
  },

  // Helper function to format order status for display
  getStatusColor: (status) => {
    const statusColors = {
      pending: '#FFA000', // Amber
      processing: '#1976D2', // Blue
      shipped: '#2E7D32', // Green
      delivered: '#388E3C', // Dark Green
      cancelled: '#D32F2F', // Red
    };
    return statusColors[status] || '#757575'; // Grey for unknown status
  },

  // Helper function to format order date
  formatOrderDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
};

export default orderService;