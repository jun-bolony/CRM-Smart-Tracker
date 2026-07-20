import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Paper } from '@mui/material';
import type { Application } from '../types/Application';
import { applicationApi } from '../services/api';
import { ApplicationForm } from '../components/ApplicationForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorSnackbar } from '../components/ErrorSnackbar';

export const ApplicationFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [initialData, setInitialData] = useState<Partial<Application> | undefined>(undefined);
  const [loading, setLoading] = useState(isEdit);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await applicationApi.getOne(id!);
          setInitialData(data);
          setError(null);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setInitialData({});
    }
  }, [id, isEdit]);

  const handleSubmit = async (data: any) => {
    try {
      setSubmitLoading(true);
      if (isEdit) {
        await applicationApi.update(id!, data);
      } else {
        await applicationApi.create(data);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {isEdit ? 'Edit Application' : 'New Application'}
        </Typography>
        <ApplicationForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={submitLoading}
          error={error || undefined}
        />
      </Paper>
      <ErrorSnackbar
        open={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />
    </Container>
  );
};