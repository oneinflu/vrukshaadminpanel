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
  Avatar,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import orderService from '../services/orderService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
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

  const handleStatusUpdate = async () => {
    try {
      await orderService.updateOrderStatus(selectedOrder._id, newStatus);
      enqueueSnackbar('Order status updated successfully', { variant: 'success' });
      setStatusUpdateOpen(false);
      fetchOrders();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update status', {
        variant: 'error',
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Order Placed': '#FFA000',
      'Processing': '#1976D2',
      'Shipped': '#2E7D32',
      'Delivered': '#388E3C',
      'Cancelled': '#D32F2F',
      'Scheduled': '#9C27B0',
    };
    return colors[status] || '#757575';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const OrderDetails = () => {
    if (!selectedOrder) return null;

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
                          <TableCell>Weight</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  src={item.product?.images?.[0]}
                                  alt={item.product?.name}
                                  variant="rounded"
                                  sx={{ width: 40, height: 40 }}
                                />
                                {item.product?.name}
                              </Box>
                            </TableCell>
                            <TableCell>{item.variation?.weight}</TableCell>
                            <TableCell>₹{item.variation?.price}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell align="right">
                              ₹{(item.variation?.price * item.quantity) || 0}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={4} align="right">
                            <strong>Total Amount:</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>₹{selectedOrder.total}</strong>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button
            onClick={() => {
              setDetailsOpen(false);
              setStatusUpdateOpen(true);
            }}
            variant="contained"
            color="primary"
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const StatusUpdateDialog = () => (
    <Dialog open={statusUpdateOpen} onClose={() => setStatusUpdateOpen(false)}>
      <DialogTitle>Update Order Status</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={newStatus}
            label="Status"
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <MenuItem value="Order Placed">Order Placed</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setStatusUpdateOpen(false)}>Cancel</Button>
        <Button onClick={handleStatusUpdate} variant="contained" color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Orders Management</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id.slice(-6)}</TableCell>
                <TableCell>
                  <Typography>{order.user?.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {order.user?.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  {order.items?.map((item, index) => (
                    <Typography key={index} variant="body2">
                      {item.quantity}x {item.product?.name} ({item.variation?.weight})
                    </Typography>
                  ))}
                </TableCell>
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
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell align="right">
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
      <StatusUpdateDialog />
    </Box>
  );
};

export default Orders;