import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  Class as ClassIcon,
  Subject as SubjectIcon,
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
  PersonAdd as PersonAddIcon,
  BarChart as BarChartIcon,
  AccessTime as AccessTimeIcon,
  Groups as GroupsIcon,
  MenuBook as MenuBookIcon,
  AccountBalance as FinanceIcon,
  TrendingDown as ExpenseIcon
} from '@mui/icons-material';

import { studentsAPI, classesAPI, subjectsAPI, gradesAPI, paymentsAPI, settingsAPI } from '../../data/storage';
import { financeTransactionsAPI } from '../../data/financeStorage';

const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
      borderRadius: 3,
      boxShadow: (theme) => theme.palette.mode === 'dark'
        ? '0 4px 20px rgba(0,0,0,0.3)'
        : '0 4px 20px rgba(0,0,0,0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: (theme) => theme.palette.mode === 'dark'
        ? `0 12px 40px rgba(0,0,0,0.4), 0 0 20px ${color}30`
        : `0 12px 40px rgba(0,0,0,0.15), 0 0 20px ${color}20`,
      background: `linear-gradient(135deg, ${color}30 0%, ${color}15 100%)`,
      '& .stat-icon': {
        transform: 'rotate(10deg) scale(1.1)',
        boxShadow: `0 8px 25px ${color}40`
      },
      '& .stat-value': {
        transform: 'scale(1.05)',
        color: color
      },
      '& .stat-title': {
        color: (theme) => theme.palette.mode === 'dark' ? '#fff' : color
      },
      '& .click-hint': {
        opacity: 1,
        transform: 'translateY(0)'
      }
    },
    '&:active': {
      transform: 'translateY(-4px) scale(1.01)',
      transition: 'all 0.1s ease'
    }
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography
            variant="h4"
            component="div"
            fontWeight="bold"
            color={color}
            className="stat-value"
            sx={{
              transition: 'all 0.3s ease',
              mb: 1
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            className="stat-title"
            sx={{
              transition: 'all 0.3s ease',
              fontWeight: 500
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
              {subtitle}
            </Typography>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            className="click-hint"
            sx={{
              opacity: 0,
              transform: 'translateY(5px)',
              transition: 'all 0.3s ease',
              fontSize: '0.7rem',
              fontStyle: 'italic',
              mt: 0.5,
              display: 'block'
            }}
          >
            انقر للانتقال
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: color,
            width: 64,
            height: 64,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 4px 15px ${color}30`
          }}
          className="stat-icon"
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = ({ onNavigate }) => {
  const getMonthName = (monthNumber) => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[monthNumber - 1] || '';
  };

  const getClassName = (classId) => {
    const classes = classesAPI.getAll();
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.name : 'غير محدد';
  };

  // دوال التنقل للبطاقات
  const handleStudentsClick = () => {
    if (onNavigate) onNavigate(1); // التبويب الثاني (التلاميذ)
  };

  const handleClassesClick = () => {
    if (onNavigate) onNavigate(2); // التبويب الثالث (الأقسام)
  };

  const handleSubjectsClick = () => {
    if (onNavigate) onNavigate(3); // التبويب الرابع (المواد)
  };

  const handleGradesClick = () => {
    if (onNavigate) onNavigate(4); // التبويب الخامس (النقاط)
  };

  const handleFinanceClick = () => {
    if (onNavigate) onNavigate(7); // التبويب الثامن (الإدارة المالية)
  };
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalGrades: 0,
    averageGrade: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [classStats, setClassStats] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalPayments: 0,
    paidPayments: 0,
    unpaidPayments: 0,
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0
  });
  const [financeStats, setFinanceStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalTransactions: 0
  });
  const [settings, setSettings] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const students = studentsAPI.getAll();
    const classes = classesAPI.getAll();
    const subjects = subjectsAPI.getAll();
    const grades = gradesAPI.getAll();
    const payments = paymentsAPI.getAll();
    const appSettings = settingsAPI.get();

    // حساب الإحصائيات
    const totalGradesSum = grades.reduce((sum, grade) => sum + grade.score, 0);
    const averageGrade = grades.length > 0 ? (totalGradesSum / grades.length).toFixed(2) : 0;

    setStats({
      totalStudents: students.length,
      totalClasses: classes.length,
      totalSubjects: subjects.length,
      totalGrades: grades.length,
      averageGrade
    });

    // أحدث التلاميذ المسجلين
    const sortedStudents = students
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
    setRecentStudents(sortedStudents);

    // إحصائيات الأقسام
    const classStatsData = classes.map(cls => {
      const classStudents = students.filter(s => s.classId === cls.id);
      const percentage = cls.capacity > 0 ? (classStudents.length / cls.capacity) * 100 : 0;
      return {
        ...cls,
        currentStudents: classStudents.length,
        percentage: Math.min(percentage, 100)
      };
    });
    setClassStats(classStatsData);

    // إحصائيات التسديدات للشهر الحالي
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    const currentMonthPayments = payments.filter(payment =>
      payment.month === currentMonth && payment.year === currentYear
    );

    const paidPayments = currentMonthPayments.filter(payment => payment.isPaid);
    const unpaidPayments = currentMonthPayments.filter(payment => !payment.isPaid);

    const totalAmount = currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const paidAmount = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const unpaidAmount = unpaidPayments.reduce((sum, payment) => sum + payment.amount, 0);

    setPaymentStats({
      totalPayments: currentMonthPayments.length,
      paidPayments: paidPayments.length,
      unpaidPayments: unpaidPayments.length,
      totalAmount,
      paidAmount,
      unpaidAmount
    });

    // إحصائيات الإدارة المالية للشهر الحالي
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

    const totalIncome = financeTransactionsAPI.getTotalIncome(startOfMonth, endOfMonth);
    const totalExpenses = financeTransactionsAPI.getTotalExpenses(startOfMonth, endOfMonth);
    const netProfit = totalIncome - totalExpenses;
    const allTransactions = financeTransactionsAPI.getByDateRange(startOfMonth, endOfMonth);

    setFinanceStats({
      totalIncome,
      totalExpenses,
      netProfit,
      totalTransactions: allTransactions.length
    });

    setSettings(appSettings);
  };

  return (
    <Box>
      {/* ترحيب */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center">
          {settings.logo ? (
            <Box
              component="img"
              src={settings.logo}
              alt="لوجو الأكاديمية"
              sx={{
                width: 94,
                height: 94,
                mr: 4,
                objectFit: 'contain'
              }}
            />
          ) : (
            <SchoolIcon sx={{ fontSize: 48, mr: 14 }} />
          )}
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              مرحباً بك في {settings.academyName || 'أكاديمية نجم بلوس'}
            </Typography>
            <Typography variant="h6">
              السنة الدراسية: {settings.currentYear || '2024-2025'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* بطاقات الإحصائيات */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي التلاميذ"
            value={stats.totalStudents}
            icon={<PeopleIcon />}
            color="#1976d2"
            subtitle="تلميذ مسجل"
            onClick={handleStudentsClick}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="الأقسام"
            value={stats.totalClasses}
            icon={<ClassIcon />}
            color="#9c27b0"
            subtitle="قسم دراسي"
            onClick={handleClassesClick}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="المواد"
            value={stats.totalSubjects}
            icon={<SubjectIcon />}
            color="#f57c00"
            subtitle="مادة دراسية"
            onClick={handleSubjectsClick}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="المعدل العام"
            value={stats.averageGrade}
            icon={<TrendingUpIcon />}
            color="#388e3c"
            subtitle="من 10"
            onClick={handleGradesClick}
          />
        </Grid>
      </Grid>

      {/* ملخص التسديدات للشهر الحالي */}
      <Paper sx={{
        p: 3,
        mb: 3,
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)'
          : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
        borderRadius: 2,
        boxShadow: (theme) => theme.palette.mode === 'dark'
          ? '0 8px 32px rgba(0,0,0,0.3)'
          : '0 8px 32px rgba(25,118,210,0.2)'
      }}>
        <Box display="flex" alignItems="center" mb={2}>
          <PaymentIcon sx={{ fontSize: 32, mr: 2, color: 'white' }} />
          <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 600 }}>
            ملخص التسديدات - {getMonthName(new Date().getMonth() + 1)} {new Date().getFullYear()}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: 3,
              color: 'white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <MoneyIcon sx={{ fontSize: 48, mb: 2, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                  {paymentStats.totalPayments}
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                  إجمالي التسديدات
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  {paymentStats.totalAmount.toLocaleString()} دج
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)'
                : 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: 3,
              color: 'white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 48, mb: 2, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                  {paymentStats.paidPayments}
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                  تسديدات مدفوعة
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  {paymentStats.paidAmount.toLocaleString()} دج
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #b92b27 0%, #1565c0 100%)'
                : 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: 3,
              color: 'white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <CancelIcon sx={{ fontSize: 48, mb: 2, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                  {paymentStats.unpaidPayments}
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                  تسديدات معلقة
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  {paymentStats.unpaidAmount.toLocaleString()} دج
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: 3,
              color: (theme) => theme.palette.mode === 'dark' ? 'white' : '#333',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TrendingUpIcon sx={{
                  fontSize: 48,
                  mb: 2,
                  color: (theme) => theme.palette.mode === 'dark' ? 'white' : '#ff6f00',
                  opacity: 0.9
                }} />
                <Typography variant="h3" component="div" fontWeight="bold" sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? 'white' : '#333',
                  mb: 1
                }}>
                  {paymentStats.totalPayments > 0 ? Math.round((paymentStats.paidPayments / paymentStats.totalPayments) * 100) : 0}%
                </Typography>
                <Typography variant="h6" sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? 'white' : '#333',
                  mb: 1,
                  fontWeight: 500
                }}>
                  معدل التحصيل
                </Typography>
                <Typography variant="body1" sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
                  fontWeight: 500
                }}>
                  من إجمالي التسديدات
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* ملخص الإدارة المالية للشهر الحالي */}
      <Paper sx={{
        p: 3,
        mb: 3,
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 2,
        boxShadow: (theme) => theme.palette.mode === 'dark'
          ? '0 8px 32px rgba(0,0,0,0.3)'
          : '0 8px 32px rgba(102,126,234,0.2)'
      }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FinanceIcon sx={{ fontSize: 32, mr: 2, color: 'white' }} />
          <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 600 }}>
            ملخص الإدارة المالية - {getMonthName(new Date().getMonth() + 1)} {new Date().getFullYear()}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={handleFinanceClick}
              sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)'
                  : 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: 3,
                color: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #0f3c47 0%, #5a9367 100%)'
                    : 'linear-gradient(135deg, #4a9025 0%, #8fd19e 100%)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TrendingUpIcon sx={{ fontSize: 48, mb: 2, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                  {financeStats.totalIncome.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                  إجمالي الإيرادات
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  دج
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={handleFinanceClick}
              sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #b92b27 0%, #8e2de2 100%)'
                  : 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: 3,
                color: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #9a1f1c 0%, #7a25b8 100%)'
                    : 'linear-gradient(135deg, #e55a5a 0%, #e8941f 100%)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <ExpenseIcon sx={{ fontSize: 48, mb: 2, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                  {financeStats.totalExpenses.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                  إجمالي المصروفات
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  دج
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={handleFinanceClick}
              sx={{
                background: financeStats.netProfit >= 0
                  ? (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)'
                    : 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)'
                  : (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #d32f2f 0%, #f57c00 100%)'
                    : 'linear-gradient(135deg, #ff5722 0%, #ff9800 100%)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: 3,
                color: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                  background: financeStats.netProfit >= 0
                    ? (theme) => theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)'
                      : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                    : (theme) => theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #b71c1c 0%, #e65100 100%)'
                      : 'linear-gradient(135deg, #d84315 0%, #f57c00 100%)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <FinanceIcon sx={{ fontSize: 48, mb: 2, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                  {financeStats.netProfit.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                  صافي الربح
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  {financeStats.netProfit >= 0 ? 'ربح' : 'خسارة'} - دج
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={handleFinanceClick}
              sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)'
                  : 'linear-gradient(135deg, #9c27b0 0%, #e1bee7 100%)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: 3,
                color: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #38006b 0%, #6a1b9a 100%)'
                    : 'linear-gradient(135deg, #8e24aa 0%, #ce93d8 100%)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <MoneyIcon sx={{ fontSize: 48, mb: 2, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                  {financeStats.totalTransactions}
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                  إجمالي المعاملات
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  معاملة مالية
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* أحدث التلاميذ */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: 3,
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.1)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 0 }}>
              {/* رأس القسم */}
              <Box sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <PersonAddIcon sx={{ fontSize: 28, mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  أحدث التلاميذ المسجلين
                </Typography>
              </Box>

              {/* قائمة التلاميذ */}
              <List sx={{ p: 0 }}>
                {recentStudents.length > 0 ? (
                  recentStudents.map((student, index) => (
                    <React.Fragment key={student.id}>
                      <ListItem sx={{
                        py: 2,
                        px: 3,
                        '&:hover': {
                          backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.02)'
                        },
                        transition: 'background-color 0.2s ease'
                      }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: (theme) => theme.palette.mode === 'dark'
                                ? '#667eea'
                                : '#4facfe',
                              width: 48,
                              height: 48,
                              fontSize: '1.2rem',
                              fontWeight: 600,
                              border: '3px solid',
                              borderColor: (theme) => theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.05)'
                            }}
                            src={student.photo}
                          >
                            {!student.photo && (student.fullName?.charAt(0) || 'ت')}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{
                              fontWeight: 600,
                              color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                              mb: 0.5
                            }}>
                              {student.fullName}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {student.age} سنة
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <GroupsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {student.gender === 'male' ? 'ذكر' : 'أنثى'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <MenuBookIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" sx={{
                                  fontStyle: 'italic',
                                  fontSize: '0.75rem'
                                }}>
                                  {getClassName(student.classId)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentStudents.length - 1 && (
                        <Divider sx={{
                          mx: 3,
                          borderColor: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(0,0,0,0.08)'
                        }} />
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem sx={{ py: 4, textAlign: 'center' }}>
                    <ListItemText
                      primary={
                        <Box sx={{ textAlign: 'center' }}>
                          <PersonAddIcon sx={{
                            fontSize: 48,
                            color: 'text.secondary',
                            opacity: 0.5,
                            mb: 2
                          }} />
                          <Typography variant="body1" color="text.secondary">
                            لا توجد تلاميذ مسجلين بعد
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* إحصائيات الأقسام */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: 3,
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.1)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 0 }}>
              {/* رأس القسم */}
              <Box sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)'
                  : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <BarChartIcon sx={{ fontSize: 28, mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  إحصائيات الأقسام
                </Typography>
              </Box>

              {/* قائمة الأقسام */}
              <List sx={{ p: 0 }}>
                {classStats.length > 0 ? (
                  classStats.map((cls, index) => (
                    <React.Fragment key={cls.id}>
                      <ListItem sx={{
                        py: 3,
                        px: 3,
                        '&:hover': {
                          backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.02)'
                        },
                        transition: 'background-color 0.2s ease'
                      }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{
                                fontWeight: 600,
                                color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333'
                              }}>
                                {cls.name}
                              </Typography>
                              <Typography variant="body2" sx={{
                                fontWeight: 600,
                                color: cls.percentage > 80 ? '#f44336' : cls.percentage > 60 ? '#ff9800' : '#4caf50',
                                backgroundColor: cls.percentage > 80 ? 'rgba(244,67,54,0.1)' : cls.percentage > 60 ? 'rgba(255,152,0,0.1)' : 'rgba(76,175,80,0.1)',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.75rem'
                              }}>
                                {Math.round(cls.percentage)}%
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {cls.currentStudents} من {cls.capacity} تلميذ
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {cls.capacity - cls.currentStudents} مقعد متاح
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={cls.percentage}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'rgba(0,0,0,0.08)',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    background: cls.percentage > 80
                                      ? 'linear-gradient(90deg, #f44336 0%, #ff5722 100%)'
                                      : cls.percentage > 60
                                        ? 'linear-gradient(90deg, #ff9800 0%, #ffc107 100%)'
                                        : 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)'
                                  }
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < classStats.length - 1 && (
                        <Divider sx={{
                          mx: 3,
                          borderColor: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(0,0,0,0.08)'
                        }} />
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem sx={{ py: 4, textAlign: 'center' }}>
                    <ListItemText
                      primary={
                        <Box sx={{ textAlign: 'center' }}>
                          <BarChartIcon sx={{
                            fontSize: 48,
                            color: 'text.secondary',
                            opacity: 0.5,
                            mb: 2
                          }} />
                          <Typography variant="body1" color="text.secondary">
                            لا توجد أقسام مُنشأة بعد
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
