import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  company: string;
  position: string;
}

export const DeleteConfirmationDialog = ({ open, onClose, onConfirm, company, position }: Props) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Delete Application</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete the application for <strong>{company}</strong> – <strong>{position}</strong>?
        This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
    </DialogActions>
  </Dialog>
);