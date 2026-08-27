import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

export const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  itemName = 'this application',
}: DeleteConfirmationDialogProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ color: 'black' }}>{t('confirmDeletion')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'black' }}>
          {t('deleteConfirmMessage', { itemName })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};