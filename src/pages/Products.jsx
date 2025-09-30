import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  IconButton,
  Avatar,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    images: [],
    variation: [
      {
        weight: '',
        price: '',
        pcs: '',
      },
    ],
  });
  const { enqueueSnackbar } = useSnackbar();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to fetch products', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      enqueueSnackbar('Failed to fetch categories', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpen = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || '',
        images: [],
        variation: product.variation || [{ weight: '', price: '', pcs: '' }],
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        images: [],
        variation: [{ weight: '', price: '', pcs: '' }],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      images: [],
      variation: [{ weight: '', price: '', pcs: '' }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the variation data properly
      const formattedData = {
        ...formData,
        variation: formData.variation.map(v => ({
          weight: v.weight,
          price: Number(v.price),
          pcs: Number(v.pcs)
        }))
      };

      if (selectedProduct) {
        await productService.updateProduct(selectedProduct._id, formattedData);
        enqueueSnackbar('Product updated successfully', { variant: 'success' });
      } else {
        await productService.createProduct(formattedData);
        enqueueSnackbar('Product created successfully', { variant: 'success' });
      }
      handleClose();
      fetchProducts();
    } catch (error) {
      console.error('Operation error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Operation failed', {
        variant: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        enqueueSnackbar('Product deleted successfully', { variant: 'success' });
        fetchProducts();
      } catch (error) {
        enqueueSnackbar(error.response?.data?.message || 'Failed to delete product', {
          variant: 'error',
        });
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target?.files || []);
    setFormData({
      ...formData,
      images: files,
    });
  };

  const handleVariationChange = (index, field, value) => {
    const newVariations = [...formData.variation];
    newVariations[index] = {
      ...newVariations[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      variation: newVariations,
    });
  };

  const addVariation = () => {
    setFormData({
      ...formData,
      variation: [...formData.variation, { weight: '', price: '', pcs: '' }],
    });
  };

  const removeVariation = (index) => {
    if (formData.variation.length > 1) {
      const newVariations = formData.variation.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        variation: newVariations,
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Products</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Variations</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <Avatar
                    src={product.images?.[0]}
                    alt={product.name}
                    variant="rounded"
                    sx={{ width: 50, height: 50 }}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category?.name || 'N/A'}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>
                  {product.variation?.map((var_, index) => (
                    <div key={index}>
                      {var_.weight} - ₹{var_.price} ({var_.pcs} pcs)
                    </div>
                  ))}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(product)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(product._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
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
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <TextField
              select
              margin="dense"
              label="Category"
              fullWidth
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              type="file"
              fullWidth
              inputProps={{ multiple: true, accept: 'image/*' }}
              onChange={handleImageChange}
              required={!selectedProduct}
            />
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Variations
            </Typography>
            {formData.variation.map((variation, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Weight"
                  value={variation.weight}
                  onChange={(e) => handleVariationChange(index, 'weight', e.target.value)}
                  required
                  size="small"
                />
                <TextField
                  label="Price"
                  type="number"
                  value={variation.price}
                  onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                  required
                  size="small"
                />
                <TextField
                  label="Pieces"
                  type="number"
                  value={variation.pcs}
                  onChange={(e) => handleVariationChange(index, 'pcs', e.target.value)}
                  required
                  size="small"
                />
                {formData.variation.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => removeVariation(index)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={addVariation}
              sx={{ mt: 1 }}
            >
              Add Variation
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Products;