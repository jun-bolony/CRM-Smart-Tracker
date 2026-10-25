// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline, Box, GlobalStyles } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalNavBar } from './components/GlobalNavBar';
import { useBackendHealth } from './hooks/useBackendHealth';
import { WakeUpScreen } from './components/WakeUpScreen';
import { GlobalGradientWrapper } from './components/GlobalGradientWrapper';

// v0.9.100 (production hotfix): static imports for all pages.
//
// Lazy-loading pages via React.lazy created a separate Vite chunk
// per page. Rollup then inlined the context modules (AuthContext,
// LanguageContext) into BOTH the main chunk and each page chunk,
// producing two independent createContext() instances. AuthProvider
// (in the main chunk) provided to instance A, while LoginPage (in
// its own chunk) consumed instance B and got undefined, throwing
// "useAuth must be used within an AuthProvider". Serving the app
// through a VPN/proxy made the mismatch reproducible because page
// chunks could come from different deploys.
//
// The static imports below put every page in the main bundle so all
// consumers of a given context share the exact same createContext()
// instance regardless of which URL serves the app.
import ApplicationListPage from './pages/ApplicationListPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const AppRoutes = () => {
  const location = useLocation();
  const hideNav = location.pathname === '/login' || location.pathname === '/register';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {!hideNav && <GlobalNavBar />}
      <GlobalGradientWrapper>
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><ApplicationListPage /></ProtectedRoute>} />
            <Route path="/new" element={<ProtectedRoute><ApplicationFormPage /></ProtectedRoute>} />
            <Route path="/edit/:id" element={<ProtectedRoute><ApplicationFormPage /></ProtectedRoute>} />
            <Route path="/detail/:id" element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </Box>
      </GlobalGradientWrapper>
    </Box>
  );
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

function App() {
  const { isBackendReady, secondsLeft, isWaiting } = useBackendHealth();
  const theme = createTheme({ palette: { mode: 'light' } });

  return (
    <ErrorBoundary>
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
        <LanguageProvider>
          {!isBackendReady ? (
            <WakeUpScreen secondsLeft={secondsLeft} isWaiting={isWaiting} />
          ) : (
            <AppContent />
          )}
        </LanguageProvider>
      </MuiThemeProvider>
    </ErrorBoundary>
  );
}

export default App;