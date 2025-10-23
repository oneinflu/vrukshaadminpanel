import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to fetch orders', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setStatusUpdateLoading(true);
      await orderService.updateOrderStatus(orderId, newStatus);
      enqueueSnackbar('Order status updated successfully', { variant: 'success' });
      fetchOrders();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update order status', {
        variant: 'error',
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f57c00',
      'Processing': '#1976d2',
      'Shipped': '#7b1fa2',
      'Delivered': '#2e7d32',
      'Cancelled': '#d32f2f',
    };
    return colors[status] || '#757575';
  };

  const handlePaymentReceived = async (orderId) => {
    try {
      await paymentService.recordCODPayment(orderId);
      enqueueSnackbar('Payment recorded successfully', { variant: 'success' });
      fetchOrders(); // Refresh orders list
      setDetailsOpen(false); // Close the dialog
    } catch (error) {
      console.error('Payment recording error:', {
        orderId,
        error: error.response?.data || error.message,
        status: error.response?.status,
        headers: error.response?.headers
      });
      const errorMessage = error.response?.status === 403
        ? 'Not authorized to record payments. Please check your admin privileges.'
        : error.response?.data?.message || error.message || 'Failed to record payment';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const OrderDetails = () => {
    if (!selectedOrder) return null;

    const showPaymentButton = selectedOrder.paymentMode === 'COD' && selectedOrder.status !== 'Cancelled';

    return (
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Order Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Order Information</Typography>
                  <Typography>Order ID: {selectedOrder._id}</Typography>
                  <Typography>Date: {formatDate(selectedOrder.createdAt)}</Typography>
                  <Typography>
                    Status: <Chip
                      label={selectedOrder.status}
                      style={{
                        backgroundColor: getStatusColor(selectedOrder.status),
                        color: '#fff',
                      }}
                    />
                  </Typography>
                  <Typography>Total Amount: ₹{selectedOrder.total}</Typography>
                  <Typography>Payment Mode: {selectedOrder.paymentMode}</Typography>
                  {selectedOrder.isRecurring && (
                    <Typography>Recurring Order: Yes</Typography>
                  )}
                  {showPaymentButton && (
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ mt: 2 }}
                      onClick={() => handlePaymentReceived(selectedOrder._id)}
                    >
                      Record Payment Received
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Customer Information</Typography>
                  <Typography>Name: {selectedOrder.user?.name}</Typography>
                  <Typography>Email: {selectedOrder.user?.email}</Typography>
                  <Typography>Phone: {selectedOrder.user?.phone}</Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>Shipping Address</Typography>
                  <Typography>{selectedOrder.shippingAddress?.address}</Typography>
                  <Typography>
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                  </Typography>
                  <Typography>PIN: {selectedOrder.shippingAddress?.pincode}</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Order Items */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Order Items</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items?.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                {item.product?.image && (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    style={{ width: 50, height: 50, marginRight: 10 }}
                                  />
                                )}
                                {item.product?.name}
                              </Box>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.price}</TableCell>
                            <TableCell>₹{item.quantity * item.price}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Update Status</InputLabel>
            <Select
              value=""
              label="Update Status"
              onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
              disabled={statusUpdateLoading}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Shipped">Shipped</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Orders
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.user?.name}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>₹{order.total}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    style={{
                      backgroundColor: getStatusColor(order.status),
                      color: '#fff',
                    }}
                  />
                </TableCell>
                <TableCell>{order.paymentMode}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedOrder(order);
                      setDetailsOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <OrderDetails />
    </Box>
  );
};

export default Orders;