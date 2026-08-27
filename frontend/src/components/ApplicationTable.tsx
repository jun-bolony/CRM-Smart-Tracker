// frontend/src/components/ApplicationTable.tsx
import { memo, useRef } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
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
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
  };

  const handleImportChange = (id: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportSingle(id, file);
    }
    event.target.value = '';
  };

  const handleImportClick = (id: string) => (e: MouseEvent) => {
    e.stopPropagation();
    fileInputRefs.current[id]?.click();
  };

  return (
    <TableContainer
      component={Paper}
      elevation={1}
      sx={{
        // elevation is restored; parent provides padding so the shadow is not clipped
      }}
    >
      <Table stickyHeader sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: '20%', minWidth: 120 }}>{t('company')}</TableCell>
            <TableCell align="center" sx={{ width: '18%', minWidth: 120 }}>{t('position')}</TableCell>
            <TableCell align="center" sx={{ width: '8%', minWidth: 90 }}>{t('status')}</TableCell>
            <TableCell align="center" sx={{ width: '13%', minWidth: 100 }}>{t('appliedDate')}</TableCell>
            <TableCell align="center" sx={{ width: '10%', minWidth: 100 }}>{t('nextEvent')}</TableCell>
            <TableCell align="center" sx={{ width: '10%', minWidth: 100 }}>{t('source')}</TableCell>
            <TableCell align="center" sx={{ width: '10%', minWidth: 120 }}>{t('salary')}</TableCell>
            <TableCell align="center" sx={{ width: '14%', minWidth: 140 }}>{t('actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app, index) => (
            <TableRow
              key={app._id}
              hover
              onClick={() => onRowClick && app._id && onRowClick(app._id)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                backgroundColor: index % 2 === 0 ? '#F9F9F9' : 'transparent',
              }}
            >
              <TableCell align="center">{app.company}</TableCell>
              <TableCell align="center">{app.position}</TableCell>
              <TableCell align="center">
                <Chip
                  label={t('statuses.' + app.status)}
                  color={statusColorMap[app.status] || 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="center">{formatDate(app.appliedDate)}</TableCell>
              <TableCell align="center">{formatDate(app.nextEventDate)}</TableCell>
              <TableCell align="center">{app.source || '-'}</TableCell>
              <TableCell align="center">
                {app.salaryMin != null && app.salaryMax != null
                  ? `${app.salaryMin} - ${app.salaryMax}`
                  : app.salaryMin != null
                  ? `${app.salaryMin}`
                  : app.salaryMax != null
                  ? `${app.salaryMax}`
                  : '-'}
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Tooltip title={t('edit')}>
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
                  <Tooltip title={t('delete')}>
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
                  <Tooltip title={t('exportThisApplication')}>
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
                  <Tooltip title={t('importFromJSON')}>
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
              <TableCell align="center" colSpan={8}>
                {t('noApplicationsFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export { ApplicationTable };