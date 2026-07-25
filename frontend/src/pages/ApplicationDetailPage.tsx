import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import type { Application, ApplicationStatus } from '../types/Application';
import { getApplication, updateApplication } from '../services/api';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import { LoadingSpinner } from '../components/LoadingSpinner';

const statusOptions: ApplicationStatus[] = [
  'Sent',
  'Viewed',
  'Interview',
  'Test',
  'Offer',
  'Rejected',
  'Archived',
];

const statusColorMap: Record<ApplicationStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  Sent: 'info',
  Viewed: 'info',
  Interview: 'primary',
  Test: 'warning',
  Offer: 'success',
  Rejected: 'error',
  Archived: 'default',
};

const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // For adding notes
  const [newNote, setNewNote] = useState<string>('');

  // For status change
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');

  const loadApplication = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getApplication(id);
      setApplication(data);
      setSelectedStatus(data.status);
    } catch (err: any) {
      setError(err.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleStatusChange = async (event: SelectChangeEvent<ApplicationStatus>) => {
    const newStatus = event.target.value as ApplicationStatus;
    if (!application) return;
    if (newStatus === application.status) return; // no change

    try {
      const updated = await updateApplication(application._id!, { status: newStatus });
      setApplication(updated);
      setSelectedStatus(updated.status);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleAddNote = async () => {
    if (!application || !newNote.trim()) return;
    const currentNotes = application.notes || [];
    const updatedNotes = [...currentNotes, newNote.trim()];
    try {
      const updated = await updateApplication(application._id!, { notes: updatedNotes });
      setApplication(updated);
      setNewNote('');
    } catch (err: any) {
      setError(err.message || 'Failed to add note');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!application) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6">Application not found</Typography>
        <Button onClick={handleBack} startIcon={<ArrowBack />}>
          Back to list
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button onClick={handleBack} startIcon={<ArrowBack />} sx={{ mb: 2 }}>
        Back to list
      </Button>

      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1">
              {application.company}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {application.position}
            </Typography>
          </Box>
          <Chip
            label={application.status}
            color={statusColorMap[application.status] || 'default'}
            size="medium"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Main information */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 2,
          }}
        >
          {application.url && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">URL</Typography>
              <Typography>
                <a href={application.url} target="_blank" rel="noopener noreferrer">
                  {application.url}
                </a>
              </Typography>
            </Box>
          )}
          {application.source && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Source</Typography>
              <Typography>{application.source}</Typography>
            </Box>
          )}
          {application.salaryMin !== undefined && application.salaryMax !== undefined && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Salary</Typography>
              <Typography>
                {application.salaryMin} - {application.salaryMax}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Applied Date</Typography>
            <Typography>{formatDate(application.appliedDate)}</Typography>
          </Box>
          {application.nextEventDate && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Next Event</Typography>
              <Typography>{formatDate(application.nextEventDate)}</Typography>
            </Box>
          )}
          {application.contact && (application.contact.name || application.contact.email || application.contact.phone) && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
              <Typography>
                {application.contact.name && `Name: ${application.contact.name}`}
                {application.contact.email && `, Email: ${application.contact.email}`}
                {application.contact.phone && `, Phone: ${application.contact.phone}`}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Status change */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Change Status</Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={selectedStatus}
              label="Status"
              onChange={handleStatusChange}
            >
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Notes */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Notes</Typography>
          {application.notes && application.notes.length > 0 ? (
            <List dense>
              {application.notes.map((note, index) => (
                <ListItem key={index} divider>
                  <ListItemText primary={note} secondary={`Note ${index + 1}`} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">No notes yet.</Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              label="Add note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              fullWidth
              size="small"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
            />
            <Button variant="contained" onClick={handleAddNote} disabled={!newNote.trim()}>
              Add
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Status History */}
        <Box>
          <Typography variant="h6" gutterBottom>Status History</Typography>
          {application.statusHistory && application.statusHistory.length > 0 ? (
            <List dense>
              {application.statusHistory
                .slice()
                .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
                .map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={
                        <Chip
                          label={item.status}
                          color={statusColorMap[item.status] || 'default'}
                          size="small"
                        />
                      }
                      secondary={`Changed at: ${formatDate(item.changedAt)}`}
                    />
                  </ListItem>
                ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">No status history.</Typography>
          )}
        </Box>
      </Paper>

      <ErrorSnackbar
        open={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />
    </Container>
  );
};

export default ApplicationDetailPage;