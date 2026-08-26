// frontend/src/components/GlobalNavBar.tsx
import { Box, Typography, Button, useMediaQuery, useTheme, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Logout as LogoutIcon, Menu as MenuIcon, Close as CloseIcon, DeleteForever as DeleteForeverIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import type { FC } from 'react';
import { deleteAccount } from '../services/api';

const NAV_HIDE_BREAKPOINT = 'sm'; // Breakpoint at which nav bar hides and sidebar appears

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

export const GlobalNavBar: FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(NAV_HIDE_BREAKPOINT));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Determine if we are on an edit or detail page and extract the id
  const pathname = location.pathname;
  const editMatch = pathname.match(/^\/edit\/(.+)/);
  const detailMatch = pathname.match(/^\/detail\/(.+)/);
  const applicationId = editMatch?.[1] || detailMatch?.[1] || null;

  // Helper to build button config
  const getButtonConfig = (type: 'edit' | 'detail') => {
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
        tooltip: 'Active when viewing an application\'s edit or detail page.',
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
        tooltip: 'Active when viewing an application\'s edit or detail page.',
      };
    }
  };

  const editConfig = getButtonConfig('edit');
  const detailConfig = getButtonConfig('detail');

  // Handler for navigation
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

  // Render a nav button:
  // - If active or has targetPath -> use NavTab (with appropriate active flag)
  // - Otherwise (no targetPath, not active) -> use NavLink with Tooltip
  const renderNavButton = (label: string, config: { active: boolean; targetPath: string | null; tooltip: string | null }) => {
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
            {/* Mobile toggle tab */}
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

            {/* Sidebar Navigation Panel */}
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
                {/* Row 1: Main tabs */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <NavTab
                    label="Applications"
                    active={location.pathname === '/'}
                    onClick={() => handleNavigateMain('/')}
                  />
                  <NavTab
                    label="Dashboard"
                    active={location.pathname === '/dashboard'}
                    onClick={() => handleNavigateMain('/dashboard')}
                  />
                </Box>

                {/* Row 2: Secondary links (Edit & Detail) */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  {renderNavButton('Edit Page', editConfig)}
                  <NavDivider />
                  {renderNavButton('Detailed Application', detailConfig)}
                </Box>

                {/* Row 3: Logout and Delete Account (icon only) */}
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
                      LOGOUT
                    </Typography>
                  </Button>

                  <Tooltip title="Delete your account and all data (irreversible)">
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
            {/* Left Navigation Zone */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NavTab
                label="Applications"
                active={location.pathname === '/'}
                onClick={() => navigate('/')}
              />

              <NavDivider />

              <NavTab
                label="Dashboard"
                active={location.pathname === '/dashboard'}
                onClick={() => navigate('/dashboard')}
              />
            </Box>

            {/* Center Title Zone */}
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

            {/* Right Navigation Zone */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {renderNavButton('Edit Page', editConfig)}
              <NavDivider />
              {renderNavButton('Detailed Application', detailConfig)}

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
                  LOGOUT
                </Typography>
              </Button>

              <Tooltip title="Delete your account and all data (irreversible)">
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

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'black' }}>Delete Account?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'black' }}>
            This action is <strong>irreversible</strong>. All your applications, notes, and personal data will be permanently removed from the server.
            {user?.email && (
              <>
                {' '}Are you sure you want to delete the account for <strong>{user.email}</strong>?
              </>
            )}
            {!user?.email && (
              <> Are you sure you want to delete your account?</>
            )}
          </DialogContentText>
          {deleteError && (
            <Typography color="error" sx={{ mt: 1 }}>
              Error: {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};