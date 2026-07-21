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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
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
}

export const ApplicationTable = ({
  applications,
  onEdit,
  onDelete,
  onRowClick,
}: ApplicationTableProps) => {
  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
  };

  return (
    <TableContainer component={Paper}>
      <Table>
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
};