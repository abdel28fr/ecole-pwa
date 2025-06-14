import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import {
  Assessment as ReportIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as ProfitIcon,
  DateRange as DateIcon,
  PieChart as ChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { financeTransactionsAPI, financeCategoriesAPI } from '../../data/financeStorage';

const FinanceReports = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // بداية السنة
    endDate: new Date().toISOString().split('T')[0] // اليوم
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTransactionsByDate();
  }, [transactions, dateRange]);

  const loadData = () => {
    try {
      const transactionsData = financeTransactionsAPI.getAll();
      const categoriesData = financeCategoriesAPI.getAll();
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    }
  };

  const filterTransactionsByDate = () => {
    const filtered = financeTransactionsAPI.getByDateRange(dateRange.startDate, dateRange.endDate);
    setFilteredTransactions(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // حساب الإحصائيات
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  // إحصائيات الفئات
  const categoryStats = financeTransactionsAPI.getCategoryStats(dateRange.startDate, dateRange.endDate);
  const incomeCategories = Object.values(categoryStats).filter(cat => cat.type === 'income' && cat.amount > 0);
  const expenseCategories = Object.values(categoryStats).filter(cat => cat.type === 'expense' && cat.amount > 0);

  // البيانات الشهرية
  const monthlyStats = financeTransactionsAPI.getMonthlyStats(selectedYear);
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const setQuickDateRange = (type) => {
    const today = new Date();
    let startDate, endDate;

    switch (type) {
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisYear':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
        break;
      case 'lastYear':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        return;
    }

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  return (
    <Box>
      {/* رأس القسم */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReportIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            التقارير والإحصائيات المالية
          </Typography>
        </Box>
      </Box>

      {/* أدوات الفلترة */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            فلترة التقارير
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="من تاريخ"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="إلى تاريخ"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>السنة للتحليل الشهري</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  label="السنة للتحليل الشهري"
                >
                  {[2022, 2023, 2024, 2025, 2026].map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button size="small" onClick={() => setQuickDateRange('thisMonth')}>
                  هذا الشهر
                </Button>
                <Button size="small" onClick={() => setQuickDateRange('thisYear')}>
                  هذه السنة
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* الإحصائيات الرئيسية */}
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
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {filteredTransactions.filter(t => t.type === 'income').length} معاملة
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
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {filteredTransactions.filter(t => t.type === 'expense').length} معاملة
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
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {netProfit >= 0 ? 'ربح' : 'خسارة'}
                  </Typography>
                </Box>
                <ProfitIcon sx={{ fontSize: 48, opacity: 0.8 }} />
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
                    {filteredTransactions.length}
                  </Typography>
                  <Typography variant="h6">
                    إجمالي المعاملات
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    في الفترة المحددة
                  </Typography>
                </Box>
                <DateIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* التحليل الشهري */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TimelineIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6">
                  التحليل الشهري لسنة {selectedYear}
                </Typography>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>الشهر</TableCell>
                      <TableCell align="right">الإيرادات</TableCell>
                      <TableCell align="right">المصروفات</TableCell>
                      <TableCell align="right">صافي الربح</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(monthlyStats).map(([month, data]) => (
                      <TableRow key={month}>
                        <TableCell>{monthNames[month - 1]}</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          {formatCurrency(data.income)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                          {formatCurrency(data.expenses)}
                        </TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            color: data.net >= 0 ? 'success.main' : 'error.main', 
                            fontWeight: 'bold' 
                          }}
                        >
                          {formatCurrency(data.net)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* إحصائيات الفئات */}
      <Grid container spacing={3}>
        {/* فئات الإيرادات */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ChartIcon sx={{ color: '#4caf50' }} />
                <Typography variant="h6" sx={{ color: '#4caf50' }}>
                  توزيع الإيرادات حسب الفئات
                </Typography>
              </Box>
              
              {incomeCategories.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  لا توجد إيرادات في الفترة المحددة
                </Typography>
              ) : (
                <Box>
                  {incomeCategories.map((category) => {
                    const percentage = totalIncome > 0 ? (category.amount / totalIncome) * 100 : 0;
                    return (
                      <Box key={category.name} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: category.color
                              }}
                            />
                            <Typography variant="body2">{category.name}</Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(category.amount)} ({percentage.toFixed(1)}%)
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            backgroundColor: 'grey.200',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: category.color,
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* فئات المصروفات */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ChartIcon sx={{ color: '#f44336' }} />
                <Typography variant="h6" sx={{ color: '#f44336' }}>
                  توزيع المصروفات حسب الفئات
                </Typography>
              </Box>
              
              {expenseCategories.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  لا توجد مصروفات في الفترة المحددة
                </Typography>
              ) : (
                <Box>
                  {expenseCategories.map((category) => {
                    const percentage = totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0;
                    return (
                      <Box key={category.name} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: category.color
                              }}
                            />
                            <Typography variant="body2">{category.name}</Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(category.amount)} ({percentage.toFixed(1)}%)
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            backgroundColor: 'grey.200',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: category.color,
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceReports;
