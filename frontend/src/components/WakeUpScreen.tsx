// frontend/src/components/WakeUpScreen.tsx
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

interface WakeUpScreenProps {
  secondsLeft: number;
  isWaiting: boolean;
}

export const WakeUpScreen = ({ secondsLeft, isWaiting }: WakeUpScreenProps) => {
  const { t } = useLanguage();
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
          {t('serverWakingUp')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('serverWakeUpDescription')}
          <br />
          {t('thankYouPatience')}
        </Typography>
        <LinearProgress
          variant={isIndeterminate ? 'indeterminate' : 'determinate'}
          value={isIndeterminate ? undefined : progress}
          sx={{ height: 10, borderRadius: 5 }}
        />
        {isWaiting && secondsLeft > 0 && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            {secondsLeft} {t('secondsRemaining')}
          </Typography>
        )}
        {!isWaiting && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            {t('initializingConnection')}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};