import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';

export const EnvSettingsView: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const { activeEnvironment, updateActiveEnvironment } = useApp();

  if (!activeEnvironment) return null;

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t.envSettings.title}
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          fullWidth
          size="small"
          label={t.envSettings.name}
          value={activeEnvironment.name}
          onChange={(e) => {
            const name = e.target.value;
            updateActiveEnvironment((env) => ({ ...env, name }));
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            type="number"
            label={t.envSettings.port}
            value={activeEnvironment.port}
            onChange={(e) => {
              const port = Number(e.target.value);
              updateActiveEnvironment((env) => ({ ...env, port }));
            }}
            sx={{ flex: 1 }}
          />

          <TextField
            size="small"
            label={t.envSettings.endpointPrefix}
            placeholder="api/v1"
            value={activeEnvironment.endpointPrefix || ''}
            onChange={(e) => {
              const endpointPrefix = e.target.value;
              updateActiveEnvironment((env) => ({ ...env, endpointPrefix }));
            }}
            sx={{ flex: 1 }}
          />

          <TextField
            size="small"
            type="number"
            label={t.envSettings.latency}
            value={activeEnvironment.latency || 0}
            onChange={(e) => {
              const latency = Number(e.target.value);
              updateActiveEnvironment((env) => ({ ...env, latency }));
            }}
            sx={{ flex: 1 }}
          />
        </Box>

        <Divider />

        <FormControlLabel
          control={
            <Switch
              checked={!!activeEnvironment.cors}
              onChange={(e) => {
                const cors = e.target.checked;
                updateActiveEnvironment((env) => ({ ...env, cors }));
              }}
            />
          }
          label={<Typography sx={{ fontWeight: 600 }}>{t.envSettings.cors}</Typography>}
        />

        <Divider />

        <FormControlLabel
          control={
            <Switch
              checked={!!activeEnvironment.tlsOptions?.enabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                updateActiveEnvironment((env) => ({
                  ...env,
                  tlsOptions: { ...env.tlsOptions, enabled }
                }));
              }}
            />
          }
          label={<Typography sx={{ fontWeight: 600 }}>{t.envSettings.tls}</Typography>}
        />

        {activeEnvironment.tlsOptions?.enabled && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 4 }}>
            <TextField
              size="small"
              label={t.envSettings.certPath}
              value={activeEnvironment.tlsOptions?.certPath || ''}
              onChange={(e) => {
                const certPath = e.target.value;
                updateActiveEnvironment((env) => ({
                  ...env,
                  tlsOptions: { ...env.tlsOptions, certPath }
                }));
              }}
            />
            <TextField
              size="small"
              label={t.envSettings.keyPath}
              value={activeEnvironment.tlsOptions?.keyPath || ''}
              onChange={(e) => {
                const keyPath = e.target.value;
                updateActiveEnvironment((env) => ({
                  ...env,
                  tlsOptions: { ...env.tlsOptions, keyPath }
                }));
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

