import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Button,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Add } from '@mui/icons-material';
import type { Application, ApplicationStatus, ApplicationQueryParams } from '../types/Application';
import { getApplications, deleteApplication } from '../services/api';
import { ApplicationTable } from '../components/ApplicationTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';

const statusOptions: ApplicationStatus[] = [
  'Sent',
  'Viewed',
  'Interview',
  'Test',
  'Offer',
  'Rejected',
  'Archived',
];

export const ApplicationListPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<ApplicationQueryParams['sortBy']>('appliedDate');
  const [sortOrder, setSortOrder] = useState<ApplicationQueryParams['sortOrder']>('desc');

  // Build filters object — convert status array to comma-separated string
  const buildFilters = useCallback((): ApplicationQueryParams => {
    const filters: ApplicationQueryParams = {
      sortBy,
      sortOrder,
    };
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    if (selectedStatuses.length > 0) {
      filters.status = selectedStatuses.join(',');
    }
    if (sourceFilter.trim()) {
      filters.source = sourceFilter.trim();
    }
    return filters;
  }, [searchTerm, selectedStatuses, sourceFilter, sortBy, sortOrder]);

  const loadData = useCallback(
    async (filters: ApplicationQueryParams) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getApplications(filters);
        setApplications(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load data when filters change (with debounce for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters = buildFilters();
      loadData(filters);
    }, 500);
    return () => clearTimeout(timer);
  }, [buildFilters, loadData]);

  // Initial load (on mount) – the effect above runs on mount anyway
  useEffect(() => {
    // No extra logic needed, the debounced effect will run once.
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    const app = applications.find((a) => a._id === id);
    if (app) {
      setDeleteId(id);
      setDeleteName(`${app.company} - ${app.position}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteApplication(deleteId);
      setApplications((prev) => prev.filter((a) => a._id !== deleteId));
      setDeleteId(null);
      setDeleteName('');
    } catch (err: any) {
      setError(err.message || 'Failed to delete application');
      setDeleteId(null);
      setDeleteName('');
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteName('');
  };

  const handleRowClick = (id: string) => {
    navigate(`/detail/${id}`);
  };

  const handleStatusChange = (event: SelectChangeEvent<typeof selectedStatuses>) => {
    const value = event.target.value;
    setSelectedStatuses(typeof value === 'string' ? value.split(',') as ApplicationStatus[] : value);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
    setSourceFilter('');
    setSortBy('appliedDate');
    setSortOrder('desc');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Applications</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/new')}
          >
            Add Application
          </Button>
        </Box>
      </Box>

      {/* Filter Bar with visible backgrounds */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          mb: 3,
        }}
      >
        <TextField
          label="Search"
          placeholder="Company or position"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{
            minWidth: 200,
            backgroundColor: 'background.paper',
            borderRadius: 1,
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <FormControl
          size="small"
          sx={{
            minWidth: 200,
            backgroundColor: 'background.paper',
            borderRadius: 1,
          }}
        >
          <InputLabel id="status-filter-label" shrink>
            Status
          </InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            multiple
            value={selectedStatuses}
            onChange={handleStatusChange}
            input={<OutlinedInput label="Status" notched />}
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

        <TextField
          label="Source"
          placeholder="e.g. LinkedIn"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          size="small"
          sx={{
            minWidth: 150,
            backgroundColor: 'background.paper',
            borderRadius: 1,
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <FormControl
          size="small"
          sx={{
            minWidth: 150,
            backgroundColor: 'background.paper',
            borderRadius: 1,
          }}
        >
          <InputLabel id="sort-by-label" shrink>
            Sort By
          </InputLabel>
          <Select
            labelId="sort-by-label"
            id="sort-by"
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value as ApplicationQueryParams['sortBy'])}
            input={<OutlinedInput label="Sort By" notched />}
          >
            <MenuItem value="appliedDate">Applied Date</MenuItem>
            <MenuItem value="nextEventDate">Next Event</MenuItem>
            <MenuItem value="salaryMax">Salary Max</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{
            minWidth: 120,
            backgroundColor: 'background.paper',
            borderRadius: 1,
          }}
        >
          <InputLabel id="sort-order-label" shrink>
            Order
          </InputLabel>
          <Select
            labelId="sort-order-label"
            id="sort-order"
            value={sortOrder}
            label="Order"
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            input={<OutlinedInput label="Order" notched />}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" size="small" onClick={handleResetFilters}>
          Reset
        </Button>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <ApplicationTable
          applications={applications}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={handleRowClick}
        />
      )}

      <ErrorSnackbar
        open={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />

      <DeleteConfirmationDialog
        open={!!deleteId}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={deleteName}
      />
    </Container>
  );
};