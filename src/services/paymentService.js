import api from './api';

const paymentService = {
  // Get all payments (Admin only)
  getAllPayments: async () => {
    try {
      // Log the request headers for debugging
      const token = localStorage.getItem('token');
      console.log('Making getAllPayments request with token:', token ? 'Bearer ' + token : 'No token');
      
      const response = await api.get('/payments/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      });
      throw error;
    }
  },

  // Record COD payment
  recordCODPayment: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/payments/record-cod', 
        { orderId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error recording COD payment:', {
        orderId,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      });
      throw error;
    }
  },

  // Update COD payment status
  updateCODPaymentStatus: async (paymentId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(
        `/payments/update-cod-status/${paymentId}`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating COD payment status:', {
        paymentId,
        status,
        error: error.response?.data || error.message,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  // Create Razorpay order
  createRazorpayOrder: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/payments/create-order',
        { orderId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', {
        orderId,
        error: error.response?.data || error.message,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  // Verify Razorpay payment
  verifyRazorpayPayment: async (paymentDetails) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/payments/verify',
        paymentDetails,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying Razorpay payment:', {
        paymentDetails,
        error: error.response?.data || error.message,
        headers: error.response?.headers
      });
      throw error;
    }
  }
};

export default paymentService;