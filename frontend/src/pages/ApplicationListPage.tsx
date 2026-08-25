// frontend/src/pages/ApplicationListPage.tsx
import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  Paper,
  Menu,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Dashboard as DashboardIcon, 
  GetApp as ExportIcon, 
  CloudUpload as ImportIcon,
  Window as GridViewIcon,
  ViewHeadline as ListViewIcon
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import { ApplicationTable } from '../components/ApplicationTable';
import { ApplicationCardList } from '../components/ApplicationCardList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { getApplications, deleteApplication, createApplication, updateApplication } from '../services/api';
import type { Application, ApplicationStatus, ApplicationQueryParams } from '../types/Application';
import Papa from 'papaparse';
import { saveFileWithPicker } from '../utils/fileUtils';
import { DragDropImport } from '../components/DragDropImport';

const statusOptions: ApplicationStatus[] = [
  'Sent',
  'Viewed',
  'Interview',
  'Test',
  'Offer',
  'Rejected',
  'Archived',
];

const filterInputSx = {
  background: 'linear-gradient(0deg, #f5f5f5 0%, #ffffff 0%)',
  color: 'text.primary',
  borderRadius: 1,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#9caf9',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#42a5f5',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1976d2',
  },
};

const ApplicationListPage = memo(() => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'appliedDate' | 'nextEventDate' | 'salaryMax'>('appliedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);

  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    return (localStorage.getItem('crm_view_preference') as 'card' | 'list') || 'card';
  });

  useEffect(() => {
    localStorage.setItem('crm_view_preference', viewMode);
  }, [viewMode]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      console.error('Failed to load sources', err);
    }
  }, []);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleStatusChange = (e: SelectChangeEvent<typeof statusFilter>) => {
    const value = e.target.value;
    setStatusFilter(typeof value === 'string' ? value.split(',') : value);
  };
  const handleSourceChange = (e: SelectChangeEvent<typeof sourceFilter>) => {
    const value = e.target.value;
    setSourceFilter(typeof value === 'string' ? value.split(',') : value);
  };
  const handleSortByChange = (e: SelectChangeEvent<typeof sortBy>) => setSortBy(e.target.value as typeof sortBy);
  const handleSortOrderChange = (e: SelectChangeEvent<typeof sortOrder>) => setSortOrder(e.target.value as typeof sortOrder);

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
      loadSources();
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

  const handleExportClick = (event: MouseEvent<HTMLButtonElement>) => {
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
      const result = await saveFileWithPicker(blob, suggestedName, mimeType);
      if (result.success) {
        setSuccessMessage(`File exported successfully as ${result.fileName || suggestedName}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    }
    handleExportClose();
  }, [convertToCSV]);

  const processImportFiles = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;

    const BATCH_SIZE = 5;
    let globalErrors: string[] = [];
    let totalCreated = 0;
    let totalUpdated = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
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
          globalErrors.push(`Unsupported file format: ${file.name}. Please upload JSON or CSV.`);
          continue;
        }

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
            }
          });

          if (!mapped.company || !mapped.position) {
            throw new Error('Each application must have company and position');
          }
          if (!mapped.status || !statusOptions.includes(mapped.status as ApplicationStatus)) {
            mapped.status = 'Sent';
          }
          return mapped;
        });

        const existingApps = await getApplications({ limit: 10000 });

        const batches = [];
        for (let j = 0; j < applicationsToProcess.length; j += BATCH_SIZE) {
          batches.push(applicationsToProcess.slice(j, j + BATCH_SIZE));
        }

        let fileErrors: string[] = [];
        let fileCreated = 0;
        let fileUpdated = 0;

        for (const batch of batches) {
          const promises = batch.map(async (appData: any) => {
            try {
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

              delete appData.statusHistory;

              if (existing) {
                await updateApplication(existing._id!, appData);
                fileUpdated++;
              } else {
                delete appData._id;
                await createApplication(appData);
                fileCreated++;
              }
            } catch (err: any) {
              return { error: `Failed to process ${appData.company}: ${err.message}` };
            }
            return null;
          });

          const results = await Promise.all(promises);
          const batchErrors = results.filter(r => r !== null).map(r => r!.error);
          fileErrors.push(...batchErrors);
        }

        totalCreated += fileCreated;
        totalUpdated += fileUpdated;
        globalErrors.push(...fileErrors);

      } catch (err: any) {
        globalErrors.push(`Failed to process file ${file.name}: ${err.message}`);
      }
    }

    try {
      await fetchApplications();
    } catch (fetchErr) {
      console.error('Error refreshing applications after import:', fetchErr);
    }
    try {
      await loadSources();
    } catch (sourceErr) {
      console.error('Error refreshing sources after import:', sourceErr);
    }

    if (globalErrors.length > 0) {
      const summary = `Import completed with errors. Created: ${totalCreated}, Updated: ${totalUpdated}. Errors: ${globalErrors.join('; ')}`;
      setError(summary);
      setSuccessMessage(null);
    } else {
      const summary = `Import successful: ${totalCreated} created, ${totalUpdated} updated.`;
      setSuccessMessage(summary);
      setError(null);
    }
  }, [fetchApplications, loadSources]);

  const handleImportFileInputChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      await processImportFiles(files);
    }
    event.target.value = '';
  }, [processImportFiles]);

  const handleExportSingle = useCallback(async (id: string) => {
    try {
      const app = applications.find(a => a._id === id);
      if (!app) throw new Error('Application not found');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const blob = new Blob([JSON.stringify(app, null, 2)], { type: 'application/json' });
      const suggestedName = `application_${app.company}_${app.position}_${timestamp}.json`;
      const result = await saveFileWithPicker(blob, suggestedName, 'application/json');
      if (result.success) {
        setSuccessMessage(`Application exported successfully as ${result.fileName || suggestedName}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export application');
    }
  }, [applications]);

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
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'transparent',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: { xs: 2, md: 4 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: 'background.default',
              minHeight: 0,
            }}
          >
            <DragDropImport
              onDrop={processImportFiles}
              accept=".json,.csv"
              multiple
              onError={(err) => setError(err)}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', lg: 'row' }, 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'stretch', lg: 'flex-start' }, 
                    gap: 4, 
                    mb: 1, 
                    flexShrink: 0 
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, mt: { lg: 5 } }}>
                    <Button
                      variant="outlined"
                      startIcon={<DashboardIcon />}
                      onClick={() => navigate('/dashboard')}
                      sx={{ 
                        borderRadius: '20px', 
                        fontWeight: 'bold', 
                        px: 3, 
                        py: 1,
                        color: '#1976d2',
                        border: '2px solid #1976d2',
                        background: 'linear-gradient(0deg, #EFFFEF 0%, #ffffff 100%)',
                        '&:hover': {
                          border: '2px solid #1565c0',
                          background: 'linear-gradient(0deg, #D7F4D7 0%, #ffffff 100%)',
                        }
                      }}
                    >
                      Dashboard
                    </Button>
                    
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.6,
                        backgroundColor: '#fff',
                        p: 0.5,
                        px: 0.7,
                        borderRadius: 6,
                        border: '1px solid #e0e0e0',
                        boxShadow: '0px 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <GridViewIcon 
                        onClick={() => setViewMode('card')}
                        sx={{ 
                          cursor: 'pointer', 
                          color: viewMode === 'card' ? '#666' : '#ccc',
                          transition: 'color 0.2s',
                          fontSize: '1.2rem'
                        }} 
                      />
                      <Box
                        onClick={() => setViewMode(prev => prev === 'card' ? 'list' : 'card')}
                        sx={{
                          width: 40,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: '#e0e0e0',
                          position: 'relative',
                          cursor: 'pointer',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 2,
                            left: viewMode === 'card' ? 2 : 21,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #a1e2a1 0%, #4facfe 100%)',
                            transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            boxShadow: '0px 1px 2px rgba(0,0,0,0.2)'
                          }}
                        />
                      </Box>
                      <ListViewIcon 
                        onClick={() => setViewMode('list')}
                        sx={{ 
                          cursor: 'pointer', 
                          color: viewMode === 'list' ? '#666' : '#ccc',
                          transition: 'color 0.2s',
                          fontSize: '1.2rem'
                        }} 
                      />
                    </Box>
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      flex: 1,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <TextField
                          label="Search"
                          value={search}
                          onChange={handleSearchChange}
                          size="small"
                          slotProps={{ inputLabel: { shrink: true } }}
                          sx={{ 
                            flex: { xs: '1 1 100%', sm: 1 },
                            '& .MuiOutlinedInput-root': filterInputSx
                          }}
                        />
                        <FormControl size="small" sx={{ flex: { xs: '1 1 100%', sm: 1 } }}>
                          <InputLabel shrink>Source</InputLabel>
                          <Select
                            multiple
                            value={sourceFilter}
                            onChange={handleSourceChange}
                            input={<OutlinedInput label="Source" notched />}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                  <Chip key={value} label={value} size="small" />
                                ))}
                              </Box>
                            )}
                            sx={filterInputSx}
                          >
                            {sourceOptions.length === 0 ? (
                              <MenuItem disabled>
                                No sources available.
                              </MenuItem>
                            ) : (
                              sourceOptions.map((src) => (
                                <MenuItem key={src} value={src}>
                                  {src}
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 100, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
                          <InputLabel shrink>Order</InputLabel>
                          <Select
                            value={sortOrder}
                            onChange={handleSortOrderChange}
                            label="Order"
                            notched
                            sx={filterInputSx}
                          >
                            <MenuItem value="asc">Asc</MenuItem>
                            <MenuItem value="desc">Desc</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ flex: { xs: '1 1 100%', sm: 1 } }}>
                          <InputLabel shrink>Status</InputLabel>
                          <Select
                            multiple
                            value={statusFilter}
                            onChange={handleStatusChange}
                            input={<OutlinedInput label="Status" notched />}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                  <Chip key={value} label={value} size="small" />
                                ))}
                              </Box>
                            )}
                            sx={filterInputSx}
                          >
                            {statusOptions.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ flex: { xs: '1 1 100%', sm: 1 } }}>
                          <InputLabel shrink>Sort By</InputLabel>
                          <Select
                            value={sortBy}
                            onChange={handleSortByChange}
                            label="Sort By"
                            notched
                            sx={filterInputSx}
                          >
                            <MenuItem value="appliedDate">Applied Date</MenuItem>
                            <MenuItem value="nextEventDate">Next Event</MenuItem>
                            <MenuItem value="salaryMax">Salary Max</MenuItem>
                          </Select>
                        </FormControl>
                        
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, minWidth: 150, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
                          <Button 
                            variant="outlined"
                            onClick={handleResetFilters} 
                            sx={{ 
                              borderRadius: '20px', 
                              fontWeight: 'bold', 
                              color: '#58A4E8',
                              border: '1px solid #4fc3f7',
                              background: 'linear-gradient(150deg, #e1f5fe 0%, #ffffff 60%)',
                              '&:hover': {
                                border: '1px solid #29b6f6',
                                background: 'linear-gradient(150deg, #b3e5fc 0%, #ffffff 80%)',
                              }
                            }}
                          >
                            Reset Filters
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'center', mt: { lg: 2 } }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/new')}
                      sx={{ 
                        fontWeight: 'bold', 
                        py: 1, 
                        px: 3, 
                        whiteSpace: 'nowrap', 
                        borderRadius: '8px',
                        color: '#000000',
                        border: '2px solid #1976d2',
                        background: 'linear-gradient(135deg, #E5FFE5 0%, #ffffff 60%)',
                        '&:hover': {
                          border: '2px solid #1565c0',
                          background: 'linear-gradient(135deg, #D7F4D7 0%, #ffffff 100%)',
                        }
                      }}
                    >
                      Add Application
                    </Button>
                    
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', width: '100%' }}>
                      <Tooltip title="Import all applications from CSV/JSON.">
                        <Button
                          variant="outlined"
                          startIcon={<ImportIcon />}
                          onClick={() => fileInputRef.current?.click()}
                          sx={{ 
                            borderRadius: '20px', 
                            flex: 1,
                            color: '#1976d2',
                            border: '1px solid #1976d2',
                            background: 'linear-gradient(90deg, #e3f2fd 0%, #ffffff 100%)',
                            '&:hover': {
                              border: '1px solid #1565c0',
                              background: 'linear-gradient(90deg, #bbdefb 0%, #ffffff 100%)',
                            }
                          }}
                        >
                          Import
                        </Button>
                      </Tooltip>
                      <Tooltip title="Export all applications as CSV or JSON.">
                        <Button
                          variant="outlined"
                          startIcon={<ExportIcon />}
                          onClick={handleExportClick}
                          sx={{ 
                            borderRadius: '20px', 
                            flex: 1,
                            color: '#1976d2',
                            border: '1px solid #1976d2',
                            background: 'linear-gradient(90deg, #e3f2fd 0%, #ffffff 100%)',
                            '&:hover': {
                              border: '1px solid #1565c0',
                              background: 'linear-gradient(90deg, #bbdefb 0%, #ffffff 100%)',
                            }
                          }}
                        >
                          Export
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ height: 1.85, backgroundColor: '#e0e0e0', width: '100%', mb: 1, flexShrink: 0 }} />
                
                <Box
                  className="table-scroll-container"
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto',
                    p: 0.5,
                  }}
                >
                  {loading ? (
                    <LoadingSpinner />
                  ) : viewMode === 'list' ? (
                    <ApplicationTable
                      applications={applications}
                      onEdit={(id: string) => navigate(`/edit/${id}`)}
                      onDelete={handleDeleteClick}
                      onRowClick={(id: string) => navigate(`/detail/${id}`)}
                      onExportSingle={handleExportSingle}
                      onImportSingle={handleImportSingle}
                    />
                  ) : (
                    <ApplicationCardList
                      applications={applications}
                      onEdit={(id: string) => navigate(`/edit/${id}`)}
                      onDelete={handleDeleteClick}
                      onRowClick={(id: string) => navigate(`/detail/${id}`)}
                      onExportSingle={handleExportSingle}
                      onImportSingle={handleImportSingle}
                    />
                  )}
                </Box>

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

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".json,.csv"
                  onChange={handleImportFileInputChange}
                />
                <Menu
                  anchorEl={exportAnchorEl}
                  open={Boolean(exportAnchorEl)}
                  onClose={handleExportClose}
                >
                  <MenuItem onClick={() => handleExport('csv')}>Export CSV</MenuItem>
                  <MenuItem onClick={() => handleExport('json')}>Export JSON</MenuItem>
                </Menu>

              </Box>
            </DragDropImport>
          </Box>
        </Box>
      </Box>
    </>
  );
});

export default ApplicationListPage;