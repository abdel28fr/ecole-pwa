import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Storage as StorageIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  studentsAPI,
  classesAPI,
  subjectsAPI,
  gradesAPI,
  settingsAPI,
  paymentsAPI,
  uiSettingsAPI
} from '../../data/storage';
import BackupValidator from './BackupValidator';

const BackupManager = () => {
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'backup' or 'restore'
  const [backupData, setBackupData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  // مكون TabPanel
  function TabPanel({ children, value, index, ...other }) {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`backup-tabpanel-${index}`}
        aria-labelledby={`backup-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ py: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  // إنشاء نسخة احتياطية
  const createBackup = async () => {
    setLoading(true);
    setProgress(0);
    setMessage('جاري إنشاء النسخة الاحتياطية...');

    try {
      // جمع جميع البيانات
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          students: studentsAPI.getAll(),
          classes: classesAPI.getAll(),
          subjects: subjectsAPI.getAllRaw(), // استخدام getAllRaw للحصول على البيانات الخام
          grades: gradesAPI.getAll(),
          settings: settingsAPI.get(),
          payments: paymentsAPI.getAll(),
          uiSettings: uiSettingsAPI.get()
        },
        metadata: {
          totalStudents: studentsAPI.getAll().length,
          totalClasses: classesAPI.getAll().length,
          totalSubjects: subjectsAPI.getAllRaw().length,
          totalGrades: gradesAPI.getAll().length,
          totalPayments: paymentsAPI.getAll().length
        }
      };

      // محاكاة التقدم
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // إنشاء ملف JSON
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // تحميل الملف
      const link = document.createElement('a');
      link.href = url;
      link.download = `academy-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage('تم إنشاء النسخة الاحتياطية بنجاح!');
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setMessage('');
      }, 2000);

    } catch (error) {
      console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
      setMessage('حدث خطأ أثناء إنشاء النسخة الاحتياطية');
      setLoading(false);
    }
  };

  // استعادة النسخة الاحتياطية
  const restoreBackup = async (file) => {
    setLoading(true);
    setProgress(0);
    setMessage('جاري استعادة النسخة الاحتياطية...');

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      // التحقق من صحة البيانات
      if (!backupData.data || !backupData.version) {
        throw new Error('ملف النسخة الاحتياطية غير صالح');
      }

      // التحقق من وجود بيانات للاستعادة
      const { data: backupContent } = backupData;
      let hasData = false;
      if (backupContent.students && backupContent.students.length > 0) hasData = true;
      if (backupContent.classes && backupContent.classes.length > 0) hasData = true;
      if (backupContent.subjects && backupContent.subjects.length > 0) hasData = true;
      if (backupContent.grades && backupContent.grades.length > 0) hasData = true;
      if (backupContent.payments && backupContent.payments.length > 0) hasData = true;

      if (!hasData) {
        throw new Error('الملف لا يحتوي على بيانات للاستعادة');
      }

      // استعادة البيانات

      console.log('بدء استعادة البيانات:', backupContent);

      // مسح البيانات الحالية واستعادة الجديدة
      if (backupContent.students) {
        console.log('استعادة التلاميذ:', backupContent.students.length, 'تلميذ');
        localStorage.setItem('students', JSON.stringify(backupContent.students));
        setProgress(15);
      }

      if (backupContent.classes) {
        localStorage.setItem('classes', JSON.stringify(backupContent.classes));
        setProgress(30);
      }

      if (backupContent.subjects) {
        localStorage.setItem('subjects', JSON.stringify(backupContent.subjects));
        setProgress(45);
      }

      if (backupContent.grades) {
        localStorage.setItem('grades', JSON.stringify(backupContent.grades));
        setProgress(60);
      }

      if (backupContent.settings) {
        localStorage.setItem('settings', JSON.stringify(backupContent.settings));
        setProgress(75);
      }

      if (backupContent.payments) {
        localStorage.setItem('payments', JSON.stringify(backupContent.payments));
        setProgress(85);
      }

      if (backupContent.uiSettings) {
        localStorage.setItem('uiSettings', JSON.stringify(backupContent.uiSettings));
        setProgress(100);
      }

      setMessage('تم استعادة النسخة الاحتياطية بنجاح!');

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setMessage('');
        setOpenDialog(false);
        // إعادة تحميل الصفحة لتطبيق البيانات الجديدة
        alert('تم استعادة البيانات بنجاح! سيتم إعادة تحميل الصفحة الآن.');
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('خطأ في استعادة النسخة الاحتياطية:', error);
      setMessage('حدث خطأ أثناء استعادة النسخة الاحتياطية: ' + error.message);
      setLoading(false);
    }
  };

  // فتح نافذة اختيار الملف
  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setDialogType('restore');
        setBackupData(file);
        setOpenDialog(true);
      }
    };
    input.click();
  };

  // حساب حجم البيانات
  const getDataSize = () => {
    const data = {
      students: studentsAPI.getAll(),
      classes: classesAPI.getAll(),
      subjects: subjectsAPI.getAllRaw(),
      grades: gradesAPI.getAll(),
      settings: settingsAPI.get(),
      payments: paymentsAPI.getAll(),
      uiSettings: uiSettingsAPI.get()
    };

    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    return sizeInKB;
  };

  // إحصائيات البيانات
  const getDataStats = () => {
    return {
      students: studentsAPI.getAll().length,
      classes: classesAPI.getAll().length,
      subjects: subjectsAPI.getAllRaw().length,
      grades: gradesAPI.getAll().length,
      payments: paymentsAPI.getAll().length
    };
  };

  const stats = getDataStats();

  return (
    <Box>
      {/* العنوان */}
      <Typography variant="h4" component="h1" gutterBottom>
        النسخ الاحتياطي
      </Typography>

      {/* رسالة تحذيرية */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>مهم:</strong> يُنصح بإنشاء نسخة احتياطية بانتظام لحماية بياناتك من الفقدان.
          احتفظ بالنسخ الاحتياطية في مكان آمن.
        </Typography>
      </Alert>

      {/* التبويبات */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="إدارة النسخ الاحتياطي"
            icon={<BackupIcon />}
            iconPosition="start"
          />
          <Tab
            label="فحص ملف النسخة"
            icon={<InfoIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* محتوى التبويبات */}
      <TabPanel value={currentTab} index={0}>
        {/* إحصائيات البيانات */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 إحصائيات البيانات الحالية
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{stats.students}</Typography>
                <Typography variant="caption">التلاميذ</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">{stats.classes}</Typography>
                <Typography variant="caption">الأقسام</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">{stats.subjects}</Typography>
                <Typography variant="caption">المواد</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">{stats.grades}</Typography>
                <Typography variant="caption">النقاط</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">{stats.payments}</Typography>
                <Typography variant="caption">المدفوعات</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">{getDataSize()}</Typography>
                <Typography variant="caption">KB</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* أدوات النسخ الاحتياطي */}
      <Grid container spacing={3}>
        {/* إنشاء نسخة احتياطية */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BackupIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">إنشاء نسخة احتياطية</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                قم بتحميل نسخة احتياطية من جميع بيانات الأكاديمية بصيغة JSON.
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText primary="جميع بيانات التلاميذ والأقسام" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText primary="المواد الدراسية والنقاط" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText primary="المدفوعات والتسديدات" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText primary="الإعدادات وتفضيلات العرض" />
                </ListItem>
              </List>

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  setDialogType('backup');
                  setOpenDialog(true);
                }}
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                تحميل نسخة احتياطية
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* استعادة نسخة احتياطية */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <RestoreIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">استعادة نسخة احتياطية</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                استعد البيانات من ملف نسخة احتياطية محفوظ مسبقاً.
              </Typography>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>تحذير:</strong> ستتم استبدال جميع البيانات الحالية بالبيانات من النسخة الاحتياطية.
                </Typography>
              </Alert>

              <List dense>
                <ListItem>
                  <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                  <ListItemText primary="سيتم حذف البيانات الحالية" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                  <ListItemText primary="يجب أن يكون الملف بصيغة JSON" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ScheduleIcon color="info" /></ListItemIcon>
                  <ListItemText primary="سيتم إعادة تشغيل التطبيق" />
                </ListItem>
              </List>

              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={handleFileSelect}
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
                color="warning"
              >
                اختيار ملف للاستعادة
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* نافذة التأكيد */}
      <Dialog open={openDialog} onClose={() => !loading && setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'backup' ? '📥 إنشاء نسخة احتياطية' : '📤 استعادة نسخة احتياطية'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'backup' ? (
            <Box>
              <Typography paragraph>
                هل تريد إنشاء نسخة احتياطية من جميع البيانات؟
              </Typography>
              <Typography variant="body2" color="text.secondary">
                سيتم تحميل ملف JSON يحتوي على جميع بيانات الأكاديمية.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography paragraph>
                هل تريد استعادة البيانات من الملف المحدد؟
              </Typography>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>تحذير:</strong> سيتم حذف جميع البيانات الحالية واستبدالها بالبيانات من النسخة الاحتياطية.
                  هذا الإجراء لا يمكن التراجع عنه.
                </Typography>
              </Alert>
              {backupData && (
                <Typography variant="body2" color="text.secondary">
                  الملف المحدد: {backupData.name}
                </Typography>
              )}
            </Box>
          )}

          {loading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                {message}
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {progress}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            إلغاء
          </Button>
          <Button
            onClick={() => {
              if (dialogType === 'backup') {
                setOpenDialog(false);
                createBackup();
              } else {
                restoreBackup(backupData);
              }
            }}
            variant="contained"
            color={dialogType === 'backup' ? 'primary' : 'warning'}
            disabled={loading}
          >
            {dialogType === 'backup' ? 'إنشاء النسخة' : 'استعادة البيانات'}
          </Button>
        </DialogActions>
      </Dialog>

        {/* رسالة الحالة */}
        {message && !openDialog && (
          <Alert
            severity={message.includes('خطأ') ? 'error' : 'success'}
            sx={{ mt: 2 }}
          >
            {message}
          </Alert>
        )}
      </TabPanel>

      {/* تبويب فحص الملف */}
      <TabPanel value={currentTab} index={1}>
        <BackupValidator />
      </TabPanel>
    </Box>
  );
};

export default BackupManager;
