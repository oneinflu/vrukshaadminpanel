import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import categoryService from '../services/categoryService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    parent: '',
    icon: null,
  });
  const { enqueueSnackbar } = useSnackbar();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories();
      console.log('Fetched categories:', response);
      if (Array.isArray(response)) {
        setCategories(response);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Failed to fetch categories', { variant: 'error' });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name || '',
        parent: category.parent?._id || '',
        icon: null,
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        parent: '',
        icon: null,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
    setFormData({
      name: '',
      parent: '',
      icon: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedCategory) {
        await categoryService.updateCategory(selectedCategory._id, formData);
        enqueueSnackbar('Category updated successfully', { variant: 'success' });
      } else {
        await categoryService.createCategory(formData);
        enqueueSnackbar('Category created successfully', { variant: 'success' });
      }
      handleClose();
      await fetchCategories();
    } catch (error) {
      console.error('Operation error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Operation failed', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setLoading(true);
        await categoryService.deleteCategory(id);
        enqueueSnackbar('Category deleted successfully', { variant: 'success' });
        await fetchCategories();
      } catch (error) {
        console.error('Delete error:', error);
        enqueueSnackbar(error.response?.data?.message || 'Failed to delete category', {
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        icon: file,
      });
    }
  };

  const getParentCategories = () => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(cat => 
      !cat.parent && cat._id !== selectedCategory?._id
    );
  };

  if (loading && categories.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Icon</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Parent Category</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>
                  <Avatar
                    src={category.icon?.trim()}
                    alt={category.name}
                    sx={{ width: 40, height: 40 }}
                  >
                    {category.name?.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.parent?.name || 'None'}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleOpen(category)}
                  >
                    <EditIcon />
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(category._id)}
                  >
                    <DeleteIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              select
              margin="dense"
              label="Parent Category"
              fullWidth
              value={formData.parent}
              onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {getParentCategories().map((category) => (
                <MenuItem 
                  key={category._id} 
                  value={category._id}
                >
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              type="file"
              fullWidth
              onChange={handleIconChange}
              required={!selectedCategory}
              inputProps={{
                accept: 'image/*',
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {selectedCategory ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Categories;