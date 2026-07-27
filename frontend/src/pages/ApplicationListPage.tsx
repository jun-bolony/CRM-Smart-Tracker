import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  AppBar,
  Toolbar,
  Paper,
  Menu,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Dashboard as DashboardIcon, Logout as LogoutIcon, GetApp as ExportIcon, CloudUpload as ImportIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import { ApplicationTable } from '../components/ApplicationTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { getApplications, deleteApplication, createApplication, updateApplication } from '../services/api';
import type { Application, ApplicationStatus, ApplicationQueryParams } from '../types/Application';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import Papa from 'papaparse';

const statusOptions: ApplicationStatus[] = [
  'Sent',
  'Viewed',
  'Interview',
  'Test',
  'Offer',
  'Rejected',
  'Archived',
];

// Helper to save file with file picker (if supported) with proper cancel handling
const saveFileWithPicker = async (blob: Blob, suggestedName: string, mimeType: string): Promise<boolean> => {
  // Check if File System Access API is available
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: mimeType === 'application/json' ? 'JSON file' : 'CSV file',
            accept: { [mimeType]: ['.' + (mimeType === 'application/json' ? 'json' : 'csv')] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true; // success
    } catch (err: any) {
      // User cancelled or error – do NOT fallback to download
      if (err.name === 'AbortError' || err.message?.includes('abort')) {
        // User cancelled – silently ignore
        return false;
      }
      // Other error – rethrow to be handled by caller
      throw err;
    }
  }
  // Fallback: create link and trigger download (no file picker)
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = suggestedName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
  return true;
};

