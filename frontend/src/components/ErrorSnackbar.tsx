import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface ErrorSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
}

export const ErrorSnackbar = ({
  open,
  message,
  severity = 'error',
  onClose,
}: ErrorSnackbarProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};