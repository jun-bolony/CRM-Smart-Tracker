import { useEffect, useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Grid,
  FormHelperText,
} from '@mui/material';
import type { Application, ApplicationStatus } from '../types/Application';

interface Props {
  initialData?: Partial<Application>;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  error?: string;
}

const STATUSES: ApplicationStatus[] = ['Sent', 'Viewed', 'Interview', 'Test', 'Offer', 'Rejected', 'Archived'];

export const ApplicationForm = ({ initialData, onSubmit, loading, error }: Props) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    url: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    salaryMin: '',
    salaryMax: '',
    source: '',
    status: 'Sent' as ApplicationStatus,
    appliedDate: new Date().toISOString().split('T')[0],
    nextEventDate: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company || '',
        position: initialData.position || '',
        url: initialData.url || '',
        contactName: initialData.contact?.name || '',
        contactEmail: initialData.contact?.email || '',
        contactPhone: initialData.contact?.phone || '',
        salaryMin: initialData.salaryMin?.toString() || '',
        salaryMax: initialData.salaryMax?.toString() || '',
        source: initialData.source || '',
        status: initialData.status || 'Sent',
        appliedDate: initialData.appliedDate ? new Date(initialData.appliedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        nextEventDate: initialData.nextEventDate ? new Date(initialData.nextEventDate).toISOString().split('T')[0] : '',
        notes: initialData.notes?.join('\n') || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      company: formData.company,
      position: formData.position,
      url: formData.url || undefined,
      contact: {
        name: formData.contactName || undefined,
        email: formData.contactEmail || undefined,
        phone: formData.contactPhone || undefined,
      },
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
      source: formData.source || undefined,
      status: formData.status,
      appliedDate: formData.appliedDate ? new Date(formData.appliedDate).toISOString() : new Date().toISOString(),
      nextEventDate: formData.nextEventDate ? new Date(formData.nextEventDate).toISOString() : undefined,
      notes: formData.notes ? formData.notes.split('\n').filter(s => s.trim()) : [],
    };
    onSubmit(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Position"
            name="position"
            value={formData.position}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Vacancy URL"
            name="url"
            value={formData.url}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Contact Name"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Contact Email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Contact Phone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Salary Min"
            name="salaryMin"
            type="number"
            value={formData.salaryMin}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Salary Max"
            name="salaryMax"
            type="number"
            value={formData.salaryMax}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Source"
            name="source"
            value={formData.source}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleSelectChange}
              label="Status"
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Applied Date"
            name="appliedDate"
            type="date"
            value={formData.appliedDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Next Event Date"
            name="nextEventDate"
            type="date"
            value={formData.nextEventDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes (one per line)"
            name="notes"
            multiline
            rows={4}
            value={formData.notes}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? 'Saving...' : initialData?._id ? 'Update' : 'Create'}
          </Button>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </Grid>
      </Grid>
    </Box>
  );
};