import { useEffect, useState, useCallback, useRef } from 'react';
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
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import { ArrowBack, GetApp, CloudUpload, Edit, Delete } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import type { Application, ApplicationStatus } from '../types/Application';
import { getApplication, updateApplication, deleteApplication } from '../services/api';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { saveFileWithPicker } from '../utils/fileUtils';

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const [newNote, setNewNote] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (newStatus === application.status) return;

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

  const handleEdit = () => {
    if (id) navigate(`/edit/${id}`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      await deleteApplication(id);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete application');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const handleExport = async () => {
    if (!application) return;
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const blob = new Blob([JSON.stringify(application, null, 2)], { type: 'application/json' });
      const suggestedName = `application_${application.company}_${application.position}_${timestamp}.json`;
      const result = await saveFileWithPicker(blob, suggestedName, 'application/json');
      if (result.success) {
        setSuccessMessage(`Application exported successfully as ${result.fileName || suggestedName}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export application');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !application) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      delete data.statusHistory;
      const updated = await updateApplication(application._id!, data);
      setApplication(updated);
      setSelectedStatus(updated.status);
      setSuccessMessage('Application imported successfully');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to import application');
    } finally {
      event.target.value = '';
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button onClick={handleBack} startIcon={<ArrowBack />}>
          Back to list
        </Button>
        <Box>
          <Tooltip title="Edit this application">
            <Button startIcon={<Edit />} onClick={handleEdit} sx={{ mr: 1 }}>
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="Delete this application">
            <Button startIcon={<Delete />} onClick={handleDeleteClick} color="error" sx={{ mr: 1 }}>
              Delete
            </Button>
          </Tooltip>
          <Tooltip title="Export this application for backup or sharing.">
            <Button startIcon={<GetApp />} onClick={handleExport} sx={{ mr: 1 }}>
              Export
            </Button>
          </Tooltip>
          <Tooltip title="Import from JSON to update this application.">
            <Button startIcon={<CloudUpload />} onClick={handleImportClick}>
              Import
            </Button>
          </Tooltip>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleImportFileChange}
          />
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
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
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Next Event</Typography>
            <Typography>{formatDate(application.nextEventDate)}</Typography>
          </Box>
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
              slotProps={{ inputLabel: { shrink: true } }}
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

      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
      />
    </Container>
  );
};

export default ApplicationDetailPage;