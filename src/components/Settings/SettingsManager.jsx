import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Avatar,
  Divider,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  School as SchoolIcon
} from '@mui/icons-material';

import { settingsAPI } from '../../data/storage';

const SettingsManager = ({ darkMode, setDarkMode }) => {
  const [settings, setSettings] = useState({
    academyName: '',
    academyAddress: '',
    academyPhone: '',
    academyEmail: '',
    currentYear: '',
    logo: ''
  });
  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // تحقق من وجود تغييرات
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadSettings = () => {
    const currentSettings = settingsAPI.get();
    setSettings(currentSettings);
    setOriginalSettings(currentSettings);
  };

  // دالة لمعالجة رفع اللوجو
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }
      
      // التحقق من حجم الملف (أقل من 2MB للوجو)
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم اللوجو يجب أن يكون أقل من 2 ميجابايت');
        return;
      }

      // تحويل الصورة إلى Base64
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings({ ...settings, logo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة لحذف اللوجو
  const handleRemoveLogo = () => {
    setSettings({ ...settings, logo: '' });
  };

  // دالة لحفظ الإعدادات
  const handleSave = () => {
    try {
      settingsAPI.update(settings);
      setOriginalSettings(settings);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      alert('حدث خطأ في حفظ الإعدادات');
    }
  };

  // دالة لاستعادة الإعدادات
  const handleRestore = () => {
    setSettings(originalSettings);
  };

  // دالة لتغيير الوضع المظلم
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    // حفظ تفضيل الوضع المظلم في localStorage
    localStorage.setItem('darkMode', !darkMode);
  };

  return (
    <Box>
      {/* العنوان */}
      <Box display="flex" alignItems="center" mb={3}>
        <SettingsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          إعدادات التطبيق
        </Typography>
      </Box>

      {/* رسالة النجاح */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          تم حفظ الإعدادات بنجاح!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* إعدادات المظهر */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <DarkModeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                إعدادات المظهر
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={handleDarkModeToggle}
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      {darkMode ? <DarkModeIcon sx={{ mr: 1 }} /> : <LightModeIcon sx={{ mr: 1 }} />}
                      {darkMode ? 'الوضع المظلم' : 'الوضع الفاتح'}
                    </Box>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {darkMode 
                    ? 'الوضع المظلم يوفر راحة أكبر للعينين في الإضاءة المنخفضة'
                    : 'الوضع الفاتح يوفر وضوحاً أكبر في الإضاءة العادية'
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* لوجو الأكاديمية */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                لوجو الأكاديمية
              </Typography>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Avatar
                  src={settings.logo}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    margin: '0 auto 16px',
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {!settings.logo && <SchoolIcon sx={{ fontSize: '2rem' }} />}
                </Avatar>
                
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                    size="small"
                  >
                    {settings.logo ? 'تغيير اللوجو' : 'إضافة لوجو'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </Button>
                  
                  {settings.logo && (
                    <IconButton
                      color="error"
                      onClick={handleRemoveLogo}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  الحد الأقصى: 2 ميجابايت - مقاس مربع مفضل
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* معلومات الأكاديمية */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                معلومات الأكاديمية
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="اسم الأكاديمية"
                    value={settings.academyName}
                    onChange={(e) => setSettings({ ...settings, academyName: e.target.value })}
                    placeholder="أكاديمية نجم بلوس"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="السنة الدراسية"
                    value={settings.currentYear}
                    onChange={(e) => setSettings({ ...settings, currentYear: e.target.value })}
                    placeholder="2024-2025"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="رقم الهاتف"
                    value={settings.academyPhone}
                    onChange={(e) => setSettings({ ...settings, academyPhone: e.target.value })}
                    placeholder="+213 XX XX XX XX"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    type="email"
                    value={settings.academyEmail}
                    onChange={(e) => setSettings({ ...settings, academyEmail: e.target.value })}
                    placeholder="info@academy.com"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="عنوان الأكاديمية"
                    multiline
                    rows={2}
                    value={settings.academyAddress}
                    onChange={(e) => setSettings({ ...settings, academyAddress: e.target.value })}
                    placeholder="العنوان الكامل للأكاديمية"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* أزرار الحفظ */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              {hasChanges && (
                <Typography variant="body2" color="warning.main">
                  يوجد تغييرات غير محفوظة
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={handleRestore}
                disabled={!hasChanges}
              >
                استعادة
              </Button>
              
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!hasChanges}
              >
                حفظ الإعدادات
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsManager;
