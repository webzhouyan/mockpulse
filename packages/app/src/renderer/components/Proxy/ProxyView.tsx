import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';

export const ProxyView: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const { activeEnvironment, updateActiveEnvironment } = useApp();

  if (!activeEnvironment) return null;

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t.proxy.title}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
          {t.proxy.subtitle}
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormControlLabel
          sx={{ ml: 0 }}
          control={
            <Switch
              checked={!!activeEnvironment.proxyMode}
              onChange={(e) => {
                const proxyMode = e.target.checked;
                updateActiveEnvironment((env) => ({ ...env, proxyMode }));
              }}
              sx={{ mr: 1 }}
            />
          }
          label={<Typography sx={{ fontWeight: 600 }}>{t.proxy.enableProxy}</Typography>}
        />

        <TextField
          fullWidth
          size="small"
          label={t.proxy.proxyHost}
          placeholder="https://api.example.com"
          disabled={!activeEnvironment.proxyMode}
          value={activeEnvironment.proxyHost || ''}
          onChange={(e) => {
            const proxyHost = e.target.value;
            updateActiveEnvironment((env) => ({ ...env, proxyHost }));
          }}
        />

        <FormControlLabel
          sx={{ ml: 0 }}
          control={
            <Switch
              disabled={!activeEnvironment.proxyMode}
              checked={!!activeEnvironment.proxyRemovePrefix}
              onChange={(e) => {
                const proxyRemovePrefix = e.target.checked;
                updateActiveEnvironment((env) => ({ ...env, proxyRemovePrefix }));
              }}
              sx={{ mr: 1 }}
            />
          }
          label={t.proxy.removePrefix}
        />
      </Paper>
    </Box>
  );
};

