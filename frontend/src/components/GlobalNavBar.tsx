// frontend/src/components/GlobalNavBar.tsx
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef } from 'react';
import type { FC } from 'react';
import { deleteAccount } from '../services/api';

const NAV_HIDE_BREAKPOINT = 'sm';

const NavDivider: FC = () => (
  <Box sx={{ width: '1px', height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
);

interface NavTabProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavTab: FC<NavTabProps> = ({ label, active, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      px: 1.5,
      py: 0.2,
      borderRadius: '3px',
      backgroundColor: active ? '#0d47a1' : 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: active ? '#1565c0' : 'rgba(255, 255, 255, 0.15)',
      },
    }}
  >
    <Typography
      sx={{
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '0.75rem',
        letterSpacing: '0.3px',
        userSelect: 'none',
      }}
    >
      {label}
    </Typography>
  </Box>
);

interface NavLinkProps {
  label: string;
  onClick?: () => void;
}

const NavLink: FC<NavLinkProps> = ({ label, onClick }) => (
  <Typography
    onClick={onClick}
    sx={{
      color: '#81d4fa',
      fontWeight: '500',
      fontSize: '0.75rem',
      cursor: 'pointer',
      letterSpacing: '0.3px',
      userSelect: 'none',
      '&:hover': { color: '#ffffff' },
    }}
  >
    {label}
  </Typography>
);

interface NavButtonConfig {
  active: boolean;
  targetPath: string | null;
  tooltip: string | null;
}

