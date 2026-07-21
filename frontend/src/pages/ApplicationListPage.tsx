import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Box, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import type { Application } from '../types/Application';
import { getApplications, deleteApplication } from '../services/api';
import { ApplicationTable } from '../components/ApplicationTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';

export const ApplicationListPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    const app = applications.find((a) => a._id === id);
    if (app) {
      setDeleteId(id);
      setDeleteName(`${app.company} - ${app.position}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteApplication(deleteId);
      setApplications((prev) => prev.filter((a) => a._id !== deleteId));
      setDeleteId(null);
      setDeleteName('');
    } catch (err: any) {
      setError(err.message || 'Failed to delete application');
      setDeleteId(null);
      setDeleteName('');
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteName('');
  };

  const handleRowClick = (id: string) => {
    navigate(`/detail/${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Applications</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => navigate('/new')}
        >
          Add Application
        </Button>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <ApplicationTable
          applications={applications}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={handleRowClick}
        />
      )}

      <ErrorSnackbar
        open={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />

      <DeleteConfirmationDialog
        open={!!deleteId}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={deleteName}
      />
    </Container>
  );
};