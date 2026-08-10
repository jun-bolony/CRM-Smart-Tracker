import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import type { Application } from '../types/Application';
import { ApplicationCard } from './ApplicationCard';

interface ApplicationCardListProps {
  applications: Application[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRowClick?: (id: string) => void;
  onExportSingle: (id: string) => void;
  onImportSingle: (id: string, file: File) => void;
}

const ApplicationCardList = memo(({
  applications,
  onEdit,
  onDelete,
  onRowClick,
  onExportSingle,
  onImportSingle,
}: ApplicationCardListProps) => {
  
  if (applications.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No applications found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)'
        },
        gap: 3,
        pb: 2
      }}
    >
      {applications.map((app) => (
        <ApplicationCard
          key={app._id}
          application={app}
          onEdit={onEdit}
          onDelete={onDelete}
          onRowClick={onRowClick}
          onExportSingle={onExportSingle}
          onImportSingle={onImportSingle}
        />
      ))}
    </Box>
  );
});

export { ApplicationCardList };