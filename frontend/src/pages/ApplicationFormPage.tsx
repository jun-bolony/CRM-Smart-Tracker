import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import type { Application } from '../types/Application';
import { getApplication, createApplication, updateApplication } from '../services/api';
import { ApplicationForm } from '../components/ApplicationForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorSnackbar } from '../components/ErrorSnackbar';

const ApplicationFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [initialData, setInitialData] = useState<Partial<Application> | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      const loadApplication = async () => {
        try {
          const data = await getApplication(id);
          setInitialData(data);
        } catch (err: any) {
          setError(err.message || 'Failed to load application');
        } finally {
          setLoading(false);
        }
      };
      loadApplication();
    } else {
      setInitialData({});
      setLoading(false);
    }
  }, [id, isEdit]);

  const handleSubmit = async (
    data: Omit<Application, '_id' | 'createdAt' | 'updatedAt' | 'statusHistory'>
  ) => {
    setError(null);
    try {
      if (isEdit && id) {
        await updateApplication(id, data);
      } else {
        await createApplication(data);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to save application');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <ApplicationForm
        initialData={initialData || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={isEdit}
      />
      <ErrorSnackbar
        open={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />
    </Container>
  );
};

export default ApplicationFormPage;