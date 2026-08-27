// frontend/src/pages/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLangAnchorEl(null);
  };

  const handleLanguageSelect = (lang: 'en' | 'ru' | 'es' | 'fr' | 'de' | 'zh') => { // added 'zh'
    setLanguage(lang);
    handleLanguageClose();
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f9f8c4 0%, #86b6a0 50%, #77a1d3 100%)',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Language switcher in top-left corner */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <Button
          onClick={handleLanguageClick}
          sx={{
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            minWidth: '36px',
            height: '36px',
            p: 0,
            backgroundColor: 'rgba(0,0,0,0.15)',
            borderRadius: '4px',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.25)' },
          }}
        >
          {language.toUpperCase()}
        </Button>
        <Menu
          anchorEl={langAnchorEl}
          open={Boolean(langAnchorEl)}
          onClose={handleLanguageClose}
        >
          <MenuItem onClick={() => handleLanguageSelect('en')} selected={language === 'en'}>
            English
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect('ru')} selected={language === 'ru'}>
            Русский
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect('es')} selected={language === 'es'}>
            Español
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect('fr')} selected={language === 'fr'}>
            Français
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect('de')} selected={language === 'de'}>
            Deutsch
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect('zh')} selected={language === 'zh'}> {/* new */}
            中文
          </MenuItem>
        </Menu>
      </Box>

      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: '#8E8E8E' }}>
            {t('signUpTitle')}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              helperText={t('passwordHelper')}
            />
            <TextField
              label={t('confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ py: 1.2, fontWeight: 'bold' }}
            >
              {loading ? t('creatingAccount') : t('signUp')}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2">
                {t('alreadyHaveAccount')}{' '}
                <Link component={RouterLink} to="/login">
                  {t('signInLink')}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;