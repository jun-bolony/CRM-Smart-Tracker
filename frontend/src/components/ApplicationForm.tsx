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
        salaryMin: initialData.salaryMin, // keep as is (0 is valid)
        salaryMax: initialData.salaryMax, // keep as is (0 is valid)
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
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.status) newErrors.status = 'Status is required';
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
        // Salary fields - keep as is (may be null, number, or undefined)
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        notes: formData.notes?.length ? formData.notes : undefined,
      };
      // Cast to any to avoid type issues with null values (parent expects Partial<Application>)
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
            label="Company "
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            error={!!errors.company}
            helperText={errors.company}
            required
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(1% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel>Status *</InputLabel>
            <Select
              value={formData.status}
              label="Status *"
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
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
            label="Position "
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
            label="Next Event Date"
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
            label="Job URL"
            value={formData.url}
            onChange={(e) => handleChange('url', e.target.value)}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label="Source"
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
                label="Salary Min"
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
                label="Salary Max"
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
              label="Contact Email"
              value={formData.contact?.email || ''}
              onChange={(e) => handleContactChange('email', e.target.value)}
            />
          </Box>
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label="Notes (one per line)"
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
            label="Contact Phone"
            value={formData.contact?.phone || ''}
            onChange={(e) => handleContactChange('phone', e.target.value)}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(60% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label="Contact Name"
            value={formData.contact?.name || ''}
            onChange={(e) => handleContactChange('name', e.target.value)}
          />
        </Box>

        {/* Row 6: Applied Date */}
        <Box sx={{ flex: '1 1 calc(1% - 8px)', minWidth: { xs: '100%', sm: '200px' } }}>
          <TextField
            fullWidth
            label="Applied Date"
            type="date"
            value={formData.appliedDate}
            onChange={(e) => handleChange('appliedDate', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: '200px' } }} /> {/* Empty spacer for symmetry */}

        {/* Buttons */}
        <Box sx={{ flex: '1 1 100%', display: 'flex', gap: 2, justifyContent: 'flex-end', mt: -1 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
});

export { ApplicationForm };