import React, { useState, useEffect } from 'react';
import {
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Slide
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Close as CloseIcon,
  Smartphone as PhoneIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [newServiceWorker, setNewServiceWorker] = useState(null);

  useEffect(() => {
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
      
      // إظهار زر التثبيت بعد تأخير قصير
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    // معالجة تثبيت التطبيق
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // تسجيل Service Worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('PWA: Service Worker registered successfully');

          // معالجة تحديثات Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('PWA: New service worker available');
                  setNewServiceWorker(newWorker);
                  setShowUpdatePrompt(true);
                }
              });
            }
          });

        } catch (error) {
          console.error('PWA: Service Worker registration failed:', error);
        }
      }
    };

    checkIfInstalled();
    registerServiceWorker();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
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
    setShowInstallPrompt(false);
  };

  const handleUpdateClick = () => {
    if (newServiceWorker) {
      newServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
      window.location.reload();
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    // إخفاء الرسالة لمدة يوم
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleDismissUpdate = () => {
    setShowUpdatePrompt(false);
  };

  // التحقق من إخفاء رسالة التثبيت
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneDayInMs) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  };

  const deviceType = getDeviceType();

  return (
    <>
      {/* رسالة التثبيت */}
      <Snackbar
        open={showInstallPrompt && !isInstalled}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Alert
          severity="info"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={handleInstallClick}
                startIcon={<InstallIcon />}
                sx={{ color: 'white' }}
              >
                تثبيت
              </Button>
              <IconButton
                size="small"
                onClick={handleDismissInstall}
                sx={{ color: 'white' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {deviceType === 'mobile' ? <PhoneIcon /> : <ComputerIcon />}
            <Typography variant="body2">
              ثبت التطبيق على {deviceType === 'mobile' ? 'هاتفك' : 'حاسوبك'} للوصول السريع
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      {/* حوار التحديث */}
      <Dialog
        open={showUpdatePrompt}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleDismissUpdate}
        aria-describedby="update-dialog-description"
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          🔄 تحديث متاح
        </DialogTitle>
        <DialogContent>
          <Typography id="update-dialog-description" sx={{ textAlign: 'center', mb: 2 }}>
            يتوفر إصدار جديد من التطبيق مع تحسينات وميزات جديدة.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            هل تريد تحديث التطبيق الآن؟
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button onClick={handleDismissUpdate} color="inherit">
            لاحقاً
          </Button>
          <Button 
            onClick={handleUpdateClick} 
            variant="contained" 
            color="primary"
            startIcon={<InstallIcon />}
          >
            تحديث الآن
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PWAInstaller;
