import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import { ArrowBack, GetApp as DownloadIcon } from '@mui/icons-material';
import type { StatsData } from '../types/Application';
import { getStats } from '../services/api';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, FunnelChart, Funnel, LabelList,
} from 'recharts';
import html2canvas from 'html2canvas';
import { saveFileWithPicker } from '../utils/fileUtils';

const statusColors: Record<string, string> = {
  Sent: '#2196f3',
  Viewed: '#64b5f6',
  Interview: '#ff9800',
  Test: '#ffc107',
  Offer: '#4caf50',
  Rejected: '#f44336',
  Archived: '#9e9e9e',
};

const CHART_COLORS = ['#2196f3', '#64b5f6', '#ff9800', '#ffc107', '#4caf50', '#f44336', '#9e9e9e'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleSaveAsImage = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const suggestedName = `dashboard_${timestamp}.png`;
      const result = await saveFileWithPicker(blob, suggestedName, 'image/png');
      if (result.success) {
        setSuccessMessage(`Dashboard saved successfully as ${result.fileName || suggestedName}`);
      }
      // If cancelled, do nothing
    } catch (err) {
      setError('Failed to save image');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>No data available</Typography>
      </Container>
    );
  }

  const { statusDistribution, timeline, topSources, funnel, totalApplications, offerCount, offerRate } = stats;
  const pieData = statusDistribution.length > 0 ? statusDistribution : [{ name: 'No data', value: 1 }];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button and Save as Image button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}>
          Back
        </Button>
        <Tooltip title="Save the entire dashboard as a PNG image for backup or sharing.">
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleSaveAsImage}
          >
            Save as Image
          </Button>
        </Tooltip>
      </Box>

      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Wrapper for screenshot */}
      <div ref={dashboardRef}>
        {/* Summary Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Card sx={{ flex: '1 1 200px', minWidth: 150 }}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2">Total Applications</Typography>
              <Typography variant="h4">{totalApplications}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 200px', minWidth: 150 }}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2">Offers</Typography>
              <Typography variant="h4">{offerCount}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 200px', minWidth: 150 }}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2">Offer Rate</Typography>
              <Typography variant="h4">{offerRate}%</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Charts Row 1: Pie and Bar */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>Status Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ flex: '1 1 45%', minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>Top Sources</Typography>
            {topSources.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSources} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="source" />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    <LabelList dataKey="count" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography>No source data</Typography>
            )}
          </Box>
        </Box>

        {/* Timeline Chart */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Applications Over Time (Last 30 Days)</Typography>
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeline} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography>No timeline data</Typography>
          )}
        </Box>

        {/* Funnel Chart */}
        <Box>
          <Typography variant="h6" gutterBottom>Funnel (Applications reaching each stage)</Typography>
          {funnel.some(item => item.count > 0) ? (
            <ResponsiveContainer width="100%" height={400}>
              <FunnelChart>
                <RechartsTooltip />
                <Funnel
                  data={funnel}
                  dataKey="count"
                  nameKey="stage"
                  isAnimationActive
                >
                  <LabelList position="right" fill="#000" stroke="none" dataKey="count" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          ) : (
            <Typography>No funnel data</Typography>
          )}
        </Box>
      </div>

      <ErrorSnackbar
        open={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />

      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;