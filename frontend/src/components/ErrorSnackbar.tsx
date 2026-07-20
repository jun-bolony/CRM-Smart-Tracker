import { Snackbar, Alert } from '@mui/material';

interface Props {
  open: boolean;
  message: string;
  severity?: 'error' | 'info' | 'success' | 'warning';
  onClose: () => void;
}

export const ErrorSnackbar = ({ open, message, severity = 'error', onClose }: Props) => (
  <Snackbar open={open} autoHideDuration={6000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
    <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
);