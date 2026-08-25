// frontend/src/components/WakeUpScreen.tsx
import { Box, Typography, LinearProgress, Paper } from '@mui/material';

interface WakeUpScreenProps {
  secondsLeft: number;
  isWaiting: boolean;
}

export const WakeUpScreen = ({ secondsLeft, isWaiting }: WakeUpScreenProps) => {
  const progress = isWaiting && secondsLeft > 0 ? ((60 - secondsLeft) / 60) * 100 : 0;
  const isIndeterminate = !isWaiting || secondsLeft === 0;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        zIndex: 9999,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '90%',
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Server is waking up... 🚀
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          This project runs on a free server. It takes about 60 seconds to start.
          <br />
          Thank you for your patience!
        </Typography>
        <LinearProgress
          variant={isIndeterminate ? 'indeterminate' : 'determinate'}
          value={isIndeterminate ? undefined : progress}
          sx={{ height: 10, borderRadius: 5 }}
        />
        {isWaiting && secondsLeft > 0 && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            {secondsLeft} seconds remaining
          </Typography>
        )}
        {!isWaiting && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Initializing connection...
          </Typography>
        )}
      </Paper>
    </Box>
  );
};