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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Grid,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon
} from '@mui/icons-material';

import { studentsAPI, classesAPI } from '../../data/storage';

const StudentsManager = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    classId: '',
    phone: '',
    address: '',
    photo: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  // دالة لمعالجة رفع الصورة
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }

      // التحقق من حجم الملف (أقل من 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      // تحويل الصورة إلى Base64
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, photo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة لحذف الصورة
  const handleRemovePhoto = () => {
    setFormData({ ...formData, photo: '' });
  };

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedClass]);

  const loadData = () => {
    const studentsData = studentsAPI.getAll();
    const classesData = classesAPI.getAll();
    setStudents(studentsData);
    setClasses(classesData);
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedClass) {
      filtered = filtered.filter(student => student.classId === parseInt(selectedClass));
    }

    setFilteredStudents(filtered);
  };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        fullName: student.fullName || '',
        age: student.age || '',
        gender: student.gender || '',
        classId: student.classId || '',
        phone: student.phone || '',
        address: student.address || '',
        photo: student.photo || ''
      });
    } else {
      setEditingStudent(null);
      setFormData({
        fullName: '',
        age: '',
        gender: '',
        classId: '',
        phone: '',
        address: '',
        photo: ''
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
    setFormData({
      fullName: '',
      age: '',
      gender: '',
      classId: '',
      phone: '',
      address: '',
      photo: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }

    if (!formData.age || formData.age < 3 || formData.age > 18) {
      newErrors.age = 'العمر يجب أن يكون بين 3 و 18 سنة';
    }

    if (!formData.gender) {
      newErrors.gender = 'الجنس مطلوب';
    }

    if (!formData.classId) {
      newErrors.classId = 'القسم مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    try {
      if (editingStudent) {
        studentsAPI.update(editingStudent.id, formData);
      } else {
        studentsAPI.add(formData);
      }
      loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('خطأ في حفظ التلميذ:', error);
    }
  };

  const handleDelete = (studentId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التلميذ؟')) {
      try {
        studentsAPI.delete(studentId);
        loadData();
      } catch (error) {
        console.error('خطأ في حذف التلميذ:', error);
      }
    }
  };

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'غير محدد';
  };

  return (
    <Box>
      {/* العنوان والأزرار */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          إدارة التلاميذ
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          إضافة تلميذ جديد
        </Button>
      </Box>

      {/* البحث والفلترة */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="البحث بالاسم"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>فلترة بالقسم</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="فلترة بالقسم"
                >
                  <MenuItem value="">جميع الأقسام</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                إجمالي: {filteredStudents.length} تلميذ
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* جدول التلاميذ */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الصورة</TableCell>
              <TableCell>الاسم الكامل</TableCell>
              <TableCell>العمر</TableCell>
              <TableCell>الجنس</TableCell>
              <TableCell>القسم</TableCell>
              <TableCell>الهاتف</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Avatar
                      sx={{ bgcolor: '#1976d2', width: 50, height: 50 }}
                      src={student.photo}
                    >
                      {!student.photo && (student.fullName?.charAt(0) || 'ت')}
                    </Avatar>
                  </TableCell>
                  <TableCell>{student.fullName}</TableCell>
                  <TableCell>{student.age} سنة</TableCell>
                  <TableCell>
                    <Chip
                      label={student.gender === 'male' ? 'ذكر' : 'أنثى'}
                      color={student.gender === 'male' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{getClassName(student.classId)}</TableCell>
                  <TableCell>{student.phone || 'غير محدد'}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(student)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(student.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">
                    لا توجد تلاميذ مطابقين لمعايير البحث
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* نافذة إضافة/تعديل التلميذ */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStudent ? 'تعديل التلميذ' : 'إضافة تلميذ جديد'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* قسم الصورة */}
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  صورة التلميذ
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={formData.photo}
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: '#1976d2',
                      fontSize: '2rem'
                    }}
                  >
                    {!formData.photo && (formData.fullName?.charAt(0) || <PhotoCameraIcon />)}
                  </Avatar>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCameraIcon />}
                      size="small"
                    >
                      {formData.photo ? 'تغيير الصورة' : 'إضافة صورة'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </Button>

                    {formData.photo && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleRemovePhoto}
                        size="small"
                      >
                        حذف الصورة
                      </Button>
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    الحد الأقصى: 5 ميجابايت - الصيغ المدعومة: JPG, PNG, GIF
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="الاسم الكامل"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                error={!!errors.fullName}
                helperText={errors.fullName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="العمر"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                error={!!errors.age}
                helperText={errors.age}
                inputProps={{ min: 3, max: 18 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel>الجنس</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  label="الجنس"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        width: 100,
                      },
                    },
                    variant: "menu",
                  }}
                >
                  <MenuItem value="male">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                      <PersonIcon sx={{ color: '#1976d2' }} />
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        ذكر
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="female">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                      <PersonIcon sx={{ color: '#e91e63' }} />
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        أنثى
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
                {errors.gender && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, mx: 2 }}>
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.classId}>
                <InputLabel>القسم</InputLabel>
                <Select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: parseInt(e.target.value) })}
                  label="القسم"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 400,
                        width: 250,
                      },
                    },
                    variant: "menu",
                  }}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', py: 1, width: '100%' }}>
                        <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1976d2' }}>
                          {cls.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                          المستوى: {cls.level} • السعة: {cls.capacity} تلميذ
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.classId && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, mx: 2 }}>
                    {errors.classId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="رقم الهاتف"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="العنوان"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStudent ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentsManager;
