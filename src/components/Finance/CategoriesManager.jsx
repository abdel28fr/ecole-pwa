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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { financeCategoriesAPI } from '../../data/financeStorage';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'income',
    color: '#4caf50',
    description: ''
  });

  const predefinedColors = [
    '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336',
    '#00bcd4', '#8bc34a', '#ffc107', '#e91e63', '#607d8b'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    try {
      const categoriesData = financeCategoriesAPI.getAll();
      setCategories(categoriesData);
    } catch (error) {
      showSnackbar('خطأ في تحميل الفئات', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color,
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        type: 'income',
        color: '#4caf50',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'income',
      color: '#4caf50',
      description: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      showSnackbar('يرجى إدخال اسم الفئة', 'error');
      return;
    }

    try {
      if (editingCategory) {
        financeCategoriesAPI.update(editingCategory.id, formData);
        showSnackbar('تم تحديث الفئة بنجاح');
      } else {
        financeCategoriesAPI.add(formData);
        showSnackbar('تم إضافة الفئة بنجاح');
      }
      
      loadCategories();
      handleCloseDialog();
    } catch (error) {
      showSnackbar('خطأ في حفظ الفئة', 'error');
    }
  };

  const handleDelete = (category) => {
    if (window.confirm(`هل أنت متأكد من حذف فئة "${category.name}"؟`)) {
      try {
        financeCategoriesAPI.delete(category.id);
        showSnackbar('تم حذف الفئة بنجاح');
        loadCategories();
      } catch (error) {
        showSnackbar(error.message, 'error');
      }
    }
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <Box>
      {/* رأس القسم */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CategoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            إدارة الفئات المالية
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          إضافة فئة جديدة
        </Button>
      </Box>

      {/* إحصائيات سريعة */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {incomeCategories.length}
                  </Typography>
                  <Typography variant="h6">
                    فئات الإيرادات
                  </Typography>
                </Box>
                <IncomeIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #ff7043 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {expenseCategories.length}
                  </Typography>
                  <Typography variant="h6">
                    فئات المصروفات
                  </Typography>
                </Box>
                <ExpenseIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {categories.length}
                  </Typography>
                  <Typography variant="h6">
                    إجمالي الفئات
                  </Typography>
                </Box>
                <CategoryIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* قوائم الفئات */}
      <Grid container spacing={3}>
        {/* فئات الإيرادات */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <IncomeIcon sx={{ color: '#4caf50' }} />
                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  فئات الإيرادات ({incomeCategories.length})
                </Typography>
              </Box>
              
              {incomeCategories.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  لا توجد فئات إيرادات
                </Typography>
              ) : (
                <List>
                  {incomeCategories.map((category, index) => (
                    <React.Fragment key={category.id}>
                      <ListItem>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              backgroundColor: category.color
                            }}
                          />
                          <ListItemText
                            primary={category.name}
                            secondary={category.description}
                          />
                        </Box>
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleOpenDialog(category)}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDelete(category)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < incomeCategories.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* فئات المصروفات */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ExpenseIcon sx={{ color: '#f44336' }} />
                <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                  فئات المصروفات ({expenseCategories.length})
                </Typography>
              </Box>
              
              {expenseCategories.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  لا توجد فئات مصروفات
                </Typography>
              ) : (
                <List>
                  {expenseCategories.map((category, index) => (
                    <React.Fragment key={category.id}>
                      <ListItem>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              backgroundColor: category.color
                            }}
                          />
                          <ListItemText
                            primary={category.name}
                            secondary={category.description}
                          />
                        </Box>
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleOpenDialog(category)}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDelete(category)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < expenseCategories.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* حوار إضافة/تعديل فئة */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="اسم الفئة"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>نوع الفئة</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  label="نوع الفئة"
                >
                  <MenuItem value="income">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IncomeIcon sx={{ color: '#4caf50' }} />
                      إيراد
                    </Box>
                  </MenuItem>
                  <MenuItem value="expense">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ExpenseIcon sx={{ color: '#f44336' }} />
                      مصروف
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                لون الفئة
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {predefinedColors.map((color) => (
                  <Box
                    key={color}
                    onClick={() => handleInputChange('color', color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: formData.color === color ? '3px solid #000' : '2px solid #ddd',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="الوصف (اختياري)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={editingCategory ? <EditIcon /> : <AddIcon />}
          >
            {editingCategory ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* إشعارات */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoriesManager;
