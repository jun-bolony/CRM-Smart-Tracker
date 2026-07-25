import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider, useThemeContext } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages
const ApplicationListPage = lazy(() => import('./pages/ApplicationListPage'));
const ApplicationFormPage = lazy(() => import('./pages/ApplicationFormPage'));
const ApplicationDetailPage = lazy(() => import('./pages/ApplicationDetailPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

const AppContent = () => {
  const { mode } = useThemeContext();
  const theme = createTheme({ palette: { mode } });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
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
        </AuthProvider>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <CustomThemeProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </CustomThemeProvider>
  );
}

export default App;