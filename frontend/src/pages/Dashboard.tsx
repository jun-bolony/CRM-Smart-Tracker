import { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress } from '@mui/material';
import type { StatsData } from '../types/Application';
import { getStats } from '../services/api';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, FunnelChart, Funnel, LabelList,
} from 'recharts';

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

export const Dashboard = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Ensure pie chart has at least one entry
  const pieData = statusDistribution.length > 0 ? statusDistribution : [{ name: 'No data', value: 1 }];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

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
              <Tooltip />
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
                <Tooltip />
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
              <Tooltip />
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
              <Tooltip />
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

      <ErrorSnackbar
        open={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />
    </Container>
  );
};