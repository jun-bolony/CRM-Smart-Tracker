// frontend/src/pages/ApplicationDetailPage.tsx
import { useEffect, useState, useCallback, useRef, memo } from 'react';
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
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { ArrowBack, GetApp, CloudUpload, Edit, Delete, Close as CloseIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import type { Application, ApplicationStatus } from '../types/Application';
import { getApplication, updateApplication, deleteApplication } from '../services/api';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { saveFileWithPicker } from '../utils/fileUtils';
import { DragDropImport } from '../components/DragDropImport';
import { scrollbarSx } from '../styles/scrollbar';

const statusOptions: ApplicationStatus[] = [
  'Sent',
  'Viewed',
  'Interview',
  'Test',
  'Offer',
  'Rejected',
  'Archived',
];

const statusGradientMap: Record<ApplicationStatus, string> = {
  Sent: 'linear-gradient(170deg, #EDF5FF 20%, #AAC8FF 100%)',
  Viewed: 'linear-gradient(170deg, #EFF8FF 20%, #ADDDFF 100%)',
  Interview: 'linear-gradient(170deg, #EEEAFF 20%, #C1B2FF 100%)',
  Test: 'linear-gradient(170deg, #FFF9ED 20%, #FFDCA0 100%)',
  Offer: 'linear-gradient(170deg, #F0FFEA 20%, #A1E88D 100%)',
  Rejected: 'linear-gradient(170deg, #FFEFF1 20%, #FFB2BA 100%)',
  Archived: 'linear-gradient(170deg, #FCFCFC 20%, #E2E2E2 100%)',
};

const statusColorMap: Record<ApplicationStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  Sent: 'info',
  Viewed: 'info',
  Interview: 'primary',
  Test: 'warning',
  Offer: 'success',
  Rejected: 'error',
  Archived: 'default',
};

// Component for displaying standard fields with full text wrap support
const FieldValue = memo(({ value, href }: { value: string; href?: string }) => {
  const content = (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#f9f9f9',
        borderRadius: 4,
        py: 0.5,
        px: 1,
        textAlign: 'center',
        border: '1px solid #f0f0f0',
        minHeight: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mt: 0.5,
      }}
    >
      <Typography
        sx={{
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          fontSize: '0.85rem',
          ...(href ? { color: 'primary.main', textDecoration: 'none' } : {}),
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: '100%' }}>{content}</a>;
  }

  return content;
});

