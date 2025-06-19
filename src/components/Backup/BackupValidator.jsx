import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Paper,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const BackupValidator = () => {
  const [backupData, setBackupData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          setBackupData(data);
          validateBackup(data);
          setError(null);
        } catch (err) {
          setError('خطأ في قراءة الملف: ' + err.message);
          setBackupData(null);
          setValidationResult(null);
        }
      }
    };
    input.click();
  };

  const validateBackup = (data) => {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      info: {}
    };

    // التحقق من الهيكل الأساسي
    if (!data.version) {
      result.errors.push('لا يوجد رقم إصدار');
      result.isValid = false;
    }

    if (!data.timestamp) {
      result.errors.push('لا يوجد تاريخ إنشاء');
      result.isValid = false;
    }

    if (!data.data) {
      result.errors.push('لا توجد بيانات');
      result.isValid = false;
    } else {
      // التحقق من البيانات
      const { data: backupContent } = data;

      // التحقق من التلاميذ
      if (backupContent.students) {
        if (Array.isArray(backupContent.students)) {
          result.info.studentsCount = backupContent.students.length;
          if (backupContent.students.length === 0) {
            result.warnings.push('لا يوجد تلاميذ في النسخة الاحتياطية');
          }
        } else {
          result.errors.push('بيانات التلاميذ غير صحيحة');
          result.isValid = false;
        }
      } else {
        result.warnings.push('لا توجد بيانات تلاميذ');
      }

      // التحقق من الأقسام
      if (backupContent.classes) {
        if (Array.isArray(backupContent.classes)) {
          result.info.classesCount = backupContent.classes.length;
        } else {
          result.errors.push('بيانات الأقسام غير صحيحة');
          result.isValid = false;
        }
      } else {
        result.warnings.push('لا توجد بيانات أقسام');
      }

      // التحقق من المواد
      if (backupContent.subjects) {
        if (Array.isArray(backupContent.subjects)) {
          result.info.subjectsCount = backupContent.subjects.length;
        } else {
          result.errors.push('بيانات المواد غير صحيحة');
          result.isValid = false;
        }
      } else {
        result.warnings.push('لا توجد بيانات مواد');
      }

      // التحقق من النقاط
      if (backupContent.grades) {
        if (Array.isArray(backupContent.grades)) {
          result.info.gradesCount = backupContent.grades.length;
        } else {
          result.errors.push('بيانات النقاط غير صحيحة');
          result.isValid = false;
        }
      } else {
        result.warnings.push('لا توجد بيانات نقاط');
      }

      // التحقق من المدفوعات
      if (backupContent.payments) {
        if (Array.isArray(backupContent.payments)) {
          result.info.paymentsCount = backupContent.payments.length;
        } else {
          result.errors.push('بيانات المدفوعات غير صحيحة');
          result.isValid = false;
        }
      } else {
        result.warnings.push('لا توجد بيانات مدفوعات');
      }

      // التحقق من الإعدادات
      if (backupContent.settings) {
        if (typeof backupContent.settings === 'object') {
          result.info.hasSettings = true;
        } else {
          result.errors.push('بيانات الإعدادات غير صحيحة');
          result.isValid = false;
        }
      } else {
        result.warnings.push('لا توجد إعدادات');
      }

      // التحقق من إعدادات العرض
      if (backupContent.uiSettings) {
        if (typeof backupContent.uiSettings === 'object') {
          result.info.hasUISettings = true;
        } else {
          result.errors.push('إعدادات العرض غير صحيحة');
          result.isValid = false;
        }
      } else {
        result.warnings.push('لا توجد إعدادات عرض');
      }
    }

    setValidationResult(result);
  };

  const formatDate = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString('ar-DZ');
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        🔍 فحص ملف النسخة الاحتياطية
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            اختيار الملف للفحص
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleFileSelect}
            fullWidth
          >
            اختيار ملف النسخة الاحتياطية
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {backupData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 معلومات الملف
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2">الإصدار</Typography>
                  <Typography variant="h6">{backupData.version || 'غير محدد'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2">تاريخ الإنشاء</Typography>
                  <Typography variant="h6">
                    {backupData.timestamp ? formatDate(backupData.timestamp) : 'غير محدد'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {validationResult && (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              {validationResult.isValid ? (
                <CheckIcon color="success" sx={{ mr: 1 }} />
              ) : (
                <ErrorIcon color="error" sx={{ mr: 1 }} />
              )}
              <Typography variant="h6">
                {validationResult.isValid ? 'الملف صحيح ✅' : 'الملف يحتوي على أخطاء ❌'}
              </Typography>
            </Box>

            {validationResult.errors.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle1" color="error" gutterBottom>
                  🚨 أخطاء:
                </Typography>
                {validationResult.errors.map((error, index) => (
                  <Alert key={index} severity="error" sx={{ mb: 1 }}>
                    {error}
                  </Alert>
                ))}
              </Box>
            )}

            {validationResult.warnings.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle1" color="warning.main" gutterBottom>
                  ⚠️ تحذيرات:
                </Typography>
                {validationResult.warnings.map((warning, index) => (
                  <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                    {warning}
                  </Alert>
                ))}
              </Box>
            )}

            <Typography variant="subtitle1" gutterBottom>
              📊 إحصائيات البيانات:
            </Typography>
            <Grid container spacing={1}>
              {validationResult.info.studentsCount !== undefined && (
                <Grid item>
                  <Chip 
                    label={`التلاميذ: ${validationResult.info.studentsCount}`}
                    color="primary"
                    variant="outlined"
                  />
                </Grid>
              )}
              {validationResult.info.classesCount !== undefined && (
                <Grid item>
                  <Chip 
                    label={`الأقسام: ${validationResult.info.classesCount}`}
                    color="secondary"
                    variant="outlined"
                  />
                </Grid>
              )}
              {validationResult.info.subjectsCount !== undefined && (
                <Grid item>
                  <Chip 
                    label={`المواد: ${validationResult.info.subjectsCount}`}
                    color="success"
                    variant="outlined"
                  />
                </Grid>
              )}
              {validationResult.info.gradesCount !== undefined && (
                <Grid item>
                  <Chip 
                    label={`النقاط: ${validationResult.info.gradesCount}`}
                    color="warning"
                    variant="outlined"
                  />
                </Grid>
              )}
              {validationResult.info.paymentsCount !== undefined && (
                <Grid item>
                  <Chip 
                    label={`المدفوعات: ${validationResult.info.paymentsCount}`}
                    color="info"
                    variant="outlined"
                  />
                </Grid>
              )}
              {validationResult.info.hasSettings && (
                <Grid item>
                  <Chip 
                    label="الإعدادات: ✅"
                    color="success"
                    variant="outlined"
                  />
                </Grid>
              )}
              {validationResult.info.hasUISettings && (
                <Grid item>
                  <Chip 
                    label="إعدادات العرض: ✅"
                    color="success"
                    variant="outlined"
                  />
                </Grid>
              )}
            </Grid>

            {backupData && backupData.data && backupData.data.students && (
              <Box mt={3}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  👥 عينة من التلاميذ:
                </Typography>
                {backupData.data.students.slice(0, 3).map((student, index) => (
                  <Paper key={index} sx={{ p: 1, mb: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      <strong>{student.fullName}</strong> - {student.age} سنة
                      {student.classId && ` - القسم: ${student.classId}`}
                    </Typography>
                  </Paper>
                ))}
                {backupData.data.students.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    ... و {backupData.data.students.length - 3} تلميذ آخر
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default BackupValidator;
