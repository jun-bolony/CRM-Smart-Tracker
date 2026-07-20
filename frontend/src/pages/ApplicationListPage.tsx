import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Typography, Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import type { Application } from '../types/Application';
import { applicationApi } from '../services/api';
import { ApplicationTable } from '../components/ApplicationTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';

export const ApplicationListPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; app: Application | null }>({ open: false, app: null });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getAll();
      setApplications(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDeleteClick = (app: Application) => {
    setDeleteDialog({ open: true, app });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.app) return;
    try {
      await applicationApi.delete(deleteDialog.app._id!);
      setApplications((prev) => prev.filter((a) => a._id !== deleteDialog.app!._id));
      setDeleteDialog({ open: false, app: null });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, app: null });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Applications</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/new')}>
          Add
        </Button>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <ApplicationTable applications={applications} onDeleteClick={handleDeleteClick} />
      )}

      {deleteDialog.app && (
        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          company={deleteDialog.app.company}
          position={deleteDialog.app.position}
        />
      )}

      <ErrorSnackbar
        open={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />
    </Container>
  );
};