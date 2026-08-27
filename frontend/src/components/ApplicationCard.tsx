// frontend/src/components/ApplicationCard.tsx
import { memo, useRef } from 'react';
import { Box, Typography, IconButton, Chip, Tooltip } from '@mui/material';
import { Edit, Delete, GetApp, CloudUpload } from '@mui/icons-material';
import type { Application, ApplicationStatus } from '../types/Application';
import { useLanguage } from '../context/LanguageContext';

// Gradient maps matching the visual requirements for statuses
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

interface ApplicationCardProps {
  application: Application;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRowClick?: (id: string) => void;
  onExportSingle: (id: string) => void;
  onImportSingle: (id: string, file: File) => void;
}

// Helper component for text truncation
const TruncatedText = ({ text, sx }: { text: string; sx?: object }) => (
  <Tooltip title={text} placement="top" arrow>
    <Typography
      sx={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...sx
      }}
    >
      {text}
    </Typography>
  </Tooltip>
);

const ApplicationCard = memo(({
  application,
  onEdit,
  onDelete,
  onRowClick,
  onExportSingle,
  onImportSingle,
}: ApplicationCardProps) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US');
  };

  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && application._id) {
      onImportSingle(application._id, file);
    }
    event.target.value = '';
  };

  const handleImportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const latestNote = application.notes && application.notes.length > 0 
    ? application.notes[application.notes.length - 1] 
    : t('noNotesYet');
  
  const hasNotes = application.notes && application.notes.length > 0;

  const salaryDisplay = application.salaryMin != null && application.salaryMax != null
    ? `${application.salaryMin} - ${application.salaryMax}`
    : application.salaryMin != null
    ? `${application.salaryMin} >`
    : application.salaryMax != null
    ? `< ${application.salaryMax}`
    : '-';

  return (
    <Box
      onClick={() => onRowClick && application._id && onRowClick(application._id)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        backgroundColor: '#fff',
        overflow: 'hidden',
        cursor: onRowClick ? 'pointer' : 'default',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
        }
      }}
    >
      {/* Top Header Panel */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          background: statusGradientMap[application.status] || statusGradientMap.Archived,
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <Chip
          label={t('statuses.' + application.status)}
          color={statusColorMap[application.status]}
          size="small"
          sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#555' }}>{t('nextEventLabel')}</Typography>
          <Box sx={{ backgroundColor: '#fff', px: 1, py: 0.2, borderRadius: 2, border: '0px solid #e0e0e0' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {formatDate(application.nextEventDate)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Body */}
      <Box sx={{ display: 'flex', flexDirection: 'column', p: 1.5, gap: 1.2 }}>
        
        {/* Company & Position */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, alignItems: 'stretch' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5, textAlign: 'center' }}>{t('company')}</Typography>
            <Box sx={{ width: '100%', backgroundColor: '#f9f9f9', borderRadius: 4, py: 0.5, px: 1, textAlign: 'center', border: '1px solid #f0f0f0' }}>
              <TruncatedText text={application.company} sx={{ fontSize: '0.85rem' }} />
            </Box>
          </Box>
          <Box sx={{ width: '1px', backgroundColor: '#f0f0f0', my: 0 }} />
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, alignItems: 'stretch' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5, textAlign: 'center' }}>{t('position')}</Typography>
            <Box sx={{ width: '100%', backgroundColor: '#f9f9f9', borderRadius: 4, py: 0.5, px: 1, textAlign: 'center', border: '1px solid #f0f0f0' }}>
              <TruncatedText text={application.position} sx={{ fontSize: '0.85rem' }} />
            </Box>
          </Box>
        </Box>

        {/* Salary */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: '50px', mr: '50px' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', width: '60px', textAlign: 'center' }}>{t('salary')}</Typography>
          <Box sx={{ flex: 1, backgroundColor: '#f9f9f9', borderRadius: 4, py: 0.5, px: 2, textAlign: 'center', border: '1px solid #f0f0f0' }}>
             <TruncatedText text={salaryDisplay} sx={{ fontSize: '0.85rem' }} />
          </Box>
        </Box>

        {/* Source */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: '50px', mr: '50px' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', width: '60px', textAlign: 'center' }}>{t('source')}</Typography>
          <Box sx={{ flex: 1, backgroundColor: '#f9f9f9', borderRadius: 4, py: 0.5, px: 2, textAlign: 'center', border: '1px solid #f0f0f0' }}>
             <TruncatedText text={application.source || '-'} sx={{ fontSize: '0.85rem' }} />
          </Box>
        </Box>

        {/* Notes & Row Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, mt: 0 }}>
          <Box 
            sx={{ 
              flex: 1, 
              minWidth: 0,
              backgroundColor: hasNotes ? '#fdfdfd' : '#f5f5f5', 
              border: '1px solid #e0e0e0', 
              borderRadius: 2, 
              p: 1,
              background: hasNotes ? 'linear-gradient(180deg, #FFEEBF 0%, #FFFBEA 55%)' : '#f5f5f5',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>{t('note')}</Typography>
            <TruncatedText text={latestNote} sx={{ fontSize: '0.8rem', color: hasNotes ? 'text.primary' : 'text.secondary' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{t('actions')}</Typography>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                if (application._id) onEdit(application._id);
              }}
              sx={{ p: 0.5 }}
            >
              <Edit fontSize="small" sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ height: '1px', backgroundColor: '#f0f0f0', width: '70%', my: -0.3 }} />

        {/* Footer: Date & Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{t('appliedDateLabel')}</Typography>
            <Box sx={{ backgroundColor: '#f9f9f9', px: 1, py: 0.2, borderRadius: 2, border: '0px solid #e0e0e0' }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                {formatDate(application.appliedDate)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
             <Tooltip title={t('exportThisApplication')}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); if (application._id) onExportSingle(application._id); }}>
                <GetApp sx={{ fontSize: '1.1rem', color: '#555' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('importFromJSON')}>
              <IconButton size="small" onClick={handleImportClick}>
                <CloudUpload sx={{ fontSize: '1.1rem', color: '#555' }} />
                <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportChange} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('delete')}>
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); if (application._id) onDelete(application._id); }}>
                <Delete sx={{ fontSize: '1.1rem' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

      </Box>
    </Box>
  );
});

export { ApplicationCard };