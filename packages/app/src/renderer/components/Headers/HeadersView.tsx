import React from 'react';
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
  alpha,
  useTheme
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';

export const HeadersView: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const { activeEnvironment, updateActiveEnvironment, layoutDensity } = useApp();

  const isCompact = layoutDensity === 'compact';
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

  return (
    <Box sx={{ p: isCompact ? 2 : 3, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: isCompact ? '0.9rem' : '1.1rem' }}>
            {t.headers.title}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.3, display: 'block' }}>
            {t.headers.subtitle}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={handleAddHeader}
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {t.headers.addHeader}
        </Button>
      </Box>

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
                    placeholder="Access-Control-Allow-Origin"
                    onChange={(e) => handleUpdateHeader(i, e.target.value, h.value)}
                  />
                </TableCell>
                <TableCell sx={{ py: isCompact ? 0.6 : 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={h.value}
                    placeholder="*"
                    onChange={(e) => handleUpdateHeader(i, h.key, e.target.value)}
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
    </Box>
  );
};
