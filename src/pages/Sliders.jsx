import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Card,
  CardMedia,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import sliderService from '../services/sliderService';

const Sliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await sliderService.getAllSliders();
      if (Array.isArray(response)) {
        setSliders(response);
      } else {
        setSliders([]);
      }
    } catch (error) {
      console.error('Error fetching sliders:', error);
      enqueueSnackbar('Failed to fetch sliders', { variant: 'error' });
      setSliders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setSelectedImage(null);
    setPreviewUrl('');
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
    setPreviewUrl('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      enqueueSnackbar('Please select an image', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      await sliderService.createSlider(selectedImage);
      enqueueSnackbar('Slider created successfully', { variant: 'success' });
      handleClose();
      await fetchSliders();
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
    if (window.confirm('Are you sure you want to delete this slider?')) {
      try {
        setLoading(true);
        await sliderService.deleteSlider(id);
        enqueueSnackbar('Slider deleted successfully', { variant: 'success' });
        await fetchSliders();
      } catch (error) {
        console.error('Delete error:', error);
        enqueueSnackbar(error.response?.data?.message || 'Failed to delete slider', {
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && sliders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Sliders</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Slider
        </Button>
      </Box>

      {sliders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No sliders found. Add your first slider!</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sliders.map((slider) => (
                <TableRow key={slider._id}>
                  <TableCell>
                    <Card sx={{ maxWidth: 200 }}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={slider.image}
                        alt="Slider Image"
                        sx={{ objectFit: 'contain' }}
                      />
                    </Card>
                  </TableCell>
                  <TableCell>
                    {new Date(slider.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(slider._id)}
                    >
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Slider</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              type="file"
              fullWidth
              onChange={handleImageChange}
              required
              inputProps={{
                accept: 'image/*',
              }}
            />
            {previewUrl && (
              <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>Preview:</Typography>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={previewUrl}
                    alt="Preview"
                    sx={{ objectFit: 'contain' }}
                  />
                </Card>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading || !selectedImage}
            >
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Sliders;