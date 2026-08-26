// frontend/src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline, Box, GlobalStyles } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalNavBar } from './components/GlobalNavBar';
import { useBackendHealth } from './hooks/useBackendHealth';
import { WakeUpScreen } from './components/WakeUpScreen';
import { GlobalGradientWrapper } from './components/GlobalGradientWrapper';

const ApplicationListPage = lazy(() => import('./pages/ApplicationListPage'));
const ApplicationFormPage = lazy(() => import('./pages/ApplicationFormPage'));
const ApplicationDetailPage = lazy(() => import('./pages/ApplicationDetailPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

const AppRoutes = () => {
  const location = useLocation();
  const hideNav = location.pathname === '/login' || location.pathname === '/register';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {!hideNav && <GlobalNavBar />}
      <GlobalGradientWrapper>
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<ProtectedRoute><ApplicationListPage /></ProtectedRoute>} />
              <Route path="/new" element={<ProtectedRoute><ApplicationFormPage /></ProtectedRoute>} />
              <Route path="/edit/:id" element={<ProtectedRoute><ApplicationFormPage /></ProtectedRoute>} />
              <Route path="/detail/:id" element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </Box>
      </GlobalGradientWrapper>
    </Box>
  );
};

const AppContent = () => {
  const theme = createTheme({ palette: { mode: 'light' } });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          'html, body': {
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          },
          '#root': {
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
          },
          // Unified scrollbar styles for all scroll containers
          '.table-scroll-container, .dashboard-scroll-container, .detail-scroll-container': {
            scrollbarWidth: 'thin',
            scrollbarColor: '#c1c1c1 #f1f1f1',
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '8px',
              border: '2px solid #f1f1f1',
              backgroundClip: 'padding-box',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#a8a8a8',
            },
          },
        }}
      />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

function App() {
  const { isBackendReady, secondsLeft, isWaiting } = useBackendHealth();

  return (
    <ErrorBoundary>
      {!isBackendReady ? (
        <WakeUpScreen secondsLeft={secondsLeft} isWaiting={isWaiting} />
      ) : (
        <AppContent />
      )}
    </ErrorBoundary>
  );
}

export default App;