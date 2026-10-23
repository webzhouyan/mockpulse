import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  useTheme,
  InputAdornment
} from '@mui/material';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';

export const EnvSettingsView: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const { activeEnvironment, updateActiveEnvironment, layoutDensity } = useApp();

  const isCompact = layoutDensity === 'compact';

  if (!activeEnvironment) return null;

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        p: isCompact ? 2.5 : 4
      }}
    >
      <Box sx={{ maxWidth: 840, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            {t.envSettings.title}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {t.envSettings.subtitle}
          </Typography>
        </Box>

        {/* Section 1: Server & Network */}
        <Paper
          variant="outlined"
          sx={{
            p: isCompact ? 2.5 : 3.5,
            borderRadius: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DnsRoundedIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              网络与监听配置
            </Typography>
          </Box>

          {/* Environment Name */}
          <Box>
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
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
              {t.envSettings.nameDesc}
            </Typography>
          </Box>

          {/* Port & Hostname */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t.envSettings.port}
                value={activeEnvironment.port}
                onChange={(e) => {
                  const port = Number(e.target.value);
                  updateActiveEnvironment((env) => ({ ...env, port }));
                }}
              />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
                {t.envSettings.portDesc}
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                label={t.envSettings.hostname}
                placeholder={t.envSettings.hostnamePlaceholder}
                value={activeEnvironment.hostname ?? 'localhost'}
                onChange={(e) => {
                  const hostname = e.target.value;
                  updateActiveEnvironment((env) => ({ ...env, hostname }));
                }}
              />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
                {t.envSettings.hostnameDesc}
              </Typography>
            </Box>
          </Box>

          {/* Endpoint Prefix */}
          <Box>
            <TextField
              fullWidth
              size="small"
              label={t.envSettings.endpointPrefix}
              placeholder="api/v1"
              value={activeEnvironment.endpointPrefix || ''}
              onChange={(e) => {
                const endpointPrefix = e.target.value;
                updateActiveEnvironment((env) => ({ ...env, endpointPrefix }));
              }}
            />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
              {t.envSettings.endpointPrefixDesc}
            </Typography>
          </Box>
        </Paper>

        {/* Section 2: Performance & Simulation */}
        <Paper
          variant="outlined"
          sx={{
            p: isCompact ? 2.5 : 3.5,
            borderRadius: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpeedRoundedIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              网络模拟与延迟
            </Typography>
          </Box>

          <Box>
            <TextField
              size="small"
              type="number"
              label={t.envSettings.latency}
              value={activeEnvironment.latency || 0}
              onChange={(e) => {
                const latency = Number(e.target.value);
                updateActiveEnvironment((env) => ({ ...env, latency }));
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">ms</InputAdornment>
              }}
              sx={{ maxWidth: 300 }}
            />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
              {t.envSettings.latencyDesc}
            </Typography>
          </Box>
        </Paper>

        {/* Section 3: Security & CORS */}
        <Paper
          variant="outlined"
          sx={{
            p: isCompact ? 2.5 : 3.5,
            borderRadius: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityRoundedIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              安全与跨域策略 (CORS & HTTPS)
            </Typography>
          </Box>

          {/* CORS Switch */}
          <Box>
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
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.3, display: 'block' }}>
              {t.envSettings.corsDesc}
            </Typography>
          </Box>

          <Divider />

          {/* TLS/HTTPS Switch */}
          <Box>
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
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.3, display: 'block' }}>
              {t.envSettings.tlsDesc}
            </Typography>

            {activeEnvironment.tlsOptions?.enabled && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                <Box>
                  <TextField
                    fullWidth
                    size="small"
                    label={t.envSettings.certPath}
                    value={activeEnvironment.tlsOptions?.certPath || ''}
                    placeholder="/path/to/server.cert"
                    onChange={(e) => {
                      const certPath = e.target.value;
                      updateActiveEnvironment((env) => ({
                        ...env,
                        tlsOptions: { ...env.tlsOptions, certPath }
                      }));
                    }}
                  />
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
                    {t.envSettings.certPathDesc}
                  </Typography>
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    size="small"
                    label={t.envSettings.keyPath}
                    value={activeEnvironment.tlsOptions?.keyPath || ''}
                    placeholder="/path/to/server.key"
                    onChange={(e) => {
                      const keyPath = e.target.value;
                      updateActiveEnvironment((env) => ({
                        ...env,
                        tlsOptions: { ...env.tlsOptions, keyPath }
                      }));
                    }}
                  />
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
                    {t.envSettings.keyPathDesc}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
