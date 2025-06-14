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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Snackbar,
  InputAdornment,
  TablePagination,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as TransactionIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

import { financeTransactionsAPI, financeCategoriesAPI } from '../../data/financeStorage';

const TransactionsManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [formData, setFormData] = useState({
    type: 'income',
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterType, filterCategory]);

  const loadData = () => {
    try {
      const transactionsData = financeTransactionsAPI.getAll();
      const categoriesData = financeCategoriesAPI.getAll();
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      showSnackbar('خطأ في تحميل البيانات', 'error');
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(transaction.categoryId).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة حسب النوع
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // فلترة حسب الفئة
    if (filterCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.categoryId === parseInt(filterCategory));
    }

    // ترتيب حسب التاريخ (الأحدث أولاً)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredTransactions(filtered);
    setPage(0); // إعادة تعيين الصفحة عند التفلتر
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'غير محدد';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#757575';
  };

  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        type: transaction.type,
        categoryId: transaction.categoryId,
        amount: transaction.amount.toString(),
        description: transaction.description || '',
        date: transaction.date
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        type: 'income',
        categoryId: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
    setFormData({
      type: 'income',
      categoryId: '',
      amount: '',
      description: '',
      date: new Date()
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.categoryId) {
      showSnackbar('يرجى اختيار الفئة', 'error');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showSnackbar('يرجى إدخال مبلغ صحيح', 'error');
      return;
    }

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date
      };

      if (editingTransaction) {
        financeTransactionsAPI.update(editingTransaction.id, transactionData);
        showSnackbar('تم تحديث المعاملة بنجاح');
      } else {
        financeTransactionsAPI.add(transactionData);
        showSnackbar('تم إضافة المعاملة بنجاح');
      }
      
      loadData();
      handleCloseDialog();
    } catch (error) {
      showSnackbar('خطأ في حفظ المعاملة', 'error');
    }
  };

  const handleDelete = (transaction) => {
    if (window.confirm(`هل أنت متأكد من حذف هذه المعاملة؟`)) {
      try {
        financeTransactionsAPI.delete(transaction.id);
        showSnackbar('تم حذف المعاملة بنجاح');
        loadData();
      } catch (error) {
        showSnackbar('خطأ في حذف المعاملة', 'error');
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-DZ');
  };

  const availableCategories = categories.filter(cat => cat.type === formData.type);

  // حساب الإحصائيات
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  return (
    <Box>
        {/* رأس القسم */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TransactionIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              إدارة المعاملات المالية
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            إضافة معاملة جديدة
          </Button>
        </Box>

        {/* إحصائيات سريعة */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" component="div" fontWeight="bold">
                      {formatCurrency(totalIncome)}
                    </Typography>
                    <Typography variant="h6">
                      إجمالي الإيرادات
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
                    <Typography variant="h5" component="div" fontWeight="bold">
                      {formatCurrency(totalExpenses)}
                    </Typography>
                    <Typography variant="h6">
                      إجمالي المصروفات
                    </Typography>
                  </Box>
                  <ExpenseIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: netProfit >= 0 
                ? 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)' 
                : 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', 
              color: 'white' 
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" component="div" fontWeight="bold">
                      {formatCurrency(netProfit)}
                    </Typography>
                    <Typography variant="h6">
                      صافي الربح
                    </Typography>
                  </Box>
                  <TransactionIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {transactions.length}
                    </Typography>
                    <Typography variant="h6">
                      إجمالي المعاملات
                    </Typography>
                  </Box>
                  <TransactionIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* أدوات البحث والفلترة */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder="البحث في المعاملات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>فلترة حسب النوع</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="فلترة حسب النوع"
                  >
                    <MenuItem value="all">جميع الأنواع</MenuItem>
                    <MenuItem value="income">الإيرادات فقط</MenuItem>
                    <MenuItem value="expense">المصروفات فقط</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>فلترة حسب الفئة</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    label="فلترة حسب الفئة"
                  >
                    <MenuItem value="all">جميع الفئات</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: category.color
                            }}
                          />
                          {category.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* جدول المعاملات */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              قائمة المعاملات ({filteredTransactions.length})
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>النوع</TableCell>
                    <TableCell>الفئة</TableCell>
                    <TableCell>المبلغ</TableCell>
                    <TableCell>الوصف</TableCell>
                    <TableCell>التاريخ</TableCell>
                    <TableCell align="center">الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>
                          <Chip
                            icon={transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
                            label={transaction.type === 'income' ? 'إيراد' : 'مصروف'}
                            color={transaction.type === 'income' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: getCategoryColor(transaction.categoryId)
                              }}
                            />
                            {getCategoryName(transaction.categoryId)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: transaction.type === 'income' ? 'success.main' : 'error.main',
                              fontWeight: 'bold'
                            }}
                          >
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={transaction.description || 'لا يوجد وصف'}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {transaction.description || '-'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleOpenDialog(transaction)}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(transaction)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredTransactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="عدد الصفوف في الصفحة:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
            />
          </CardContent>
        </Card>

        {/* حوار إضافة/تعديل معاملة */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {editingTransaction ? 'تعديل المعاملة' : 'إضافة معاملة جديدة'}
              </Typography>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>نوع المعاملة</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => {
                      handleInputChange('type', e.target.value);
                      handleInputChange('categoryId', ''); // إعادة تعيين الفئة
                    }}
                    label="نوع المعاملة"
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
                <FormControl fullWidth>
                  <InputLabel>الفئة</InputLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    label="الفئة"
                  >
                    {availableCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: category.color
                            }}
                          />
                          {category.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="المبلغ"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">دج</InputAdornment>,
                  }}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="التاريخ"
                  type="date"
                  value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
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
              startIcon={editingTransaction ? <EditIcon /> : <AddIcon />}
            >
              {editingTransaction ? 'تحديث' : 'إضافة'}
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

export default TransactionsManager;
