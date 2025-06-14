import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Slide
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Smartphone as PhoneIcon,
  Computer as ComputerIcon,
  CheckCircle as InstalledIcon
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // التحقق من دعم PWA
    const checkPWASupport = () => {
      if ('serviceWorker' in navigator) {
        setIsSupported(true);
        console.log('PWA: Service Worker supported');
      } else {
        console.log('PWA: Service Worker not supported');
      }
    };

    // التحقق من تثبيت التطبيق
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        setIsInstalled(true);
      }
    };

    // معالجة حدث beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('PWA: Install prompt is now available');
    };

    // محاولة إجبار Install Prompt (للاختبار)
    const forceInstallPrompt = () => {
      // محاكي Install Prompt للاختبار
      setTimeout(() => {
        if (!deferredPrompt && !isInstalled) {
          console.log('PWA: Simulating install prompt availability');
          // يمكن إضافة محاكي هنا إذا لزم الأمر
        }
      }, 5000);
    };

    // معالجة تثبيت التطبيق
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowDialog(false);
    };

    // تسجيل Service Worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          console.log('PWA: Service Worker registered successfully', registration);

          // انتظار حتى يصبح Service Worker جاهز
          await navigator.serviceWorker.ready;
          console.log('PWA: Service Worker is ready');

        } catch (error) {
          console.error('PWA: Service Worker registration failed:', error);
        }
      }
    };

    checkPWASupport();
    checkIfInstalled();
    registerServiceWorker();
    forceInstallPrompt();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    setShowDialog(true);
  };

  const handleConfirmInstall = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      console.log('PWA: Install prompt result:', result.outcome);
      
      if (result.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
    } catch (error) {
      console.error('PWA: Install prompt failed:', error);
    }

    setDeferredPrompt(null);
    setShowDialog(false);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  };

  const deviceType = getDeviceType();

  // إخفاء الزر فقط إذا كان التطبيق مثبت
  if (isInstalled) {
    return (
      <Tooltip title="التطبيق مثبت">
        <IconButton color="inherit" sx={{ ml: 1 }}>
          <InstalledIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip title={isInstalled ? "التطبيق مثبت" : "تثبيت التطبيق"}>
        <IconButton
          color="inherit"
          onClick={handleInstallClick}
          sx={{ ml: 1 }}
        >
          {isInstalled ? <InstalledIcon /> : <InstallIcon />}
        </IconButton>
      </Tooltip>

      <Dialog
        open={showDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            {deviceType === 'mobile' ? <PhoneIcon color="primary" /> : <ComputerIcon color="primary" />}
            <Typography variant="h6">
              تثبيت التطبيق
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              ثبت أكاديمية نجم بلوس على {deviceType === 'mobile' ? 'هاتفك' : 'حاسوبك'} للوصول السريع والعمل بدون إنترنت
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1, 
              textAlign: 'right',
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              p: 2,
              borderRadius: 2
            }}>
              <Typography variant="body2" color="text.secondary">
                ✅ وصول سريع من الشاشة الرئيسية
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ عمل بدون إنترنت (وضع أوفلاين)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ تجربة تطبيق أصلي
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ إشعارات فورية (قريباً)
              </Typography>
            </Box>

            {!deferredPrompt && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" color="info.contrastText">
                  💡 لتثبيت التطبيق يدوياً:
                  <br />
                  {deviceType === 'mobile'
                    ? "انقر على قائمة المتصفح ← 'إضافة إلى الشاشة الرئيسية'"
                    : "انقر على أيقونة التثبيت في شريط العنوان أو Ctrl+Shift+A"
                  }
                </Typography>
              </Box>
            )}

            {/* معلومات تشخيصية */}
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                🔧 معلومات تشخيصية:
                <br />
                • Service Worker: {isSupported ? '✅ مدعوم' : '❌ غير مدعوم'}
                <br />
                • Install Prompt: {deferredPrompt ? '✅ متاح' : '❌ غير متاح'}
                <br />
                • التطبيق مثبت: {isInstalled ? '✅ نعم' : '❌ لا'}
                <br />
                • نوع الجهاز: {deviceType === 'mobile' ? '📱 هاتف' : '💻 حاسوب'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            إلغاء
          </Button>
          {deferredPrompt ? (
            <Button
              onClick={handleConfirmInstall}
              variant="contained"
              color="primary"
              startIcon={<InstallIcon />}
              size="large"
            >
              تثبيت الآن
            </Button>
          ) : (
            <Button
              onClick={() => {
                // فتح تعليمات التثبيت اليدوي
                if (deviceType === 'desktop') {
                  alert('للتثبيت اليدوي:\n1. انقر على أيقونة ⋮ في أعلى اليمين\n2. اختر "Install أكاديمية نجم بلوس..."\n3. أو اضغط Ctrl+Shift+A');
                } else {
                  alert('للتثبيت اليدوي:\n1. انقر على قائمة المتصفح ⋮\n2. اختر "Add to Home screen"\n3. أو "إضافة إلى الشاشة الرئيسية"');
                }
                handleCloseDialog();
              }}
              variant="contained"
              color="primary"
              startIcon={<InstallIcon />}
              size="large"
            >
              تعليمات التثبيت
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PWAButton;
