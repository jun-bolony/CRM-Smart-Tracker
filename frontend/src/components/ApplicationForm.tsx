// frontend/src/components/ApplicationForm.tsx
import { useState, useEffect, memo } from 'react';
import type { FormEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import type { Application, ApplicationStatus } from '../types/Application';
import { useLanguage } from '../context/LanguageContext';

const statusOptions: ApplicationStatus[] = [
  'Sent',
  'Viewed',
  'Interview',
  'Test',
  'Offer',
  'Rejected',
  'Archived',
];

interface ApplicationFormProps {
  initialData?: Partial<Application>;
  onSubmit: (data: Partial<Application>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const ApplicationForm = memo(({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: ApplicationFormProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Omit<Application, '_id' | 'createdAt' | 'updatedAt' | 'statusHistory'>>({
    company: '',
    position: '',
    url: '',
    contact: { name: '', email: '', phone: '' },
    salaryMin: undefined,
    salaryMax: undefined,
    source: '',
    status: 'Sent',
    appliedDate: new Date().toISOString().split('T')[0],
    nextEventDate: '',
    notes: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      const applied = initialData.appliedDate
        ? new Date(initialData.appliedDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      const nextEvent = initialData.nextEventDate
        ? new Date(initialData.nextEventDate).toISOString().split('T')[0]
        : '';
      setFormData({
        company: initialData.company || '',
        position: initialData.position || '',
        url: initialData.url || '',
        contact: {
          name: initialData.contact?.name || '',
          email: initialData.contact?.email || '',
          phone: initialData.contact?.phone || '',
        },
        salaryMin: initialData.salaryMin,
        salaryMax: initialData.salaryMax,
        source: initialData.source || '',
        status: initialData.status || 'Sent',
        appliedDate: applied,
        nextEventDate: nextEvent,
        notes: initialData.notes || [],
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleContactChange = (field: keyof NonNullable<Application['contact']>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.company.trim()) newErrors.company = t('companyRequired');
    if (!formData.position.trim()) newErrors.position = t('positionRequired');
    if (!formData.status) newErrors.status = t('statusRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const dataToSend = {
        ...formData,
        appliedDate: new Date(formData.appliedDate).toISOString(),
        nextEventDate: formData.nextEventDate ? new Date(formData.nextEventDate).toISOString() : undefined,
        contact: {
          name: formData.contact?.name || undefined,
          email: formData.contact?.email || undefined,
          phone: formData.contact?.phone || undefined,
        },
        url: formData.url || undefined,
        source: formData.source || undefined,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        notes: formData.notes,
      };
      onSubmit(dataToSend as any);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* Row 1: Company + Status */}
        <Box sx={{ flex: '3 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label={t('companyRequired')}
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            error={!!errors.company}
            helperText={errors.company}
            required
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(1% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel>{t('statusRequired')}</InputLabel>
            <Select
              value={formData.status}
              label={t('statusRequired')}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {t('statuses.' + s)}
                </MenuItem>
              ))}
            </Select>
            {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
          </FormControl>
        </Box>

        {/* Row 2: Position + Next Event Date */}
        <Box sx={{ flex: '3 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label={t('positionRequired')}
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            error={!!errors.position}
            helperText={errors.position}
            required
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(1% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label={t('nextEventDate')}
            type="date"
            value={formData.nextEventDate}
            onChange={(e) => handleChange('nextEventDate', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        {/* Row 3: Job URL + Source */}
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label={t('jobUrl')}
            value={formData.url}
            onChange={(e) => handleChange('url', e.target.value)}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label={t('sourceLabel')}
            value={formData.source}
            onChange={(e) => handleChange('source', e.target.value)}
          />
        </Box>

        {/* Row 4: Two columns (left: salary block + contact email, right: notes) */}
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: '200px' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Salary Min + Salary Max on same line */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
              <TextField
                fullWidth
                label={t('salaryMin')}
                type="number"
                value={formData.salaryMin ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const parsed = value === '' ? null : Number(value);
                  handleChange('salaryMin', (parsed !== null && !isNaN(parsed)) ? parsed : null);
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
              <TextField
                fullWidth
                label={t('salaryMax')}
                type="number"
                value={formData.salaryMax ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const parsed = value === '' ? null : Number(value);
                  handleChange('salaryMax', (parsed !== null && !isNaN(parsed)) ? parsed : null);
                }}
              />
            </Box>
          </Box>
          {/* Contact Email */}
          <Box>
            <TextField
              fullWidth
              label={t('contactEmail')}
              value={formData.contact?.email || ''}
              onChange={(e) => handleContactChange('email', e.target.value)}
            />
          </Box>
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label={t('notesPlaceholder')}
            multiline
            rows={5}
            value={formData.notes?.join('\n') || ''}
            onChange={(e) =>
              handleChange(
                'notes',
                e.target.value.split('\n').filter((line) => line.trim() !== '')
              )
            }
            sx={{ height: '100%' }}
          />
        </Box>

        {/* Row 5: Contact Phone + Contact Name */}
        <Box sx={{ flex: '1 1 calc(5% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label={t('contactPhone')}
            value={formData.contact?.phone || ''}
            onChange={(e) => handleContactChange('phone', e.target.value)}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(60% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label={t('contactName')}
            value={formData.contact?.name || ''}
            onChange={(e) => handleContactChange('name', e.target.value)}
          />
        </Box>

        {/* Row 6: Applied Date */}
        <Box sx={{ flex: '1 1 calc(1% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label={t('appliedDateLabel')}
            type="date"
            value={formData.appliedDate}
            onChange={(e) => handleChange('appliedDate', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: '200px' } }} /> {/* Empty spacer for symmetry */}

        {/* Buttons */}
        <Box sx={{ flex: '1 1 100%', display: 'flex', gap: 2, justifyContent: 'flex-end', mt: -1 }}>
          <Button onClick={onCancel}>{t('cancel')}</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? t('update') : t('create')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
});

export { ApplicationForm };