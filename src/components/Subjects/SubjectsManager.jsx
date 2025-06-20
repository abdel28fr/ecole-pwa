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
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Subject as SubjectIcon,
  Grade as GradeIcon,
  DragIndicator as DragIcon,
  SwapVert as ReorderIcon
} from '@mui/icons-material';

import { subjectsAPI, gradesAPI } from '../../data/storage';

const SubjectsManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    coefficient: ''
  });
  const [errors, setErrors] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const subjectsData = subjectsAPI.getAll(); // الآن يُرجع المواد مرتبة تلقائياً
    const gradesData = gradesAPI.getAll();

    setSubjects(subjectsData);
    setGrades(gradesData);
  };

  const handleOpenDialog = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        coefficient: subject.coefficient || ''
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        code: '',
        coefficient: ''
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      coefficient: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المادة مطلوب';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'رمز المادة مطلوب';
    } else if (formData.code.length > 10) {
      newErrors.code = 'رمز المادة يجب أن يكون أقل من 10 أحرف';
    }

    if (!formData.coefficient || formData.coefficient < 1 || formData.coefficient > 5) {
      newErrors.coefficient = 'المعامل يجب أن يكون بين 1 و 5';
    }

    // التحقق من عدم تكرار رمز المادة
    const existingSubject = subjects.find(s => 
      s.code.toLowerCase() === formData.code.toLowerCase() && 
      (!editingSubject || s.id !== editingSubject.id)
    );
    if (existingSubject) {
      newErrors.code = 'رمز المادة موجود مسبقاً';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    try {
      const subjectData = {
        ...formData,
        coefficient: parseInt(formData.coefficient),
        code: formData.code.toUpperCase()
      };

      if (editingSubject) {
        subjectsAPI.update(editingSubject.id, subjectData);
      } else {
        subjectsAPI.add(subjectData);
      }
      loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('خطأ في حفظ المادة:', error);
    }
  };

  const handleDelete = (subjectId) => {
    // التحقق من وجود نقاط للمادة
    const subjectGrades = grades.filter(g => g.subjectId === subjectId);
    
    if (subjectGrades.length > 0) {
      alert(`لا يمكن حذف هذه المادة لأنها تحتوي على ${subjectGrades.length} نقطة. يرجى حذف النقاط أولاً.`);
      return;
    }

    if (window.confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      try {
        subjectsAPI.delete(subjectId);
        loadData();
      } catch (error) {
        console.error('خطأ في حذف المادة:', error);
      }
    }
  };

  const getSubjectStats = (subjectId) => {
    const subjectGrades = grades.filter(g => g.subjectId === subjectId);
    const totalGrades = subjectGrades.length;
    const averageGrade = totalGrades > 0 
      ? (subjectGrades.reduce((sum, grade) => sum + grade.score, 0) / totalGrades).toFixed(2)
      : 0;

    return {
      totalGrades,
      averageGrade
    };
  };

  const getCoefficientColor = (coefficient) => {
    if (coefficient >= 3) return 'error';
    if (coefficient === 2) return 'warning';
    return 'primary';
  };

  const getSubjectIcon = (code) => {
    const colors = ['#1976d2', '#9c27b0', '#f57c00', '#388e3c', '#d32f2f', '#7b1fa2'];
    const index = code.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // دوال السحب والإفلات
  const handleDragStart = (e, subject, index) => {
    setDraggedItem({ subject, index });
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverItem(null);
    setIsDragging(false);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(index);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.index === dropIndex) {
      return;
    }

    const newSubjects = [...subjects];
    const draggedSubject = newSubjects[draggedItem.index];

    // إزالة العنصر من موقعه الأصلي
    newSubjects.splice(draggedItem.index, 1);

    // إدراج العنصر في الموقع الجديد
    newSubjects.splice(dropIndex, 0, draggedSubject);

    // تحديث ترتيب المواد مع إضافة خاصية order
    const updatedSubjects = newSubjects.map((subject, index) => ({
      ...subject,
      order: index
    }));

    setSubjects(updatedSubjects);

    // حفظ الترتيب الجديد
    updatedSubjects.forEach(subject => {
      subjectsAPI.update(subject.id, subject);
    });

    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <Box>
      {/* العنوان والأزرار */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          إدارة المواد الدراسية
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          إضافة مادة جديدة
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
                    {subjects.length}
                  </Typography>
                  <Typography variant="h6">
                    إجمالي المواد
                  </Typography>
                </Box>
                <SubjectIcon sx={{ fontSize: 48 }} />
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
                    {grades.length}
                  </Typography>
                  <Typography variant="h6">
                    إجمالي النقاط
                  </Typography>
                </Box>
                <GradeIcon sx={{ fontSize: 48 }} />
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
                    {subjects.reduce((sum, subject) => sum + subject.coefficient, 0)}
                  </Typography>
                  <Typography variant="h6">
                    مجموع المعاملات
                  </Typography>
                </Box>
                <SubjectIcon sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* جدول المواد */}
      <Card sx={{ mb: 2, p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <ReorderIcon />
          <Typography variant="h6">
            يمكنك ترتيب المواد عن طريق السحب والإفلات
          </Typography>
        </Box>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="60px">ترتيب</TableCell>
              <TableCell>الرمز</TableCell>
              <TableCell>اسم المادة</TableCell>
              <TableCell>المعامل</TableCell>
              <TableCell>عدد النقاط</TableCell>
              <TableCell>المعدل</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.length > 0 ? (
              subjects.map((subject, index) => {
                const stats = getSubjectStats(subject.id);
                const isBeingDragged = draggedItem?.index === index;
                const isDropTarget = dragOverItem === index;

                return (
                  <TableRow
                    key={subject.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, subject, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    sx={{
                      cursor: 'move',
                      opacity: isBeingDragged ? 0.5 : 1,
                      backgroundColor: isDropTarget ? 'action.hover' : 'inherit',
                      border: isDropTarget ? '2px dashed #1976d2' : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: isDragging ? 'action.hover' : 'action.selected',
                        transform: isDragging ? 'none' : 'scale(1.01)',
                        boxShadow: isDragging ? 'none' : '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DragIcon
                          sx={{
                            color: 'text.secondary',
                            cursor: 'grab',
                            '&:active': { cursor: 'grabbing' }
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          #{index + 1}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Avatar
                        sx={{
                          bgcolor: getSubjectIcon(subject.code),
                          width: 40,
                          height: 40,
                          fontSize: '0.875rem'
                        }}
                      >
                        {subject.code}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {subject.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`معامل ${subject.coefficient}`}
                        color={getCoefficientColor(subject.coefficient)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {stats.totalGrades} نقطة
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body1" 
                        fontWeight="bold"
                        color={stats.averageGrade >= 5 ? 'success.main' : 'error.main'}
                      >
                        {stats.averageGrade}/10
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(subject)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(subject.id)}
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
                    لا توجد مواد دراسية مُنشأة بعد. ابدأ بإضافة مادة جديدة.
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* نافذة إضافة/تعديل المادة */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSubject ? 'تعديل المادة' : 'إضافة مادة جديدة'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="اسم المادة"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="مثال: الرياضيات"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="رمز المادة"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                error={!!errors.code}
                helperText={errors.code}
                placeholder="مثال: MATH"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="المعامل"
                type="number"
                value={formData.coefficient}
                onChange={(e) => setFormData({ ...formData, coefficient: e.target.value })}
                error={!!errors.coefficient}
                helperText={errors.coefficient}
                inputProps={{ min: 1, max: 5 }}
                placeholder="من 1 إلى 5"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSubject ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectsManager;