// Component for inline fields (Label on left, value on right)
const InlineField = ({ label, value }: { label: string, value: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
    <Typography variant="caption" sx={{ fontWeight: 'bold', width: '60px', textAlign: 'left', flexShrink: 0 }}>
      {label}
    </Typography>
    <Box sx={{
      flex: 1,
      backgroundColor: '#f9f9f9',
      borderRadius: 4,
      py: 0.5,
      px: 1,
      textAlign: 'center',
      border: '1px solid #f0f0f0',
      minHeight: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
       <Typography sx={{ fontSize: '0.85rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>
         {value}
       </Typography>
    </Box>
  </Box>
);

const CharacteristicsLabel = ({ label }: { label: string }) => (
  <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0, textAlign: 'center', display: 'block', width: '100%' }}>
    {label}
  </Typography>
);

const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

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

  const handleDeleteNote = async (index: number) => {
    if (!application) return;
    const currentNotes = application.notes || [];
    const updatedNotes = currentNotes.filter((_, i) => i !== index);
    try {
      const updated = await updateApplication(application._id!, { notes: updatedNotes });
      setApplication(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to delete note');
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

  const formatDateShort = (date?: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
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

  const processImportFile = useCallback(async (file: File) => {
    if (!application) return;
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
    }
  }, [application]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processImportFile(file);
    }
    event.target.value = '';
  }, [processImportFile]);

  const handleDropFile = useCallback((files: FileList) => {
    if (files.length > 0) {
      processImportFile(files[0]);
    }
  }, [processImportFile]);

  if (loading) {
    return (
      <Box sx={{ ...scrollbarSx, height: '100%', overflowY: 'auto' }}>
        <LoadingSpinner />
      </Box>
    );
  }

  if (!application) {
    return (
      <Box sx={{ ...scrollbarSx, height: '100%', overflowY: 'auto' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h6">Application not found</Typography>
          <Button onClick={handleBack} startIcon={<ArrowBack />}>
            Back to list
          </Button>
        </Container>
      </Box>
    );
  }

  const salaryDisplay = application.salaryMin != null && application.salaryMax != null
    ? `${application.salaryMin} - ${application.salaryMax}`
    : application.salaryMin != null
    ? `${application.salaryMin} >`
    : application.salaryMax != null
    ? `< ${application.salaryMax}`
    : '-';

  return (
    <Box sx={{ ...scrollbarSx, height: '100%', overflowY: 'auto' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Toolbar with conditionally hidden button text on mobile */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 1,
          '& .MuiButton-root': { 
            minWidth: 0, 
            paddingLeft: { xs: 1, sm: 2 }, 
            paddingRight: { xs: 1, sm: 2 },
            flexShrink: 0,
          }
        }}>
          <Button onClick={handleBack} startIcon={<ArrowBack />}>
            {!isMobile && 'Back to list'}
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit this application">
              <Button startIcon={<Edit />} onClick={handleEdit}>
                {!isMobile && 'Edit'}
              </Button>
            </Tooltip>
            <Tooltip title="Delete this application">
              <Button startIcon={<Delete />} onClick={handleDeleteClick} color="error">
                {!isMobile && 'Delete'}
              </Button>
            </Tooltip>
            <Tooltip title="Export this application for backup or sharing.">
              <Button startIcon={<GetApp />} onClick={handleExport}>
                {!isMobile && 'Export'}
              </Button>
            </Tooltip>
            <Tooltip title="Import from JSON to update this application.">
              <Button startIcon={<CloudUpload />} onClick={handleImportClick}>
                {!isMobile && 'Import'}
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

        <Divider sx={{ mb: 1 }} />

        <DragDropImport
          onDrop={handleDropFile}
          accept=".json"
          multiple={false}
          onError={(err) => setError(err)}
        >
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            {/* Top Header Panel */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 3,
                py: 2,
                background: statusGradientMap[application.status] || statusGradientMap.Archived,
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              <Chip
                label={application.status}
                color={statusColorMap[application.status]}
                size="medium"
                sx={{ fontWeight: 'bold', width: 'fit-content' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#555' }}>Next Event</Typography>
                <Box sx={{ backgroundColor: '#fff', px: 2, py: 0.5, borderRadius: 4, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {formatDateShort(application.nextEventDate)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Main characteristics block structured with dividers */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, p: 3, gap: { xs: 3, md: 0 } }}>
              
              {/* Column 1: Status Change & Date */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, pr: { md: 2 } }}>
                <Box sx={{ textAlign: 'center', px: 2 }}>
                  <Typography variant="h6" gutterBottom>Change Status</Typography>
                  <FormControl fullWidth size="small">
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
                
                <Box sx={{ textAlign: 'center', px: 3, mt: 9 }}>
                  <CharacteristicsLabel label="Applied Date" />
                  <FieldValue value={formatDateShort(application.appliedDate)} />
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

              {/* Column 2: Company, Position & Unified Contact Panel */}
              <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0, px: { md: 3 } }}>
                  <InlineField label="Company" value={application.company} />
                  <InlineField label="Position" value={application.position} />

                  <Box sx={{ mt: 3.3, width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>Contact</Typography>
                    
                    {/* Unified 2-line Contact block */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Name</Typography>
                          <Box sx={{ flex: 1, backgroundColor: '#f9f9f9', borderRadius: 4, py: 0.5, px: 1, textAlign: 'center', border: '1px solid #f0f0f0', minHeight: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography sx={{ fontSize: '0.85rem', wordBreak: 'break-word', whiteSpace: 'normal' }}>{application.contact?.name || '-'}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Phone</Typography>
                          <Box sx={{ flex: 1, backgroundColor: '#f9f9f9', borderRadius: 4, py: 0.5, px: 1, textAlign: 'center', border: '1px solid #f0f0f0', minHeight: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography sx={{ fontSize: '0.85rem', wordBreak: 'break-word', whiteSpace: 'normal' }}>{application.contact?.phone || '-'}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Email</Typography>
                        <Box sx={{ flex: 1, backgroundColor: '#f9f9f9', borderRadius: 4, py: 0.5, px: 1, textAlign: 'center', border: '1px solid #f0f0f0', minHeight: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: '0.85rem', wordBreak: 'break-word', whiteSpace: 'normal' }}>{application.contact?.email || '-'}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

              {/* Column 3: Salary, Source, URL */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.2, minWidth: 0, pl: { md: 2 } }}>
                  <CharacteristicsLabel label="Salary" />
                  <FieldValue value={salaryDisplay} />

                  <CharacteristicsLabel label="Source" />
                  <FieldValue value={application.source || '-'} />

                  <CharacteristicsLabel label="URL" />
                  <FieldValue value={application.url || '-'} href={application.url} />
              </Box>
            </Box>

            <Divider sx={{ my: 0 }} />

            {/* Split Bottom Block for Notes and History */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, p: 3, gap: { xs: 3, md: 0 } }}>
              
              {/* Notes Half */}
              <Box sx={{ flex: 1, pr: { md: 2 } }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>Notes</Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
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

                {application.notes && application.notes.length > 0 ? (
                  <List dense sx={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    ...scrollbarSx
                  }}>
                    {application.notes.slice().reverse().map((note, index, arr) => {
                      const originalIndex = arr.length - 1 - index; // index in original array
                      return (
                        <ListItem
                          key={originalIndex}
                          divider={index < arr.length - 1}
                          sx={{ px: 0, display: 'flex', alignItems: 'flex-start' }}
                          secondaryAction={
                            <Tooltip title="Delete this note">
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDeleteNote(originalIndex)}
                                sx={{ color: 'error.main' }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          }
                        >
                          <ListItemText
                            primary={note}
                            secondary={`Note ${arr.length - index}`}
                            sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem', wordBreak: 'break-word', whiteSpace: 'normal' } }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">No notes yet.</Typography>
                )}
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 2 }} />

              {/* Status History Half */}
              <Box sx={{ flex: 1, pl: { md: 2 } }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>Status History</Typography>
                {application.statusHistory && application.statusHistory.length > 0 ? (
                  <List dense sx={{ 
                    maxHeight: '350px', 
                    overflowY: 'auto',
                    ...scrollbarSx
                  }}>
                    {application.statusHistory
                      .slice()
                      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
                      .map((item, index, arr) => (
                        <ListItem key={index} divider={index < arr.length - 1} sx={{ px: 0, py: 1.5, alignItems: 'flex-start', flexDirection: 'column' }}>
                          <Chip
                              label={item.status}
                              color={statusColorMap[item.status] || 'default'}
                              size="small"
                              sx={{ fontWeight: 'bold', fontSize: '0.75rem', width: 'fit-content', mb: 0.5 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            Changed at: {formatDate(item.changedAt)}
                          </Typography>
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">No status history.</Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </DragDropImport>

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
    </Box>
  );
};

export default ApplicationDetailPage;