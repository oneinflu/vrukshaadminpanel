import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  People as UsersIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Inventory as ProductIcon,
  ShoppingCart as OrderIcon,
  Schedule as ScheduledIcon,
  LocalShipping as ProcessingIcon,
  Done as DeliveredIcon,
  Cancel as CanceledIcon,
  RequestQuote as QuoteIcon,
  CurrencyRupee as IncomeIcon,
} from '@mui/icons-material';
import statsService from '../services/statsService';

const StatCard = ({ title, value, icon: Icon, color = '#1976D2' }) => (
  <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon sx={{ color, mr: 1 }} />
        <Typography color="textSecondary" variant="subtitle2">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
        {typeof value === 'number' && value >= 0 ? value.toLocaleString() : value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await statsService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load statistics</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Users Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Users Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Total Users"
            value={stats.users.total}
            icon={UsersIcon}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Business Users"
            value={stats.users.businessUsers}
            icon={BusinessIcon}
            color="#2E7D32"
          />
        </Grid>
      </Grid>

      {/* Inventory Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Inventory Status
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Total Categories"
            value={stats.inventory.categories}
            icon={CategoryIcon}
            color="#9C27B0"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Total Products"
            value={stats.inventory.products}
            icon={ProductIcon}
            color="#ED6C02"
          />
        </Grid>
      </Grid>

      {/* Orders Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Orders Status
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Orders"
            value={stats.orders.total}
            icon={OrderIcon}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Scheduled"
            value={stats.orders.scheduled}
            icon={ScheduledIcon}
            color="#FFA000"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Processing"
            value={stats.orders.processing}
            icon={ProcessingIcon}
            color="#0288D1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Delivered"
            value={stats.orders.delivered}
            icon={DeliveredIcon}
            color="#2E7D32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Canceled"
            value={stats.orders.canceled}
            icon={CanceledIcon}
            color="#D32F2F"
          />
        </Grid>
      </Grid>

      {/* Business Orders Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Business Orders
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Total Business Orders"
            value={stats.businessOrders.total}
            icon={BusinessIcon}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Quoted Amount"
            value={`₹${stats.businessOrders.quotedAmount.toLocaleString()}`}
            icon={QuoteIcon}
            color="#2E7D32"
          />
        </Grid>
      </Grid>

      {/* Finance Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Financial Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StatCard
            title="Total Income"
            value={`₹${stats.finance.totalIncome.toLocaleString()}`}
            icon={IncomeIcon}
            color="#2E7D32"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;