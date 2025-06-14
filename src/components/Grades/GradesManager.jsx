import React, { useState, useEffect, useCallback } from 'react';
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
  Grid,
  Alert,
  Chip,
  Avatar,
  Slider,
  Divider,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

import { gradesAPI, studentsAPI, subjectsAPI, classesAPI } from '../../data/storage';

const GradesManager = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    score: 5,
    examType: 'فرض',
    examDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // حالة ملاحظات التلاميذ
  const [studentNotes, setStudentNotes] = useState({});
  const [errors, setErrors] = useState({});

  // حالات جديدة للنظام المحسّن
  const [currentTab, setCurrentTab] = useState(0);
  const [bulkGradeMode, setBulkGradeMode] = useState(false);
  const [selectedStudentForBulk, setSelectedStudentForBulk] = useState('');
  const [bulkGrades, setBulkGrades] = useState({});
  const [bulkExamType, setBulkExamType] = useState('فرض');
  const [bulkExamDate, setBulkExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkNotes, setBulkNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // useEffect لتحديث الفلترة عند تحميل البيانات
  useEffect(() => {
    if (grades.length > 0) {
      console.log('Data loaded, applying initial filter');
      setFilteredGrades([...grades]);
    }
  }, [grades.length]);

  // useEffect منفصل لمراقبة تغييرات الفلاتر
  useEffect(() => {
    console.log('Filter values changed:', { selectedClass, selectedSubject, selectedStudent });
  }, [selectedClass, selectedSubject, selectedStudent]);

  // useEffect لإعادة تعيين التلميذ عند تغيير القسم
  useEffect(() => {
    if (selectedClass && selectedStudent) {
      // التحقق من أن التلميذ المختار ينتمي للقسم الجديد
      const student = students.find(s => s.id === parseInt(selectedStudent));
      if (student && student.classId !== parseInt(selectedClass)) {
        console.log('Student does not belong to selected class, resetting student filter');
        setSelectedStudent('');
      }
    }
  }, [selectedClass, selectedStudent, students]);

  // useEffect لإفراغ القائمة فوراً عند تغيير أي فلتر
  useEffect(() => {
    console.log('Filter changed, clearing results immediately');
    setFilteredGrades([]); // إفراغ فوري للقائمة

    // تطبيق الفلترة بعد تأخير قصير لإظهار التحديث
    const timeoutId = setTimeout(() => {
      filterGrades();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [selectedClass, selectedSubject, selectedStudent]);

  const loadData = () => {
    const gradesData = gradesAPI.getAll();
    const studentsData = studentsAPI.getAll();
    const subjectsData = subjectsAPI.getAll();
    const classesData = classesAPI.getAll();

    setGrades(gradesData);
    setStudents(studentsData);
    setSubjects(subjectsData);
    setClasses(classesData);

    // تحميل ملاحظات التلاميذ
    const savedData = localStorage.getItem('academyData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setStudentNotes(data.studentNotes || {});
    }
  };

  const filterGrades = useCallback(() => {
    console.log('=== Starting filterGrades ===');
    console.log('Filter values:', {
      selectedClass,
      selectedSubject,
      selectedStudent,
      totalGrades: grades.length
    });

    // البدء بجميع النقاط
    let filtered = [...grades];
    console.log('Starting with all grades:', filtered.length);

    // فلترة بالتلميذ أولاً (أولوية عالية)
    if (selectedStudent && selectedStudent !== '') {
      const studentId = parseInt(selectedStudent);
      console.log('Applying student filter for ID:', studentId);
      filtered = filtered.filter(g => {
        const gradeStudentId = parseInt(g.studentId);
        return gradeStudentId === studentId;
      });
      console.log('After student filter:', filtered.length);
    } else if (selectedClass && selectedClass !== '') {
      // فلترة بالقسم فقط إذا لم يتم اختيار تلميذ محدد
      const classId = parseInt(selectedClass);
      console.log('Applying class filter for ID:', classId);
      const classStudents = students.filter(s => parseInt(s.classId) === classId);
      const studentIds = classStudents.map(s => parseInt(s.id));
      console.log('Students in class:', studentIds);
      filtered = filtered.filter(g => studentIds.includes(parseInt(g.studentId)));
      console.log('After class filter:', filtered.length);
    }

    // فلترة بالمادة
    if (selectedSubject && selectedSubject !== '') {
      const subjectId = parseInt(selectedSubject);
      console.log('Applying subject filter for ID:', subjectId);
      filtered = filtered.filter(g => parseInt(g.subjectId) === subjectId);
      console.log('After subject filter:', filtered.length);
    }

    console.log('=== Final result ===');
    console.log('Filtered grades count:', filtered.length);
    console.log('Filtered grade IDs:', filtered.map(g => g.id));

    // تحديث الحالة
    setFilteredGrades([...filtered]); // نسخة جديدة لضمان التحديث
  }, [grades, selectedClass, selectedSubject, selectedStudent, students]);

  // useEffect لتطبيق الفلترة عند تغيير القيم
  useEffect(() => {
    console.log('useEffect triggered - applying filters');
    filterGrades();
  }, [filterGrades]);

  // دالة لإعادة تعيين الفلاتر
  const resetFilters = () => {
    console.log('=== Resetting all filters ===');
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedStudent('');
    // إعادة تعيين فورية للنقاط المفلترة
    setFilteredGrades([...grades]);
    console.log('Filters reset, showing all grades:', grades.length);
  };

  const handleOpenDialog = (grade) => {
    setEditingGrade(grade);
    setFormData({
      studentId: grade.studentId || '',
      subjectId: grade.subjectId || '',
      score: grade.score || 5,
      examType: grade.examType || 'فرض',
      examDate: grade.examDate || new Date().toISOString().split('T')[0],
      notes: grade.notes || ''
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGrade(null);
    setFormData({
      studentId: '',
      subjectId: '',
      score: 5,
      examType: 'فرض',
      examDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId) {
      newErrors.studentId = 'التلميذ مطلوب';
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'المادة مطلوبة';
    }

    if (formData.score < 0 || formData.score > 10) {
      newErrors.score = 'النقطة يجب أن تكون بين 0 و 10';
    }

    if (!formData.examType) {
      newErrors.examType = 'نوع الامتحان مطلوب';
    }

    if (!formData.examDate) {
      newErrors.examDate = 'تاريخ الامتحان مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    try {
      const gradeData = {
        ...formData,
        studentId: parseInt(formData.studentId),
        subjectId: parseInt(formData.subjectId),
        score: parseFloat(formData.score)
      };

      if (editingGrade) {
        gradesAPI.update(editingGrade.id, gradeData);
      } else {
        gradesAPI.add(gradeData);
      }

      loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('خطأ في حفظ النقطة:', error);
    }
  };

  const handleDelete = (gradeId) => {
    const grade = grades.find(g => g.id === gradeId);
    if (!grade) return;

    const student = students.find(s => s.id === grade.studentId);
    const subject = subjects.find(s => s.id === grade.subjectId);

    const confirmMessage = `هل أنت متأكد من حذف هذه النقطة؟\n\n` +
      `التلميذ: ${student?.fullName || 'غير محدد'}\n` +
      `المادة: ${subject?.name || 'غير محدد'}\n` +
      `النقطة: ${grade.score}/10\n` +
      `نوع الامتحان: ${grade.examType}\n` +
      `التاريخ: ${new Date(grade.examDate).toLocaleDateString('ar-DZ')}`;

    if (window.confirm(confirmMessage)) {
      try {
        gradesAPI.delete(gradeId);
        loadData();

        // إظهار رسالة نجاح
        setTimeout(() => {
          alert('تم حذف النقطة بنجاح!');
        }, 100);
      } catch (error) {
        console.error('خطأ في حذف النقطة:', error);
        alert('حدث خطأ في حذف النقطة');
      }
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.fullName : 'غير محدد';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'غير محدد';
  };

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'غير محدد';
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 5) return 'warning';
    return 'error';
  };

  const getScoreIcon = (score) => {
    const colors = {
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336'
    };
    const color = getScoreColor(score);
    return colors[color];
  };

  const marks = [
    { value: 0, label: '0' },
    { value: 2.5, label: '2.5' },
    { value: 5, label: '5' },
    { value: 7.5, label: '7.5' },
    { value: 10, label: '10' }
  ];

  // دوال النظام المحسّن
  const handleOpenBulkGradeMode = () => {
    setBulkGradeMode(true);
    setCurrentTab(1);
    // تهيئة النقاط لجميع المواد
    const initialGrades = {};
    subjects.forEach(subject => {
      initialGrades[subject.id] = 5;
    });
    setBulkGrades(initialGrades);

    // تحقق من وجود مواد
    if (subjects.length === 0) {
      alert('لا توجد مواد في النظام. يرجى إضافة مواد أولاً.');
    }
  };

  const handleCloseBulkGradeMode = () => {
    setBulkGradeMode(false);
    setCurrentTab(0);
    setSelectedStudentForBulk('');
    setBulkGrades({});
    setBulkExamType('فرض');
    setBulkExamDate(new Date().toISOString().split('T')[0]);
    setBulkNotes('');
  };

  const handleBulkGradeChange = (subjectId, score) => {
    setBulkGrades(prev => ({
      ...prev,
      [subjectId]: score
    }));
  };

  const handleSaveBulkGrades = () => {
    if (!selectedStudentForBulk) {
      alert('يرجى اختيار تلميذ');
      return;
    }

    try {
      // حفظ نقطة لكل مادة
      Object.entries(bulkGrades).forEach(([subjectId, score]) => {
        const gradeData = {
          studentId: parseInt(selectedStudentForBulk),
          subjectId: parseInt(subjectId),
          score: parseFloat(score),
          examType: bulkExamType,
          examDate: bulkExamDate,
          notes: bulkNotes
        };
        gradesAPI.add(gradeData);
      });

      // حفظ ملاحظة التلميذ
      saveStudentNotes();

      loadData();
      handleCloseBulkGradeMode();
      alert('تم حفظ جميع النقاط والملاحظات بنجاح!');
    } catch (error) {
      console.error('خطأ في حفظ النقاط:', error);
      alert('حدث خطأ في حفظ النقاط');
    }
  };

  const saveStudentNotes = () => {
    const savedData = localStorage.getItem('academyData');
    let data = {};
    if (savedData) {
      data = JSON.parse(savedData);
    }
    data.studentNotes = studentNotes;
    localStorage.setItem('academyData', JSON.stringify(data));
  };

  const getStudentSubjects = (studentId) => {
    const student = students.find(s => s.id === parseInt(studentId));
    if (!student) return [];

    // إرجاع جميع المواد المتاحة إذا لم تكن هناك مواد محددة للقسم
    // يمكن تخصيص هذا لاحقاً حسب احتياجات كل قسم
    return subjects;
  };

  return (
    <Box>
      {/* العنوان والأزرار */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          إدارة النقاط
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={handleOpenBulkGradeMode}
            size="large"
          >
            إدخال نقاط تلميذ
          </Button>

        </Stack>
      </Box>

      {/* التبويبات */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="عرض النقاط"
            icon={<GradeIcon />}
            iconPosition="start"
          />
          <Tab
            label="إدخال نقاط تلميذ"
            icon={<AssignmentIcon />}
            iconPosition="start"
            disabled={!bulkGradeMode}
          />
        </Tabs>
      </Card>

      {/* محتوى التبويبات */}
      {currentTab === 0 && (
        <>
          {/* الفلترة */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                فلترة النقاط
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>القسم</InputLabel>
                    <Select
                      value={selectedClass}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        console.log('Class filter changed to:', newValue);
                        setSelectedClass(newValue);
                        // إعادة تعيين التلميذ المختار عند تغيير القسم
                        setSelectedStudent('');
                      }}
                      label="القسم"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 400,
                            width: 300,
                          },
                        },
                        variant: "menu",
                      }}
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
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>المادة</InputLabel>
                    <Select
                      value={selectedSubject}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        console.log('Subject filter changed to:', newValue);
                        setSelectedSubject(newValue);
                      }}
                      label="المادة"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 400,
                            width: 300,
                          },
                        },
                        variant: "menu",
                      }}
                    >
                      <MenuItem value="">جميع المواد</MenuItem>
                      {subjects.map((subject) => (
                        <MenuItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>
                      التلميذ ({students.filter(student => {
                        if (!selectedClass || selectedClass === '') return true;
                        return student.classId === parseInt(selectedClass);
                      }).length})
                    </InputLabel>
                    <Select
                      value={selectedStudent}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        console.log('Student filter changed to:', newValue);
                        setSelectedStudent(newValue);
                      }}
                      label="التلميذ"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 400, // ارتفاع أكبر للقائمة
                            width: 350, // عرض أكبر للقائمة
                          },
                        },
                        // إزالة الحد الأقصى لعدد العناصر
                        variant: "menu",
                      }}
                    >
                      <MenuItem value="">جميع التلاميذ</MenuItem>
                      {students
                        .filter(student => {
                          // إذا لم يتم اختيار قسم، عرض جميع التلاميذ
                          if (!selectedClass || selectedClass === '') {
                            return true;
                          }
                          // إذا تم اختيار قسم، عرض تلاميذ هذا القسم فقط
                          return student.classId === parseInt(selectedClass);
                        })
                        .map((student) => (
                        <MenuItem key={student.id} value={student.id}>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              sx={{ bgcolor: '#1976d2', mr: 1, width: 24, height: 24 }}
                              src={student.photo}
                            >
                              {!student.photo && student.fullName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {student.fullName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getClassName(student.classId)}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    variant="outlined"
                    onClick={resetFilters}
                    fullWidth
                    startIcon={<CancelIcon />}
                  >
                    إعادة تعيين
                  </Button>
                </Grid>
                <Grid item xs={12} md={1}>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    إجمالي: {filteredGrades.length} نقطة
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {currentTab === 1 && bulkGradeMode && (
        <>
          {/* إدخال نقاط تلميذ */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                إدخال نقاط جميع المواد لتلميذ واحد
              </Typography>

              {/* اختيار التلميذ */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>اختر التلميذ</InputLabel>
                    <Select
                      value={selectedStudentForBulk}
                      onChange={(e) => {
                        setSelectedStudentForBulk(e.target.value);
                        // إعادة تهيئة النقاط عند تغيير التلميذ
                        if (e.target.value) {
                          const studentSubjects = getStudentSubjects(e.target.value);
                          const initialGrades = {};
                          studentSubjects.forEach(subject => {
                            initialGrades[subject.id] = 5;
                          });
                          setBulkGrades(initialGrades);
                          console.log('Student subjects:', studentSubjects);
                          console.log('Initial grades:', initialGrades);
                        } else {
                          setBulkGrades({});
                        }
                      }}
                      label="اختر التلميذ"
                    >
                      {students.map((student) => (
                        <MenuItem key={student.id} value={student.id}>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              sx={{ bgcolor: '#1976d2', mr: 2, width: 32, height: 32 }}
                              src={student.photo}
                            >
                              {!student.photo && student.fullName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {student.fullName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getClassName(student.classId)}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {selectedStudentForBulk && (
                <>
                  <Divider sx={{ my: 2 }} />

                  {/* معلومات الامتحان */}
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    معلومات الامتحان
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>نوع الامتحان</InputLabel>
                        <Select
                          value={bulkExamType}
                          onChange={(e) => setBulkExamType(e.target.value)}
                          label="نوع الامتحان"
                        >
                          <MenuItem value="فرض">فرض</MenuItem>
                          <MenuItem value="اختبار">اختبار</MenuItem>
                          <MenuItem value="امتحان">امتحان</MenuItem>
                          <MenuItem value="تقييم مستمر">تقييم مستمر</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="تاريخ الامتحان"
                        type="date"
                        value={bulkExamDate}
                        onChange={(e) => setBulkExamDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="ملاحظات عامة"
                        value={bulkNotes}
                        onChange={(e) => setBulkNotes(e.target.value)}
                        placeholder="ملاحظات تطبق على جميع المواد..."
                      />
                    </Grid>
                  </Grid>

                  {/* ملاحظة خاصة بالتلميذ */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="ملاحظة خاصة بالتلميذ"
                        multiline
                        rows={3}
                        value={studentNotes[selectedStudentForBulk] || ''}
                        onChange={(e) => setStudentNotes(prev => ({
                          ...prev,
                          [selectedStudentForBulk]: e.target.value
                        }))}
                        placeholder="ملاحظة خاصة بهذا التلميذ تظهر في كشف النقاط..."
                        helperText="هذه الملاحظة ستظهر في كشف النقاط الخاص بهذا التلميذ"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* نقاط المواد */}
                  <Typography variant="h6" gutterBottom>
                    <SubjectIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    نقاط المواد ({getStudentSubjects(selectedStudentForBulk).length} مادة)
                  </Typography>

                  <Grid container spacing={3}>
                    {getStudentSubjects(selectedStudentForBulk).length > 0 ? (
                      getStudentSubjects(selectedStudentForBulk).map((subject) => (
                      <Grid item xs={12} md={6} lg={4} key={subject.id}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {subject.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                            معامل: {subject.coefficient}
                          </Typography>

                          <Typography gutterBottom>
                            النقطة: {bulkGrades[subject.id] || 5}/10
                          </Typography>
                          <Slider
                            value={bulkGrades[subject.id] || 5}
                            onChange={(_, newValue) => handleBulkGradeChange(subject.id, newValue)}
                            step={0.25}
                            marks={marks}
                            min={0}
                            max={10}
                            valueLabelDisplay="auto"
                            color={getScoreColor(bulkGrades[subject.id] || 5)}
                          />

                          <Chip
                            label={`${bulkGrades[subject.id] || 5}/10`}
                            color={getScoreColor(bulkGrades[subject.id] || 5)}
                            sx={{ mt: 1, fontWeight: 'bold' }}
                          />
                        </Card>
                      </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Alert severity="info">
                          لا توجد مواد متاحة لهذا التلميذ. يرجى التأكد من إضافة مواد في النظام.
                        </Alert>
                      </Grid>
                    )}
                  </Grid>

                  {/* أزرار الحفظ */}
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCloseBulkGradeMode}
                      size="large"
                    >
                      إلغاء
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveBulkGrades}
                      size="large"
                      disabled={!selectedStudentForBulk || Object.keys(bulkGrades).length === 0}
                    >
                      حفظ جميع النقاط
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* عرض نقاط التلميذ المختار بشكل جميل */}
      {currentTab === 0 && selectedStudent && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {(() => {
              const student = students.find(s => s.id === parseInt(selectedStudent));
              const studentGrades = filteredGrades.filter(g => g.studentId === parseInt(selectedStudent));

              if (!student || studentGrades.length === 0) {
                return (
                  <Alert severity="info">
                    لا توجد نقاط لهذا التلميذ
                  </Alert>
                );
              }

              // تجميع النقاط حسب المادة
              const subjectGrades = {};
              studentGrades.forEach(grade => {
                if (!subjectGrades[grade.subjectId]) {
                  subjectGrades[grade.subjectId] = [];
                }
                subjectGrades[grade.subjectId].push(grade);
              });

              // حساب معدل كل مادة
              const subjectAverages = Object.keys(subjectGrades).map(subjectId => {
                const grades = subjectGrades[subjectId];
                const average = grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length;
                const subject = subjects.find(s => s.id === parseInt(subjectId));
                return {
                  subject,
                  grades,
                  average: parseFloat(average.toFixed(2))
                };
              });

              // حساب المعدل العام
              const totalWeightedScore = subjectAverages.reduce((sum, item) =>
                sum + (item.average * item.subject.coefficient), 0);
              const totalCoefficients = subjectAverages.reduce((sum, item) =>
                sum + item.subject.coefficient, 0);
              const generalAverage = totalCoefficients > 0
                ? parseFloat((totalWeightedScore / totalCoefficients).toFixed(2))
                : 0;

              // تحديد التقدير
              const getAppreciation = (avg) => {
                if (avg >= 9) return { text: 'ممتاز', color: '#4caf50' };
                if (avg >= 8) return { text: 'جيد جداً', color: '#8bc34a' };
                if (avg >= 7) return { text: 'جيد', color: '#cddc39' };
                if (avg >= 6) return { text: 'مقبول', color: '#ffc107' };
                if (avg >= 5) return { text: 'ضعيف', color: '#ff9800' };
                return { text: 'راسب', color: '#f44336' };
              };

              const appreciation = getAppreciation(generalAverage);

              // تحميل ملاحظة التلميذ
              const savedData = localStorage.getItem('academyData');
              let studentNote = '';
              if (savedData) {
                const data = JSON.parse(savedData);
                studentNote = data.studentNotes?.[selectedStudent] || '';
              }

              return (
                <Box>
                  {/* رأس بيانات التلميذ */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 4,
                    p: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 3,
                    color: 'white'
                  }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mr: 3,
                        border: '4px solid white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                      }}
                      src={student.photo}
                    >
                      {!student.photo && student.fullName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {student.fullName}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        {getClassName(student.classId)}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
                        إجمالي النقاط: {studentGrades.length} نقطة
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {generalAverage}/10
                      </Typography>
                      <Chip
                        label={appreciation.text}
                        sx={{
                          bgcolor: appreciation.color,
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          px: 2
                        }}
                      />
                    </Box>
                  </Box>

                  {/* نقاط المواد */}
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
                    📊 نقاط المواد
                  </Typography>

                  <Grid container spacing={3}>
                    {subjectAverages.map((item) => (
                      <Grid item xs={12} md={6} lg={4} key={item.subject.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                  {item.subject.name}
                                </Typography>
                                <Chip
                                  label={`معامل ${item.subject.coefficient}`}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              </Box>

                              {/* أزرار سريعة للمادة */}
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    // فتح dialog لإضافة نقطة جديدة لهذه المادة
                                    const newGrade = {
                                      studentId: parseInt(selectedStudent),
                                      subjectId: item.subject.id,
                                      score: 5,
                                      examType: 'فرض',
                                      examDate: new Date().toISOString().split('T')[0],
                                      notes: ''
                                    };
                                    setEditingGrade(null);
                                    setFormData(newGrade);
                                    setErrors({});
                                    setOpenDialog(true);
                                  }}
                                  title="إضافة نقطة جديدة لهذه المادة"
                                  sx={{
                                    bgcolor: 'primary.light',
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: 'primary.main'
                                    }
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>

                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                              <Typography variant="h4" sx={{
                                fontWeight: 'bold',
                                color: getAppreciation(item.average).color,
                                mb: 1
                              }}>
                                {item.average}/10
                              </Typography>
                              <Chip
                                label={getAppreciation(item.average).text}
                                sx={{
                                  bgcolor: getAppreciation(item.average).color,
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                              تفاصيل النقاط ({item.grades.length}):
                            </Typography>
                            <Box sx={{ maxHeight: 160, overflowY: 'auto' }}>
                              {item.grades.map((grade, index) => (
                                <Box key={grade.id} sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  py: 1,
                                  px: 1,
                                  borderBottom: index < item.grades.length - 1 ? '1px solid #f0f0f0' : 'none',
                                  borderRadius: 1,
                                  '&:hover': {
                                    bgcolor: '#f8f9fa',
                                    '& .grade-actions': {
                                      opacity: 1
                                    }
                                  }
                                }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {grade.examType}
                                      </Typography>
                                      <Chip
                                        label={`${grade.score}/10`}
                                        size="small"
                                        color={getScoreColor(grade.score)}
                                        sx={{ fontWeight: 'bold' }}
                                      />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(grade.examDate).toLocaleDateString('ar-DZ')}
                                      {grade.notes && (
                                        <span style={{ marginLeft: 8, fontStyle: 'italic' }}>
                                          • {grade.notes.length > 30 ? grade.notes.substring(0, 30) + '...' : grade.notes}
                                        </span>
                                      )}
                                    </Typography>
                                  </Box>

                                  <Box
                                    className="grade-actions"
                                    sx={{
                                      display: 'flex',
                                      gap: 0.5,
                                      opacity: 0,
                                      transition: 'opacity 0.2s ease'
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleOpenDialog(grade)}
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        '&:hover': {
                                          bgcolor: 'primary.light',
                                          color: 'white'
                                        }
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDelete(grade.id)}
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        '&:hover': {
                                          bgcolor: 'error.light',
                                          color: 'white'
                                        }
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* ملاحظة المعلم */}
                  {studentNote && (
                    <Card sx={{ mt: 4, bgcolor: '#f8f9fa', border: '2px solid #1976d2' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{
                          color: '#1976d2',
                          mb: 2,
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          📝 ملاحظة المعلم
                        </Typography>
                        <Typography variant="body1" sx={{
                          lineHeight: 1.8,
                          fontSize: '1.1rem',
                          color: '#333',
                          fontStyle: 'italic'
                        }}>
                          "{studentNote}"
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* جدول النقاط - يظهر فقط عندما لا يتم اختيار تلميذ محدد */}
      {currentTab === 0 && !selectedStudent && (
        <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>التلميذ</TableCell>
              <TableCell>المادة</TableCell>
              <TableCell>النقطة</TableCell>
              <TableCell>نوع الامتحان</TableCell>
              <TableCell>التاريخ</TableCell>
              <TableCell>ملاحظات</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGrades.length > 0 ? (
              filteredGrades.map((grade) => {
                const student = students.find(s => s.id === grade.studentId);
                return (
                  <TableRow key={grade.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{ bgcolor: '#1976d2', mr: 2, width: 32, height: 32 }}
                          src={student?.photo}
                        >
                          {!student?.photo && getStudentName(grade.studentId).charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {getStudentName(grade.studentId)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student ? getClassName(student.classId) : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getSubjectName(grade.subjectId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${grade.score}/10`}
                        color={getScoreColor(grade.score)}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={grade.examType}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(grade.examDate).toLocaleDateString('ar-DZ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {grade.notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(grade)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(grade.id)}
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
                    لا توجد نقاط مطابقة لمعايير البحث
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {/* نافذة إضافة/تعديل النقطة */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingGrade ? 'تعديل النقطة' : 'إضافة نقطة جديدة'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.studentId}>
                <InputLabel>التلميذ</InputLabel>
                <Select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  label="التلميذ"
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.fullName} - {getClassName(student.classId)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.studentId && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, mx: 2 }}>
                    {errors.studentId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.subjectId}>
                <InputLabel>المادة</InputLabel>
                <Select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  label="المادة"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name} (معامل {subject.coefficient})
                    </MenuItem>
                  ))}
                </Select>
                {errors.subjectId && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, mx: 2 }}>
                    {errors.subjectId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>
                النقطة: {formData.score}/10
              </Typography>
              <Slider
                value={formData.score}
                onChange={(_, newValue) => setFormData({ ...formData, score: newValue })}
                step={0.25}
                marks={marks}
                min={0}
                max={10}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.examType}>
                <InputLabel>نوع الامتحان</InputLabel>
                <Select
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  label="نوع الامتحان"
                >
                  <MenuItem value="فرض">فرض</MenuItem>
                  <MenuItem value="اختبار">اختبار</MenuItem>
                  <MenuItem value="امتحان">امتحان</MenuItem>
                  <MenuItem value="تقييم مستمر">تقييم مستمر</MenuItem>
                </Select>
                {errors.examType && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, mx: 2 }}>
                    {errors.examType}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="تاريخ الامتحان"
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                error={!!errors.examDate}
                helperText={errors.examDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ملاحظات"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية حول الامتحان أو الأداء..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingGrade ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GradesManager;
