// frontend/src/pages/Dashboard.tsx
import { useEffect, useState, useRef, useMemo } from 'react';
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
import { useLanguage } from '../context/LanguageContext';

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

// Custom tooltip for funnel chart – text color matches segment color
const CustomFunnelTooltip = ({ active, payload }: any) => {
  const { t } = useLanguage();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const stage = data.stage;
    const originalStage = data.originalStage;
    const count = data.count;
    const color = originalStage && statusColors[originalStage]
      ? statusColors[originalStage]
      : CHART_COLORS[0];
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Typography sx={{ color: color, fontWeight: 'bold' }}>
          {stage}
        </Typography>
        <Typography sx={{ color: color }}>
          {t('count')}: {count}
        </Typography>
      </Box>
    );
  }
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Translate status names for charts, but keep original name for colors
  const translatedStatusDistribution = useMemo(() => {
    if (!stats) return [];
    return stats.statusDistribution.map(item => ({
      ...item,
      name: t('statuses.' + item.name),
      originalName: item.name, // preserve original status for color mapping
    }));
  }, [stats, t]);

  const translatedFunnel = useMemo(() => {
    if (!stats) return [];
    return stats.funnel.map(item => ({
      ...item,
      stage: t('statuses.' + item.stage),
      originalStage: item.stage, // preserve original status for color mapping
    }));
  }, [stats, t]);

  // FIXED: tooltipFormatter now accepts 'name' as any to match Recharts Formatter signature
  const tooltipFormatter = (value: any, name: any) => {
    const label = (typeof name === 'string' && (name === 'count' || name === 'value'))
      ? t('count')
      : name ?? '';
    return [value, label];
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err: any) {
        setError(t('failedToLoad'));
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [t]);

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
        setSuccessMessage(t('dashboardSaved', { fileName: result.fileName || suggestedName }));
      }
    } catch (err) {
      setError(t('failedToSaveImage'));
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
          <Typography>{t('noDataAvailable')}</Typography>
        </Container>
      </Box>
    );
  }

  const { timeline, topSources, totalApplications, offerCount, offerRate } = stats;

  return (
    <Box sx={{ ...scrollbarSx, height: '100%', overflowY: 'auto' }}>
      <Container maxWidth="lg" sx={{ py: 1.5, px: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/')}
            sx={{ fontWeight: 'bold' }}
          >
            {t('back')}
          </Button>
          <Tooltip title={t('saveAsImageTooltip')}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleSaveAsImage}
              sx={{ fontWeight: 'bold' }}
            >
              {t('saveAsImage')}
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
                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.2, fontWeight: 500 }}>{t('totalApplications')}</Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 400, color: '#000', lineHeight: 1.1 }}>{totalApplications}</Typography>
              </Box>
              <Box sx={{ p: 1, px: { xs: 3, md: 5 }, textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.2, fontWeight: 500 }}>{t('offers')}</Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 400, color: '#000', lineHeight: 1.1 }}>{offerCount}</Typography>
              </Box>
              <Box sx={{ p: 1, px: { xs: 3, md: 5 }, textAlign: 'center' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.2, fontWeight: 500 }}>{t('offerRate')}</Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 400, color: '#000', lineHeight: 1.1 }}>{offerRate}%</Typography>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, mb: 1.5 }}>
            <Box sx={{ flex: 1, backgroundColor: '#f5f7fa', borderRadius: '16px', p: 1.5, minWidth: 0 }}>
              <Typography sx={{ textAlign: 'center', fontWeight: 600, mb: 1, fontSize: '0.85rem' }}>{t('statusDistribution')}</Typography>
              {translatedStatusDistribution.length > 0 ? (
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={translatedStatusDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="53%"
                        outerRadius={70}
                        label
                      >
                        {translatedStatusDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={statusColors[entry.originalName] || CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={tooltipFormatter} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{t('noDataAvailable')}</Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ flex: 1.4, backgroundColor: '#f5f7fa', borderRadius: '16px', p: 1.5, minWidth: 0 }}>
              <Typography sx={{ textAlign: 'center', fontWeight: 600, mb: 1, fontSize: '0.85rem' }}>{t('applicationsOverTime')}</Typography>
              <Box sx={{ height: 200 }}>
                {timeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={tooltipFormatter} />
                      <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography sx={{ textAlign: 'center', mt: 8 }}>{t('noTimelineData')}</Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ flex: 1.1, backgroundColor: '#f5f7fa', borderRadius: '16px', p: 1.5, minWidth: 0 }}>
              <Typography sx={{ textAlign: 'center', fontWeight: 600, mb: 1, fontSize: '0.85rem' }}>{t('topSources')}</Typography>
              <Box sx={{ height: 200 }}>
                {topSources.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSources} layout="vertical" margin={{ top: 10, right: 25, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="source" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={tooltipFormatter} />
                      <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="count" position="right" style={{ fontSize: 10 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography sx={{ textAlign: 'center', mt: 8 }}>{t('noSourceData')}</Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ mx: { xs: 0, md: '170px' }, backgroundColor: '#f5f7fa', borderRadius: '16px', p: 2 }}>
            <Typography sx={{ textAlign: 'center', fontWeight: 600, mb: 2, fontSize: '0.85rem' }}>{t('funnel')}</Typography>
            <Box sx={{ height: 190 }}>
              {translatedFunnel.some(item => item.count > 0) ? (
                <ResponsiveContainer width="100%" height="108%">
                  <FunnelChart margin={{ top: -5, right: 40, left: 20, bottom: 10 }}>
                    <RechartsTooltip content={<CustomFunnelTooltip />} />
                    <Funnel
                      data={translatedFunnel}
                      dataKey="count"
                      nameKey="stage"
                      isAnimationActive
                    >
                      <LabelList
                        content={(props) => {
                          const { x, y, width, height, index } = props;
                          const safeX = Number(x) || 0;
                          const safeY = Number(y) || 0;
                          const safeWidth = Number(width) || 0;
                          const safeHeight = Number(height) || 0;
                          const safeIndex = index ?? 0;
                          const stageData = translatedFunnel[safeIndex];
                          if (!stageData) return null;
                          const originalStage = stageData.originalStage;
                          const stageCount = stageData.count;
                          const labelColor = originalStage && statusColors[originalStage]
                            ? statusColors[originalStage]
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
                      {translatedFunnel.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[entry.originalStage] || CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ textAlign: 'center', mt: 6 }}>{t('noFunnelData')}</Typography>
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