const ApplicationListPage = memo(() => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'appliedDate' | 'nextEventDate' | 'salaryMax'>('appliedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sources options - loaded from existing applications
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Export menu
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  // Import file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to load sources from applications
  const loadSources = useCallback(async () => {
    try {
      const allApps = await getApplications({ limit: 10000 });
      const sourcesSet = new Set<string>();
      allApps.forEach(app => {
        if (app.source) {
          sourcesSet.add(app.source);
        }
      });
      setSourceOptions(Array.from(sourcesSet));
    } catch (err) {
      console.error('Failed to load sources from applications', err);
    }
  }, []);

  // Load sources on mount
  useEffect(() => {
    loadSources();
  }, [loadSources]);

  // Memoize query params
  const queryParams = useMemo<ApplicationQueryParams>(() => ({
    search: search || undefined,
    status: statusFilter.length > 0 ? statusFilter.join(',') : undefined,
    source: sourceFilter.length > 0 ? sourceFilter.join(',') : undefined,
    sortBy,
    sortOrder,
  }), [search, statusFilter, sourceFilter, sortBy, sortOrder]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplications(queryParams);
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (e: SelectChangeEvent<typeof statusFilter>) => {
    const value = e.target.value;
    setStatusFilter(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSourceChange = (e: SelectChangeEvent<typeof sourceFilter>) => {
    const value = e.target.value;
    setSourceFilter(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSortByChange = (e: SelectChangeEvent<typeof sortBy>) => {
    setSortBy(e.target.value as typeof sortBy);
  };

  const handleSortOrderChange = (e: SelectChangeEvent<typeof sortOrder>) => {
    setSortOrder(e.target.value as typeof sortOrder);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter([]);
    setSourceFilter([]);
    setSortBy('appliedDate');
    setSortOrder('desc');
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    try {
      await deleteApplication(deleteId);
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchApplications();
      loadSources(); // update sources after deletion
      setSuccessMessage('Application deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete application');
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  }, [deleteId, fetchApplications, loadSources]);

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Export handlers
  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const convertToCSV = useCallback((data: Application[]): string => {
    if (!data.length) return '';
    const headers = [
      'Company', 'Position', 'Status', 'Applied Date', 'Source',
      'Salary Min', 'Salary Max', 'URL', 'Contact Name', 'Contact Email',
      'Contact Phone', 'Notes', 'Next Event Date', 'Created At', 'Updated At'
    ];
    const rows = data.map(app => [
      app.company,
      app.position,
      app.status,
      app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '',
      app.source || '',
      app.salaryMin ?? '',
      app.salaryMax ?? '',
      app.url || '',
      app.contact?.name || '',
      app.contact?.email || '',
      app.contact?.phone || '',
      (app.notes || []).join('; '),
      app.nextEventDate ? new Date(app.nextEventDate).toLocaleDateString() : '',
      app.createdAt ? new Date(app.createdAt).toLocaleString() : '',
      app.updatedAt ? new Date(app.updatedAt).toLocaleString() : '',
    ]);
    const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;
    const headerLine = headers.map(h => escape(h)).join(',');
    const rowLines = rows.map(row => row.map(cell => escape(String(cell))).join(','));
    return [headerLine, ...rowLines].join('\n');
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'json') => {
    try {
      const allApps = await getApplications({ limit: 10000 });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      let blob: Blob;
      let suggestedName: string;
      let mimeType: string;
      if (format === 'json') {
        blob = new Blob([JSON.stringify(allApps, null, 2)], { type: 'application/json' });
        suggestedName = `applications_${timestamp}.json`;
        mimeType = 'application/json';
      } else {
        const csv = convertToCSV(allApps);
        blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        suggestedName = `applications_${timestamp}.csv`;
        mimeType = 'text/csv';
      }
      const saved = await saveFileWithPicker(blob, suggestedName, mimeType);
      if (saved) {
        setSuccessMessage(`File exported successfully as ${suggestedName}`);
      }
      // If cancelled, do nothing
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    }
    handleExportClose();
  }, [convertToCSV]);

  // --- Import handlers ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let parsedData: any[] = [];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const json = JSON.parse(text);
        parsedData = Array.isArray(json) ? json : [json];
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        parsedData = result.data;
      } else {
        setError('Unsupported file format. Please upload JSON or CSV.');
        return;
      }

      // Convert parsed data to application objects
      const applicationsToProcess = parsedData.map((item: any) => {
        const mapped: any = {};
        const keys = Object.keys(item);
        keys.forEach(key => {
          const lowerKey = key.toLowerCase().trim();
          const value = item[key];
          if (value === null || value === undefined) return;

          switch (lowerKey) {
            case '_id':
              mapped._id = String(value);
              break;
            case 'company':
              mapped.company = String(value);
              break;
            case 'position':
              mapped.position = String(value);
              break;
            case 'status':
              mapped.status = String(value);
              break;
            case 'applieddate':
            case 'applied date':
              mapped.appliedDate = value;
              break;
            case 'source':
              mapped.source = String(value);
              break;
            case 'salarymin':
            case 'salary min':
              mapped.salaryMin = typeof value === 'number' ? value : parseFloat(value) || undefined;
              break;
            case 'salarymax':
            case 'salary max':
              mapped.salaryMax = typeof value === 'number' ? value : parseFloat(value) || undefined;
              break;
            case 'url':
              mapped.url = String(value);
              break;
            case 'contact name':
              if (!mapped.contact) mapped.contact = {};
              mapped.contact.name = String(value);
              break;
            case 'contact email':
              if (!mapped.contact) mapped.contact = {};
              mapped.contact.email = String(value);
              break;
            case 'contact phone':
              if (!mapped.contact) mapped.contact = {};
              mapped.contact.phone = String(value);
              break;
            case 'notes':
              if (Array.isArray(value)) {
                mapped.notes = value.map(v => String(v));
              } else if (typeof value === 'string') {
                mapped.notes = value.split(';').map(s => s.trim()).filter(Boolean);
              } else {
                mapped.notes = [];
              }
              break;
            case 'nexteventdate':
            case 'next event date':
              mapped.nextEventDate = value;
              break;
            // ignore others
          }
        });

        // Ensure required fields
        if (!mapped.company || !mapped.position) {
          throw new Error('Each application must have company and position');
        }
        if (!mapped.status || !statusOptions.includes(mapped.status as ApplicationStatus)) {
          mapped.status = 'Sent';
        }
        return mapped;
      });

      // Fetch all existing applications to check for duplicates
      const existingApps = await getApplications({ limit: 10000 });

      // Process each application: create or update
      let createdCount = 0;
      let updatedCount = 0;
      const errors: string[] = [];

      for (const appData of applicationsToProcess) {
        try {
          // Find existing by _id if present, else by company+position (case-insensitive)
          let existing: Application | undefined;
          if (appData._id) {
            existing = existingApps.find(a => a._id === appData._id);
          }
          if (!existing) {
            existing = existingApps.find(a =>
              a.company.toLowerCase() === appData.company.toLowerCase() &&
              a.position.toLowerCase() === appData.position.toLowerCase()
            );
          }

          // Remove statusHistory before updating to avoid conflicts
          delete appData.statusHistory;

          if (existing) {
            // Update existing application (except statusHistory)
            await updateApplication(existing._id!, appData);
            updatedCount++;
          } else {
            // Create new application
            delete appData._id;
            await createApplication(appData);
            createdCount++;
          }
        } catch (err: any) {
          errors.push(`Failed to process ${appData.company} - ${appData.position}: ${err.message}`);
        }
      }

      // Show summary
      let summary = `Import completed: ${createdCount} created, ${updatedCount} updated.`;
      if (errors.length > 0) {
        summary += ` Errors: ${errors.join('; ')}`;
        setError(summary);
      } else {
        setSuccessMessage(summary);
        setError(null);
      }

      // Refresh data
      await fetchApplications();
      await loadSources();

    } catch (err: any) {
      setError(err.message || 'Failed to import data');
    } finally {
      event.target.value = '';
    }
  };

  // --- Export single application ---
  const handleExportSingle = useCallback(async (id: string) => {
    try {
      const app = applications.find(a => a._id === id);
      if (!app) throw new Error('Application not found');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const blob = new Blob([JSON.stringify(app, null, 2)], { type: 'application/json' });
      const suggestedName = `application_${app.company}_${app.position}_${timestamp}.json`;
      const saved = await saveFileWithPicker(blob, suggestedName, 'application/json');
      if (saved) {
        setSuccessMessage(`Application exported successfully as ${suggestedName}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export application');
    }
  }, [applications]);

  // --- Import single application (update) ---
  const handleImportSingle = useCallback(async (id: string, file: File) => {
    try {
      const text = await file.text();
      let data: any;
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else {
        setError('Only JSON format is supported for single application import.');
        return;
      }
      // Remove statusHistory to avoid conflict
      delete data.statusHistory;
      await updateApplication(id, data);
      fetchApplications();
      loadSources();
      setSuccessMessage('Application imported successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to import application');
    }
  }, [fetchApplications, loadSources]);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            CRM Smart Tracker
          </Typography>
          <ThemeToggle />
          <Button color="inherit" onClick={() => navigate('/dashboard')} startIcon={<DashboardIcon />} sx={{ ml: 1 }}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Dashboard</Box>
          </Button>
          <Button color="inherit" onClick={handleImportClick} startIcon={<ImportIcon />} sx={{ ml: 1 }}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Import</Box>
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json,.csv"
            onChange={handleImportFileChange}
          />
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ ml: 1 }}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Logout</Box>
          </Button>
          <Button color="inherit" startIcon={<ExportIcon />} onClick={handleExportClick} sx={{ ml: 1 }}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Export</Box>
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={() => handleExport('csv')}>Export CSV</MenuItem>
            <MenuItem onClick={() => handleExport('json')}>Export JSON</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Applications
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/new')}
          >
            Add Application
          </Button>
        </Box>

        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Search"
              value={search}
              onChange={handleSearchChange}
              size="small"
              sx={{ minWidth: { xs: '100%', sm: 200 }, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
            />
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={statusFilter}
                onChange={handleStatusChange}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
              <InputLabel>Source</InputLabel>
              <Select
                multiple
                value={sourceFilter}
                onChange={handleSourceChange}
                input={<OutlinedInput label="Source" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {sourceOptions.map((src) => (
                  <MenuItem key={src} value={src}>
                    {src}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 }, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={handleSortByChange}
                label="Sort By"
              >
                <MenuItem value="appliedDate">Applied Date</MenuItem>
                <MenuItem value="nextEventDate">Next Event</MenuItem>
                <MenuItem value="salaryMax">Salary Max</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 100 }, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={handleSortOrderChange}
                label="Order"
              >
                <MenuItem value="asc">Asc</MenuItem>
                <MenuItem value="desc">Desc</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={handleResetFilters} sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
              Reset Filters
            </Button>
          </Box>
        </Paper>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <ApplicationTable
            applications={applications}
            onEdit={(id: string) => navigate(`/edit/${id}`)}
            onDelete={handleDeleteClick}
            onRowClick={(id: string) => navigate(`/detail/${id}`)}
            onExportSingle={handleExportSingle}
            onImportSingle={handleImportSingle}
          />
        )}

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          onClose={handleDeleteCancel}
        />

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
      </Container>
    </>
  );
});

export default ApplicationListPage;