import { memo, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, GetApp, CloudUpload } from '@mui/icons-material';
import type { Application, ApplicationStatus } from '../types/Application';

const statusColorMap: Record<ApplicationStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  Sent: 'info',
  Viewed: 'info',
  Interview: 'primary',
  Test: 'warning',
  Offer: 'success',
  Rejected: 'error',
  Archived: 'default',
};

interface ApplicationTableProps {
  applications: Application[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRowClick?: (id: string) => void;
  onExportSingle: (id: string) => void;
  onImportSingle: (id: string, file: File) => void;
}

const ApplicationTable = memo(({
  applications,
  onEdit,
  onDelete,
  onRowClick,
  onExportSingle,
  onImportSingle,
}: ApplicationTableProps) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
  };

  const handleImportChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportSingle(id, file);
    }
    event.target.value = '';
  };

  const handleImportClick = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRefs.current[id]?.click();
  };

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Company</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Applied Date</TableCell>
            <TableCell>Next Event</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => (
            <TableRow
              key={app._id}
              hover
              onClick={() => onRowClick && app._id && onRowClick(app._id)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              <TableCell>{app.company}</TableCell>
              <TableCell>{app.position}</TableCell>
              <TableCell>
                <Chip
                  label={app.status}
                  color={statusColorMap[app.status] || 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>{formatDate(app.appliedDate)}</TableCell>
              <TableCell>{formatDate(app.nextEventDate)}</TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (app._id) onEdit(app._id);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (app._id) onDelete(app._id);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export as JSON">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (app._id) onExportSingle(app._id);
                      }}
                    >
                      <GetApp fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Import from JSON">
                    <IconButton
                      size="small"
                      component="span"
                      onClick={handleImportClick(app._id!)}
                    >
                      <CloudUpload fontSize="small" />
                      <input
                        type="file"
                        accept=".json"
                        ref={(el) => { fileInputRefs.current[app._id!] = el; }}
                        style={{ display: 'none' }}
                        onChange={handleImportChange(app._id!)}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {applications.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No applications found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export { ApplicationTable };