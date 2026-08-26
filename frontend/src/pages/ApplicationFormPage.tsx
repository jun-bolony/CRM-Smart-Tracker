// frontend/src/pages/ApplicationFormPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Box, Divider, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import type { Application } from '../types/Application';
import { getApplication, createApplication, updateApplication } from '../services/api';
import { ApplicationForm } from '../components/ApplicationForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import { scrollbarSx } from '../styles/scrollbar';

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
          if (data.source === undefined) data.source = '';
          setInitialData(data);
        } catch (err: any) {
          setError(err.message || 'Failed to load application');
        } finally {
          setLoading(false);
        }
      };
      loadApplication();
    } else {
      setInitialData({ source: '' });
      setLoading(false);
    }
  }, [id, isEdit]);

  const handleSubmit = async (
    data: Partial<Application>
  ) => {
    setError(null);
    const payload = {
      ...data,
      source: data.source || '',
    };
    try {
      if (isEdit && id) {
        await updateApplication(id, payload);
      } else {
        await createApplication(payload as Omit<Application, '_id' | 'createdAt' | 'updatedAt' | 'statusHistory'>);
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
    return (
      <Box sx={{ ...scrollbarSx, height: '100%', overflowY: 'auto' }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box sx={{ ...scrollbarSx, height: '100%', overflowY: 'auto' }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleCancel}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              Back
            </Button>
          </Box>
          <Box sx={{ flex: '1 1 auto', textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'normal',
                textAlign: 'center',
              }}
            >
              {isEdit ? 'Edit Application' : 'Create Application'}
            </Typography>
          </Box>
          <Box sx={{ flex: '0.1 0 auto' }} />
        </Box>

        <Divider sx={{ mb: 1 }} />

        <Container
          maxWidth="md"
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
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
      </Box>
    </Box>
  );
};

export default ApplicationFormPage;