import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Avatar
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Class as ClassIcon,
  Subject as SubjectIcon,
  Grade as GradeIcon,
  Assessment as ReportIcon,
  Payment as PaymentIcon,
  AccountBalance as FinanceIcon,
  Settings as SettingsIcon,
  NightlightRound as MoonIcon,
  WbSunny as SunIcon
} from '@mui/icons-material';

// Import components
import Dashboard from './components/Dashboard/Dashboard.jsx';
import StudentsManager from './components/Students/StudentsManager.jsx';
import ClassesManager from './components/Classes/ClassesManager.jsx';
import SubjectsManager from './components/Subjects/SubjectsManager.jsx';
import GradesManager from './components/Grades/GradesManager.jsx';
import ReportsManager from './components/Reports/ReportsManager.jsx';
import PaymentsManager from './components/Payments/PaymentsManager.jsx';
import FinanceManager from './components/Finance/FinanceManager.jsx';
import SettingsManager from './components/Settings/SettingsManager.jsx';
import PWAButton from './components/PWA/PWAButton.jsx';

import { settingsAPI } from './data/storage';

// RTL Theme configuration
const createAppTheme = (darkMode) => createTheme({
  direction: 'rtl',
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: darkMode ? '#121212' : '#f5f5f5',
      paper: darkMode ? '#1e1e1e' : '#ffffff',
    },
    text: {
      primary: darkMode ? '#ffffff' : '#000000',
      secondary: darkMode ? '#b3b3b3' : '#666666',
    },
  },
  typography: {
    fontFamily: 'Cairo, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          direction: 'rtl',
          fontFamily: 'Cairo, sans-serif',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: darkMode ? '#1e1e1e' : '#1976d2',
        },
      },
    },
  },
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    // تحميل تفضيل الوضع المظلم من localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    // تحميل إعدادات الأكاديمية
    const academySettings = settingsAPI.get();
    setSettings(academySettings);
  }, []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  const tabs = [
    { label: 'الرئيسية', icon: <SchoolIcon />, component: <Dashboard onNavigate={setCurrentTab} /> },
    { label: 'التلاميذ', icon: <PeopleIcon />, component: <StudentsManager /> },
    { label: 'الأقسام', icon: <ClassIcon />, component: <ClassesManager /> },
    { label: 'المواد', icon: <SubjectIcon />, component: <SubjectsManager /> },
    { label: 'النقاط', icon: <GradeIcon />, component: <GradesManager /> },
    { label: 'التقارير', icon: <ReportIcon />, component: <ReportsManager /> },
    { label: 'التسديدات', icon: <PaymentIcon />, component: <PaymentsManager /> },
    { label: 'الإدارة المالية', icon: <FinanceIcon />, component: <FinanceManager /> },
    { label: 'الإعدادات', icon: <SettingsIcon />, component: <SettingsManager darkMode={darkMode} setDarkMode={setDarkMode} /> },
  ];

  return (
    <ThemeProvider theme={createAppTheme(darkMode)}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ mb: 2 }}>
          <Toolbar>
            {/* اللوجو */}
            {settings.logo ? (
              <Avatar
                src={settings.logo}
                sx={{ mr: 2, width: 40, height: 40 }}
                alt="لوجو الأكاديمية"
              />
            ) : (
              <SchoolIcon sx={{ mr: 2 }} />
            )}

            {/* اسم الأكاديمية */}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {settings.academyName || 'أكاديمية نجم بلوس'} - نظام إدارة الأكاديمية
            </Typography>

            {/* زر تثبيت التطبيق PWA */}
            <PWAButton />

            {/* زر الوضع المظلم */}
            <IconButton
              color="inherit"
              onClick={handleDarkModeToggle}
              sx={{ ml: 1 }}
              title={darkMode ? 'تبديل للوضع الفاتح' : 'تبديل للوضع المظلم'}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </IconButton>

            {/* زر الإعدادات */}
            <IconButton
              color="inherit"
              onClick={() => setCurrentTab(8)} // الانتقال لتبويب الإعدادات
              sx={{ ml: 1 }}
              title="الإعدادات"
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl">
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  sx={{ minHeight: 64 }}
                />
              ))}
            </Tabs>
          </Paper>

          {tabs.map((tab, index) => (
            <TabPanel key={index} value={currentTab} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
