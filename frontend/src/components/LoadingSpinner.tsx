import { CircularProgress, Box } from '@mui/material';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ fullScreen = false }: LoadingSpinnerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
      }}
    >
      <CircularProgress />
    </Box>
  );
};