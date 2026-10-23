import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  Snackbar,
  Alert,
  alpha,
  useTheme
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import { useApp, DEFAULT_GLOBAL_HEADERS } from '../../store/AppContext';
import { useI18n } from '../../i18n';

export const HeadersView: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const { activeEnvironment, updateActiveEnvironment, layoutDensity } = useApp();
  const isCompact = layoutDensity === 'compact';
  const [feedback, setFeedback] = useState<string | null>(null);

  const headers = activeEnvironment?.headers || [];

  const handleAddHeader = () => {
    updateActiveEnvironment((env) => ({
      ...env,
      headers: [...env.headers, { key: '', value: '' }]
    }));
  };

  const handleUpdateHeader = (index: number, key: string, value: string) => {
    updateActiveEnvironment((env) => ({
      ...env,
      headers: env.headers.map((h, i) => (i === index ? { key, value } : h))
    }));
  };

  const handleDeleteHeader = (index: number) => {
    updateActiveEnvironment((env) => ({
      ...env,
      headers: env.headers.filter((_, i) => i !== index)
    }));
  };

  // Add CORS headers as requested in original mockoon
  const handleAddCORSHeaders = () => {
    const corsList = [
      { key: 'Access-Control-Allow-Origin', value: '*' },
      { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Origin, Accept, Authorization, Content-Length, X-Requested-With' }
    ];

    updateActiveEnvironment((env) => {
      const current = [...env.headers];
      corsList.forEach((corsItem) => {
        const existingIdx = current.findIndex((h) => h.key.toLowerCase() === corsItem.key.toLowerCase());
        if (existingIdx !== -1) {
          current[existingIdx] = corsItem;
        } else {
          current.push(corsItem);
        }
      });
      return { ...env, headers: current };
    });
    setFeedback(t.headers.corsSuccess || '已成功添加 / 补全 CORS 跨域响应头！');
  };

  // Reset to default 4 headers
  const handleResetDefault = () => {
    updateActiveEnvironment((env) => ({
      ...env,
      headers: [...DEFAULT_GLOBAL_HEADERS]
    }));
    setFeedback(t.headers.resetSuccess || '已重置为原版默认全局响应头！');
  };

  return (
    <Box sx={{ p: isCompact ? 2 : 3, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Top Header & Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: 1.5 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: isCompact ? '0.9rem' : '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t.headers.title}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.2, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t.headers.subtitle}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<SecurityRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleAddCORSHeaders}
            sx={{
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              height: 30,
              px: 1.2
            }}
          >
            {t.headers.addCorsHeaders || '添加 CORS 跨域头'}
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleResetDefault}
            sx={{
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              height: 30,
              px: 1.2,
              borderColor: theme.palette.divider,
              '&:hover': {
                borderColor: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.text.primary, 0.04)
              }
            }}
          >
            {t.headers.resetDefault || '重置为默认'}
          </Button>

          <Button
            size="small"
            variant="contained"
            startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleAddHeader}
            sx={{
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              height: 30,
              px: 1.4
            }}
          >
            {t.headers.addHeader}
          </Button>
        </Box>
      </Box>

      {/* Headers Table */}
      <Paper variant="outlined" sx={{ overflow: 'hidden', mt: 0.5 }}>
        <Table size={isCompact ? 'small' : 'medium'}>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.text.primary, 0.03) }}>
              <TableCell sx={{ fontWeight: 600, width: '40%', py: isCompact ? 0.8 : 1.2 }}>{t.routes.headerName}</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '50%', py: isCompact ? 0.8 : 1.2 }}>{t.routes.headerValue}</TableCell>
              <TableCell width={60} align="center" sx={{ py: isCompact ? 0.8 : 1.2 }}>{t.common.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {headers.map((h, i) => (
              <TableRow key={i}>
                <TableCell sx={{ py: isCompact ? 0.6 : 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={h.key}
                    placeholder="Header Name (e.g. Content-Type)"
                    onChange={(e) => handleUpdateHeader(i, e.target.value, h.value)}
                    sx={{ '& input': { fontFamily: "'Fira Code', monospace", fontSize: '0.8rem' } }}
                  />
                </TableCell>
                <TableCell sx={{ py: isCompact ? 0.6 : 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={h.value}
                    placeholder="Header Value"
                    onChange={(e) => handleUpdateHeader(i, h.key, e.target.value)}
                    sx={{ '& input': { fontFamily: "'Fira Code', monospace", fontSize: '0.8rem' } }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ py: isCompact ? 0.6 : 1 }}>
                  <IconButton size="small" onClick={() => handleDeleteHeader(i)} sx={{ color: theme.palette.error.main, p: 0.4 }}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {headers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: theme.palette.text.secondary }}>
                  {t.headers.noHeaders}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Feedback Snackbar */}
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={2000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', py: 0.5, px: 2, fontSize: '0.85rem' }}>
          {feedback}
        </Alert>
      </Snackbar>
    </Box>
  );
};
