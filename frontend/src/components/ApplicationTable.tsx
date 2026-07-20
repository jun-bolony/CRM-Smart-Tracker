import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Box } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { Application, ApplicationStatus } from '../types/Application';
import { useNavigate } from 'react-router-dom';

interface Props {
  applications: Application[];
  onDeleteClick: (app: Application) => void;
}

const statusColors: Record<ApplicationStatus, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
  Sent: 'default',
  Viewed: 'primary',
  Interview: 'secondary',
  Test: 'warning',
  Offer: 'success',
  Rejected: 'error',
  Archived: 'default',
};

export const ApplicationTable = ({ applications, onDeleteClick }: Props) => {
  const navigate = useNavigate();

  const formatDate = (date?: string | Date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Company</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Applied</TableCell>
            <TableCell>Salary</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app._id} hover>
              <TableCell>{app.company}</TableCell>
              <TableCell>{app.position}</TableCell>
              <TableCell>
                <Chip label={app.status} color={statusColors[app.status] || 'default'} size="small" />
              </TableCell>
              <TableCell>{formatDate(app.appliedDate)}</TableCell>
              <TableCell>
                {app.salaryMin && app.salaryMax ? `${app.salaryMin} - ${app.salaryMax}` :
                  app.salaryMin ? `from ${app.salaryMin}` :
                  app.salaryMax ? `up to ${app.salaryMax}` : '-'}
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => navigate(`/edit/${app._id}`)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton size="small" onClick={() => onDeleteClick(app)} color="error">
                  <Delete />
                </IconButton>
                <IconButton size="small" onClick={() => navigate(`/detail/${app._id}`)} color="info">
                  <Visibility />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {applications.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">No applications yet. Create your first one!</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};