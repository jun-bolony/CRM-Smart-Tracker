import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Box, Divider, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import type { Application } from '../types/Application';
import { getApplication, createApplication, updateApplication } from '../services/api';
import { ApplicationForm } from '../components/ApplicationForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorSnackbar } from '../components/ErrorSnackbar';

// Custom scrollbar styling to match the requested design
const pageScrollbarSx = {
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '14px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#c1c1c1',
    borderRadius: '8px',
    border: '3px solid #f1f1f1',
    backgroundClip: 'padding-box',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#a8a8a8',
  },
  '&::-webkit-scrollbar-button:vertical:decrement': {
    display: 'block',
    height: '14px',
    backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'%23999999\'><path d=\'M7 14l5-5 5 5z\'/></svg>")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  '&::-webkit-scrollbar-button:vertical:increment': {
    display: 'block',
    height: '14px',
    backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'%23999999\'><path d=\'M7 10l5 5 5-5z\'/></svg>")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
};

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
          // Ensure fields are always present
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
      <Box sx={pageScrollbarSx}>
        <LoadingSpinner />
      </Box>
    );
  }

  // New rendering structure
  return (
    <Box sx={pageScrollbarSx}>
      {/* Outer wrapper box with padding (reduced from p:4 to p:2) */}
      <Box sx={{ p: 2 }}>
        {/* ToolBar box for Back button and title (3-column layout for centering title) */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          {/* Column 1: Back Button */}
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
          {/* Column 2: Typography Title */}
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
          {/* Column 3: Empty space (matches Column 1 width) */}
          <Box sx={{ flex: '0.1 0 auto' }} />
        </Box>

        {/* Divider */}
        <Divider sx={{ mb: 1 }} />

        {/* Container for the form, centered with maxWidth="md" and reduced padding */}
        <Container
          maxWidth="md" // Changed from "lg" to "md" to limit width
          sx={{
            p: 2, // Reduced from p:4 to p:2
            bgcolor: 'background.paper', // Background color for form
            borderRadius: 2, // Rounded corners
            boxShadow: 1, // Shadow
          }}
        >
          {/* application form and error snackbar */}
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