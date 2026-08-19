// frontend/src/components/GlobalGradientWrapper.tsx
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import type { FC, ReactNode } from 'react';

interface GlobalGradientWrapperProps {
  children: ReactNode;
}

export const GlobalGradientWrapper: FC<GlobalGradientWrapperProps> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        flex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Left Gradient Bar */}
      <Box
        sx={{
          width: { xs: 98, sm: 122, md: 146 },
          flexShrink: 0,
          height: '100%',
          background: 'linear-gradient(135deg, #DBCE97 20%, #8CAF94 45%, #6788B5 100%)',
        }}
      />
      
      {/* Central Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'background.default',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>

      {/* Right Gradient Bar */}
      <Box
        sx={{
          width: { xs: 98, sm: 122, md: 146 },
          flexShrink: 0,
          height: '100%',
          background: 'linear-gradient(135deg, #DBCE97 20%, #8CAF94 45%, #6788B5 100%)',
        }}
      />
    </Box>
  );
};