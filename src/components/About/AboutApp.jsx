import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link
} from '@mui/material';
import {
  Info as InfoIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Build as BuildIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Devices as DevicesIcon,
  Language as LanguageIcon,
  Psychology as AIIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';

const AboutApp = () => {
  const appVersion = "1.0.0";
  const releaseDate = "ديسمبر 2024";
  const developer = "مراد بوباطة";
  const aiAssistant = "Claude (Anthropic)";

  const features = [
    { icon: <SchoolIcon />, title: "إدارة التلاميذ", description: "إدارة شاملة لبيانات التلاميذ والصور" },
    { icon: <CodeIcon />, title: "إدارة الأقسام", description: "تنظيم التلاميذ في أقسام دراسية" },
    { icon: <StarIcon />, title: "إدارة المواد", description: "إضافة المواد الدراسية والمعاملات" },
    { icon: <BuildIcon />, title: "إدارة النقاط", description: "تسجيل ومتابعة نقاط التلاميذ" },
    { icon: <SecurityIcon />, title: "التقارير والشهادات", description: "إنشاء تقارير وشهادات احترافية" },
    { icon: <SpeedIcon />, title: "إدارة المدفوعات", description: "متابعة التسديدات والمدفوعات" },
    { icon: <DevicesIcon />, title: "الإدارة المالية", description: "نظام مالي شامل للإيرادات والمصروفات" },
    { icon: <LanguageIcon />, title: "النسخ الاحتياطي", description: "حماية البيانات بنسخ احتياطية آمنة" }
  ];

  const technologies = [
    "React 18",
    "Material-UI (MUI)",
    "JavaScript ES6+",
    "HTML5 & CSS3",
    "PWA (Progressive Web App)",
    "Local Storage",
    "Responsive Design",
    "RTL Support"
  ];

  return (
    <Box>
      {/* العنوان الرئيسي */}
      <Box display="flex" alignItems="center" mb={4}>
        <InfoIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          حول البرنامج
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* معلومات البرنامج */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  نظام إدارة الأكاديمية
                </Typography>
              </Box>
              
              <Typography variant="body1" paragraph>
                نظام شامل ومتطور لإدارة الأكاديميات والمدارس الخاصة، مصمم خصيصاً 
                للبيئة العربية مع دعم كامل للغة العربية والتخطيط من اليمين إلى اليسار.
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip label={`الإصدار ${appVersion}`} color="primary" sx={{ mr: 1, mb: 1 }} />
                <Chip label={releaseDate} color="secondary" sx={{ mr: 1, mb: 1 }} />
                <Chip label="مجاني ومفتوح المصدر" color="success" sx={{ mb: 1 }} />
              </Box>

              <Typography variant="body2" color="text.secondary">
                تم تطوير هذا النظام باستخدام أحدث التقنيات لضمان الأداء العالي 
                والأمان والسهولة في الاستخدام.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* معلومات المطور */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  معلومات المطور
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    mr: 2, 
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem'
                  }}
                >
                  م.ب
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary">
                    {developer}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    مطور برمجيات
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" paragraph>
                مطور برمجيات متخصص في تطوير تطبيقات الويب والأنظمة التعليمية، 
                مع خبرة في التقنيات الحديثة وتصميم واجهات المستخدم.
              </Typography>

              <Box display="flex" alignItems="center" mb={2}>
                <AIIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="body2">
                  <strong>بمساعدة الذكاء الاصطناعي:</strong> {aiAssistant}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                تم تطوير هذا النظام بالتعاون مع الذكاء الاصطناعي لضمان 
                أفضل الممارسات في البرمجة والتصميم.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* الميزات الرئيسية */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🌟 الميزات الرئيسية
              </Typography>
              
              <Grid container spacing={2}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        height: '100%',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    >
                      <Box sx={{ color: 'primary.main', mb: 1 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* التقنيات المستخدمة */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🛠️ التقنيات المستخدمة
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {technologies.map((tech, index) => (
                  <Chip 
                    key={index}
                    label={tech}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                تم اختيار هذه التقنيات لضمان الأداء العالي، الأمان، 
                وسهولة الصيانة والتطوير المستقبلي.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* معلومات إضافية */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 معلومات إضافية
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="أمان البيانات"
                    secondary="جميع البيانات محفوظة محلياً في المتصفح"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <DevicesIcon color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="متوافق مع جميع الأجهزة"
                    secondary="يعمل على الحاسوب، الجوال، والتابلت"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LanguageIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="دعم كامل للعربية"
                    secondary="واجهة عربية بالكامل مع دعم RTL"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SpeedIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="أداء عالي"
                    secondary="تحميل سريع وتجربة مستخدم سلسة"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* حقوق الطبع والنشر */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="body1" gutterBottom>
              © 2024 نظام إدارة الأكاديمية - جميع الحقوق محفوظة
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              تم التطوير بواسطة <strong>{developer}</strong> بمساعدة الذكاء الاصطناعي <strong>{aiAssistant}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              هذا البرنامج مجاني ومفتوح المصدر، يمكن استخدامه وتطويره بحرية
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AboutApp;
