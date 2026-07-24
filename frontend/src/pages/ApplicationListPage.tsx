import { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Dashboard as DashboardIcon, Logout as LogoutIcon, GetApp as ExportIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import { ApplicationTable } from '../components/ApplicationTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { getApplications, deleteApplication } from '../services/api';
import type { Application, ApplicationStatus, ApplicationQueryParams } from '../types/Application';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

const statusOptions: ApplicationStatus[] = [
  'Sent',
  'Viewed',
  'Interview',
  'Test',
  'Offer',
  'Rejected',
  'Archived',
];

const sourceOptions = ['LinkedIn', 'DOU', 'Recommendation', 'Company Website', 'Other'];

export const ApplicationListPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'appliedDate' | 'nextEventDate' | 'salaryMax'>('appliedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Export menu
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ApplicationQueryParams = {
        search: search || undefined,
        status: statusFilter.length > 0 ? statusFilter.join(',') : undefined,
        source: sourceFilter || undefined,
        sortBy,
        sortOrder,
      };
      const data = await getApplications(params);
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (e: SelectChangeEvent<typeof statusFilter>) => {
    const value = e.target.value;
    setStatusFilter(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSourceChange = (e: SelectChangeEvent<string>) => {
    setSourceFilter(e.target.value);
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
    setSourceFilter('');
    setSortBy('appliedDate');
    setSortOrder('desc');
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteApplication(deleteId);
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Failed to delete application');
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

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

  const convertToCSV = (data: Application[]): string => {
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
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      // Fetch all applications (with a high limit)
      const allApps = await getApplications({ limit: 10000 });
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(allApps, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `applications_${new Date().toISOString().slice(0,10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const csv = convertToCSV(allApps);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `applications_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    }
    handleExportClose();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            CRM Smart Tracker
          </Typography>
          <ThemeToggle />
          <Button color="inherit" onClick={() => navigate('/dashboard')} startIcon={<DashboardIcon />}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
          <Button color="inherit" startIcon={<ExportIcon />} onClick={handleExportClick}>
            Export
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
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
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
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Source</InputLabel>
              <Select
                value={sourceFilter}
                onChange={handleSourceChange}
                label="Source"
              >
                <MenuItem value="">All</MenuItem>
                {sourceOptions.map((src) => (
                  <MenuItem key={src} value={src}>
                    {src}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
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
            <FormControl size="small" sx={{ minWidth: 100 }}>
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
            <Button variant="outlined" onClick={handleResetFilters}>
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
      </Container>
    </>
  );
};