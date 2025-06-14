import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import {
  AccountBalance as FinanceIcon,
  Category as CategoryIcon,
  Receipt as TransactionIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import CategoriesManager from './CategoriesManager';
import TransactionsManager from './TransactionsManager';
import FinanceReports from './FinanceReports';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-tabpanel-${index}`}
      aria-labelledby={`finance-tab-${index}`}
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

function a11yProps(index) {
  return {
    id: `finance-tab-${index}`,
    'aria-controls': `finance-tabpanel-${index}`,
  };
}

const FinanceManager = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const tabs = [
    {
      label: 'إدارة الفئات',
      icon: <CategoryIcon />,
      component: <CategoriesManager />
    },
    {
      label: 'إدارة المعاملات',
      icon: <TransactionIcon />,
      component: <TransactionsManager />
    },
    {
      label: 'التقارير والإحصائيات',
      icon: <ReportIcon />,
      component: <FinanceReports />
    }
  ];

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* رأس النظام المالي */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
          color: 'white',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FinanceIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              نظام الإدارة المالية
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              إدارة شاملة للإيرادات والمصروفات والتقارير المالية
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* شريط التبويبات */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
            '& .MuiTab-root': {
              minHeight: 72,
              fontSize: '1rem',
              fontWeight: 500,
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark' ? 'grey.700' : 'white',
                color: 'primary.main',
                fontWeight: 'bold'
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  <Typography variant="inherit">
                    {tab.label}
                  </Typography>
                </Box>
              }
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </Paper>

      {/* محتوى التبويبات */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={currentTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
};

export default FinanceManager;
