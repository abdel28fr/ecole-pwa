import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Class as ClassIcon
} from '@mui/icons-material';

import { classesAPI, studentsAPI } from '../../data/storage';

const ClassesManager = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    capacity: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const classesData = classesAPI.getAll();
    const studentsData = studentsAPI.getAll();
    setClasses(classesData);
    setStudents(studentsData);
  };

  const handleOpenDialog = (classItem = null) => {
    if (classItem) {
      setEditingClass(classItem);
      setFormData({
        name: classItem.name || '',
        level: classItem.level || '',
        capacity: classItem.capacity || ''
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        level: '',
        capacity: ''
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClass(null);
    setFormData({
      name: '',
      level: '',
      capacity: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم القسم مطلوب';
    }

    if (!formData.level.trim()) {
      newErrors.level = 'المستوى مطلوب';
    }

    if (!formData.capacity || formData.capacity < 1 || formData.capacity > 50) {
      newErrors.capacity = 'السعة يجب أن تكون بين 1 و 50 تلميذ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    try {
      const classData = {
        ...formData,
        capacity: parseInt(formData.capacity)
      };

      if (editingClass) {
        classesAPI.update(editingClass.id, classData);
      } else {
        classesAPI.add(classData);
      }
      loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('خطأ في حفظ القسم:', error);
    }
  };

  const handleDelete = (classId) => {
    // التحقق من وجود تلاميذ في القسم
    const classStudents = students.filter(s => s.classId === classId);
    
    if (classStudents.length > 0) {
      alert(`لا يمكن حذف هذا القسم لأنه يحتوي على ${classStudents.length} تلميذ. يرجى نقل التلاميذ إلى قسم آخر أولاً.`);
      return;
    }

    if (window.confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      try {
        classesAPI.delete(classId);
        loadData();
      } catch (error) {
        console.error('خطأ في حذف القسم:', error);
      }
    }
  };

  const getClassStats = (classId) => {
    const classStudents = students.filter(s => s.classId === classId);
    const classData = classes.find(c => c.id === classId);
    const capacity = classData ? classData.capacity : 0;
    const percentage = capacity > 0 ? (classStudents.length / capacity) * 100 : 0;

    return {
      currentStudents: classStudents.length,
      capacity,
      percentage: Math.min(percentage, 100),
      maleStudents: classStudents.filter(s => s.gender === 'male').length,
      femaleStudents: classStudents.filter(s => s.gender === 'female').length
    };
  };

  return (
    <Box>
      {/* العنوان والأزرار */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          إدارة الأقسام
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          إضافة قسم جديد
        </Button>
      </Box>

      {/* إحصائيات سريعة */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {classes.length}
                  </Typography>
                  <Typography variant="h6">
                    إجمالي الأقسام
                  </Typography>
                </Box>
                <ClassIcon sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {students.length}
                  </Typography>
                  <Typography variant="h6">
                    إجمالي التلاميذ
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {classes.reduce((sum, cls) => sum + cls.capacity, 0)}
                  </Typography>
                  <Typography variant="h6">
                    إجمالي السعة
                  </Typography>
                </Box>
                <ClassIcon sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* جدول الأقسام */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>اسم القسم</TableCell>
              <TableCell>المستوى</TableCell>
              <TableCell>عدد التلاميذ</TableCell>
              <TableCell>السعة</TableCell>
              <TableCell>نسبة الامتلاء</TableCell>
              <TableCell>التوزيع</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.length > 0 ? (
              classes.map((classItem) => {
                const stats = getClassStats(classItem.id);
                return (
                  <TableRow key={classItem.id}>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {classItem.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={classItem.level} color="primary" size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {stats.currentStudents} تلميذ
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {stats.capacity} تلميذ
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%' }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">
                            {stats.percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={stats.percentage}
                          color={
                            stats.percentage > 90 ? 'error' :
                            stats.percentage > 75 ? 'warning' : 'primary'
                          }
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" color="primary">
                          ذكور: {stats.maleStudents}
                        </Typography>
                        <Typography variant="body2" color="secondary">
                          إناث: {stats.femaleStudents}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(classItem)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(classItem.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">
                    لا توجد أقسام مُنشأة بعد. ابدأ بإضافة قسم جديد.
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* نافذة إضافة/تعديل القسم */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingClass ? 'تعديل القسم' : 'إضافة قسم جديد'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="اسم القسم"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="مثال: السنة الأولى ابتدائي"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="المستوى"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                error={!!errors.level}
                helperText={errors.level}
                placeholder="مثال: ابتدائي، متوسط، ثانوي"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="السعة القصوى"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                error={!!errors.capacity}
                helperText={errors.capacity}
                inputProps={{ min: 1, max: 50 }}
                placeholder="عدد التلاميذ الأقصى في القسم"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClass ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassesManager;
