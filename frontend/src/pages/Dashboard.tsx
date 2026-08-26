// frontend/src/pages/Dashboard.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Tooltip,
  Snackbar,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { ArrowBack, GetApp as DownloadIcon } from '@mui/icons-material';
import type { StatsData } from '../types/Application';
import { getStats } from '../services/api';
import { ErrorSnackbar } from '../components/ErrorSnackbar';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import html2canvas from 'html2canvas';
import { saveFileWithPicker } from '../utils/fileUtils';
import { scrollbarSx } from '../styles/scrollbar';

const statusColors: Record<string, string> = {
  Sent: '#2196f3',
  Viewed: '#6FD1E2',
  Interview: '#A37BE0',
  Test: '#ffc107',
  Offer: '#4caf50',
  Rejected: '#f44336',
  Archived: '#9e9e9e',
};

const CHART_COLORS = ['#2196f3', '#6FD1E2', '#A37BE0', '#ffc107', '#4caf50', '#f44336', '#9e9e9e'];

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
    } catch (err) {
      setError('Failed to save image');
    }
  };

  if (loading) {
    return (
      <Box sx={{ ...scrollbarSx, height: '100%', overflowY: 'auto' }}>
        <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Container>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ ...scrollbarSx, height: '100%', overflowY: 'auto' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>No data available</Typography>
        </Container>
      </Box>
    );
  }

  const { statusDistribution, timeline, topSources, funnel, totalApplications, offerCount, offerRate } = stats;

  return (
    <Box sx={{ ...scrollbarSx, height: '100%', overflowY: 'auto' }}>
      <Container maxWidth="lg" sx={{ py: 1.5, px: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/')}
            sx={{ fontWeight: 'bold' }}
          >
            BACK
          </Button>
          <Tooltip title="Save the entire dashboard as a PNG image.">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleSaveAsImage}
              sx={{ fontWeight: 'bold' }}
            >
              SAVE AS IMAGE
            </Button>
          </Tooltip>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <div ref={dashboardRef} style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '16px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}
            >
              <Box sx={{ p: 1, px: { xs: 3, md: 5 }, textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.2, fontWeight: 500 }}>Total Applications</Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 400, color: '#000', lineHeight: 1.1 }}>{totalApplications}</Typography>
              </Box>
              <Box sx={{ p: 1, px: { xs: 3, md: 5 }, textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.2, fontWeight: 500 }}>Offers</Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 400, color: '#000', lineHeight: 1.1 }}>{offerCount}</Typography>
              </Box>
              <Box sx={{ p: 1, px: { xs: 3, md: 5 }, textAlign: 'center' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.2, fontWeight: 500 }}>Offer Rate</Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 400, color: '#000', lineHeight: 1.1 }}>{offerRate}%</Typography>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, mb: 1.5 }}>
            <Box sx={{ flex: 1, backgroundColor: '#f5f7fa', borderRadius: '16px', p: 1.5, minWidth: 0 }}>
              <Typography sx={{ textAlign: 'center', fontWeight: 600, mb: 1, fontSize: '0.85rem' }}>Status Distribution</Typography>
              {statusDistribution.length > 0 ? (
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="53%"
                        outerRadius={70}
                        label
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={statusColors[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No data available</Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ flex: 1.4, backgroundColor: '#f5f7fa', borderRadius: '16px', p: 1.5, minWidth: 0 }}>
              <Typography sx={{ textAlign: 'center', fontWeight: 600, mb: 1, fontSize: '0.85rem' }}>Applications Over Time (Last 30 Days)</Typography>
              <Box sx={{ height: 200 }}>
                {timeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography sx={{ textAlign: 'center', mt: 8 }}>No timeline data</Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ flex: 1.1, backgroundColor: '#f5f7fa', borderRadius: '16px', p: 1.5, minWidth: 0 }}>
              <Typography sx={{ textAlign: 'center', fontWeight: 600, mb: 1, fontSize: '0.85rem' }}>Top Sources</Typography>
              <Box sx={{ height: 200 }}>
                {topSources.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSources} layout="vertical" margin={{ top: 10, right: 25, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="source" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="count" position="right" style={{ fontSize: 10 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography sx={{ textAlign: 'center', mt: 8 }}>No source data</Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ mx: { xs: 0, md: '170px' }, backgroundColor: '#f5f7fa', borderRadius: '16px', p: 2 }}>
            <Typography sx={{ textAlign: 'center', fontWeight: 600, mb: 2, fontSize: '0.85rem' }}>Funnel (Applications reaching each stage)</Typography>
            <Box sx={{ height: 190 }}>
              {funnel.some(item => item.count > 0) ? (
                <ResponsiveContainer width="100%" height="108%">
                  <FunnelChart margin={{ top: -5, right: 40, left: 20, bottom: 10 }}>
                    <RechartsTooltip />
                    <Funnel
                      data={funnel}
                      dataKey="count"
                      nameKey="stage"
                      isAnimationActive
                    >
                      <LabelList
                        content={(props) => {
                          const { x, y, width, height, index } = props;
                          // Safely convert values and provide defaults
                          const safeX = Number(x) || 0;
                          const safeY = Number(y) || 0;
                          const safeWidth = Number(width) || 0;
                          const safeHeight = Number(height) || 0;
                          const safeIndex = index ?? 0;
                          const stageData = funnel[safeIndex];
                          if (!stageData) return null;
                          const stageName = stageData.stage;
                          const stageCount = stageData.count;
                          const labelColor = stageName && statusColors[stageName]
                            ? statusColors[stageName]
                            : CHART_COLORS[safeIndex % CHART_COLORS.length];
                          return (
                            <text
                              x={safeX + safeWidth + 10}
                              y={safeY + safeHeight / 2}
                              fill={labelColor}
                              dominantBaseline="central"
                              fontSize={13}
                              fontWeight="bold"
                            >
                              {`— ${stageCount}`}
                            </text>
                          );
                        }}
                      />
                      {funnel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.stage] || CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ textAlign: 'center', mt: 6 }}>No funnel data</Typography>
              )}
            </Box>
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
    </Box>
  );
};

export default Dashboard;