export const GlobalNavBar: FC = () => {
  const { logout, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(NAV_HIDE_BREAKPOINT));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const langButtonRef = useRef<HTMLButtonElement>(null);

  const pathname = location.pathname;
  const editMatch = pathname.match(/^\/edit\/(.+)/);
  const detailMatch = pathname.match(/^\/detail\/(.+)/);
  const applicationId = editMatch?.[1] || detailMatch?.[1] || null;

  const getButtonConfig = (type: 'edit' | 'detail'): NavButtonConfig => {
    const isEditPage = !!editMatch;
    const isDetailPage = !!detailMatch;

    if (type === 'edit') {
      if (isEditPage) {
        return { active: true, targetPath: null, tooltip: null };
      }
      if (isDetailPage && applicationId) {
        return { active: false, targetPath: `/edit/${applicationId}`, tooltip: null };
      }
      return {
        active: false,
        targetPath: null,
        tooltip: t('navTooltipInactive'),
      };
    }

    if (type === 'detail') {
      if (isDetailPage) {
        return { active: true, targetPath: null, tooltip: null };
      }
      if (isEditPage && applicationId) {
        return { active: false, targetPath: `/detail/${applicationId}`, tooltip: null };
      }
      return {
        active: false,
        targetPath: null,
        tooltip: t('navTooltipInactive'),
      };
    }

    return { active: false, targetPath: null, tooltip: null };
  };

  const editConfig = getButtonConfig('edit');
  const detailConfig = getButtonConfig('detail');

  const handleNavigate = (path: string | null) => {
    if (path) {
      navigate(path);
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsSidebarOpen(false);
  };

  const handleNavigateMain = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    try {
      await deleteAccount();
      logout();
      navigate('/login');
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      setDeleteError(err.message || 'Failed to delete account');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const renderNavButton = (label: string, config: NavButtonConfig) => {
    const { active, targetPath, tooltip } = config;

    if (active || targetPath) {
      return (
        <NavTab
          label={label}
          active={active}
          onClick={() => handleNavigate(targetPath)}
        />
      );
    }

    return (
      <Tooltip title={tooltip || ''} arrow>
        <span>
          <NavLink label={label} />
        </span>
      </Tooltip>
    );
  };

  const handleLanguageClick = () => {
    if (langButtonRef.current) {
      setLangAnchorEl(langButtonRef.current);
    }
  };

  const handleLanguageClose = () => {
    setLangAnchorEl(null);
  };

  const handleLanguageSelect = (lang: 'en' | 'ru' | 'es' | 'fr' | 'de' | 'zh') => { // added 'zh'
    setLanguage(lang);
    handleLanguageClose();
  };

  // Language switcher button (shows current language code)
  const LanguageButton = () => (
    <>
      <Button
        ref={langButtonRef}
        onClick={handleLanguageClick}
        sx={{
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          minWidth: '32px',
          height: '24px',
          p: 0,
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
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
    </>
  );

  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: '24px',
          backgroundColor: '#1976d2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1100,
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.3)',
        }}
      >
        {isSmallScreen ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LanguageButton />
              <Box
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  width: '40px',
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                {isSidebarOpen ? <CloseIcon sx={{ color: '#ffffff' }} /> : <MenuIcon sx={{ color: '#ffffff' }} />}
              </Box>
            </Box>

            {isSidebarOpen && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#1976d2',
                  padding: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  zIndex: 1100,
                  boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.3)',
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <NavTab
                    label={t('applications')}
                    active={location.pathname === '/'}
                    onClick={() => handleNavigateMain('/')}
                  />
                  <NavTab
                    label={t('dashboard')}
                    active={location.pathname === '/dashboard'}
                    onClick={() => handleNavigateMain('/dashboard')}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  {renderNavButton(t('editPage'), editConfig)}
                  <NavDivider />
                  {renderNavButton(t('detailedApplication'), detailConfig)}
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Button
                    onClick={handleLogout}
                    sx={{
                      background: 'linear-gradient(180deg, #00e5ff 0%, #0097a7 100%)',
                      border: '1px solid #00bcd4',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      px: 2,
                      py: 0.3,
                      height: '20px',
                      minWidth: 'unset',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.5)',
                      '&:hover': {
                        background: 'linear-gradient(180deg, #18ffff 0%, #00838f 100%)',
                      },
                    }}
                  >
                    <LogoutIcon sx={{ fontSize: 13 }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', lineHeight: 1 }}>
                      {t('logout')}
                    </Typography>
                  </Button>

                  <Tooltip title={t('deleteAccountTooltip')}>
                    <Button
                      onClick={() => setDeleteDialogOpen(true)}
                      sx={{
                        background: 'linear-gradient(180deg, #ff5252 0%, #b71c1c 100%)',
                        border: '1px solid #d32f2f',
                        color: '#ffffff',
                        borderRadius: '4px',
                        px: 1,
                        py: 0.3,
                        height: '20px',
                        minWidth: 'unset',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)',
                        '&:hover': {
                          background: 'linear-gradient(180deg, #ff1744 0%, #880e4f 100%)',
                        },
                      }}
                    >
                      <DeleteForeverIcon sx={{ fontSize: 13 }} />
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            )}
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LanguageButton />
              <NavTab
                label={t('applications')}
                active={location.pathname === '/'}
                onClick={() => navigate('/')}
              />
              <NavDivider />
              <NavTab
                label={t('dashboard')}
                active={location.pathname === '/dashboard'}
                onClick={() => navigate('/dashboard')}
              />
            </Box>

            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 0.5,
              }}
            >
              <Typography
                sx={{
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  letterSpacing: '0.5px',
                }}
              >
                CRM Smart Tracker
              </Typography>
              <Typography
                sx={{
                  color: '#aed581',
                  fontWeight: 'bold',
                  fontSize: '0.55rem',
                }}
              >
                0.9.90
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {renderNavButton(t('editPage'), editConfig)}
              <NavDivider />
              {renderNavButton(t('detailedApplication'), detailConfig)}

              <Button
                onClick={handleLogout}
                sx={{
                  background: 'linear-gradient(180deg, #00e5ff 0%, #0097a7 100%)',
                  border: '1px solid #00bcd4',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  px: 2,
                  py: 0.3,
                  height: '20px',
                  minWidth: 'unset',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.5)',
                  '&:hover': {
                    background: 'linear-gradient(180deg, #18ffff 0%, #00838f 100%)',
                  },
                }}
              >
                <LogoutIcon sx={{ fontSize: 13 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', lineHeight: 1 }}>
                  {t('logout')}
                </Typography>
              </Button>

              <Tooltip title={t('deleteAccountTooltip')}>
                <Button
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{
                    background: 'linear-gradient(180deg, #ff5252 0%, #b71c1c 100%)',
                    border: '1px solid #d32f2f',
                    color: '#ffffff',
                    borderRadius: '4px',
                    px: 1,
                    py: 0.3,
                    height: '20px',
                    minWidth: 'unset',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(180deg, #ff1744 0%, #880e4f 100%)',
                    },
                  }}
                >
                  <DeleteForeverIcon sx={{ fontSize: 13 }} />
                </Button>
              </Tooltip>
            </Box>
          </>
        )}
      </Box>

      {/* Delete Account Dialog – email displayed in bold */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'black' }}>{t('deleteDialogTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'black' }}>
            {t('deleteDialogText')}
          </DialogContentText>
          {user?.email && (
            <DialogContentText sx={{ color: 'black', fontWeight: 'bold', mt: 1 }}>
              {user.email}
            </DialogContentText>
          )}
          <DialogContentText sx={{ color: 'black', mt: 1 }}>
            {t('deleteAccountGeneric')}
          </DialogContentText>
          {deleteError && (
            <Typography color="error" sx={{ mt: 1 }}>
              Error: {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('deleteDialogCancel')}</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            {t('deleteDialogConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};