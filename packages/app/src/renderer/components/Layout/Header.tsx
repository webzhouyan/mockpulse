import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  alpha,
  useTheme
} from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded';
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const theme = useTheme();
  const { t } = useI18n();
  const {
    activeEnvironment,
    serverStatuses,
    toggleServer,
    themeMode,
    setThemeMode
  } = useApp();

  if (!activeEnvironment) return null;

  const status = serverStatuses[activeEnvironment.uuid] || 'stopped';
  const isRunning = status === 'running';
  const isStarting = status === 'starting';

  return (
    <Box
      sx={{
        height: 40,
        minHeight: 40,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === 'light'
            ? alpha(theme.palette.background.paper, 0.9)
            : alpha(theme.palette.background.default, 0.95),
        backdropFilter: 'blur(8px)',
        userSelect: 'none'
      }}
    >
      {/* Left: Environment Name with subtle Pulse Breathing Dot */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: '0.88rem',
            letterSpacing: '-0.01em'
          }}
        >
          {activeEnvironment.name}
        </Typography>

        {/* Pulse Breathing Dot */}
        <Box
          sx={{
            width: isRunning ? 8 : 7,
            height: isRunning ? 8 : 7,
            borderRadius: '50%',
            backgroundColor: isRunning ? '#10b981' : theme.palette.text.disabled,
            opacity: isRunning ? 1 : 0.4,
            boxShadow: isRunning ? '0 0 0 0 rgba(16, 185, 129, 0.6)' : 'none',
            animation: isRunning ? 'pulseGlow 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            '@keyframes pulseGlow': {
              '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
              '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)' },
              '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
            }
          }}
        />

        {isRunning && (
          <Typography
            variant="caption"
            sx={{
              fontFamily: "'Fira Code', monospace",
              fontSize: '0.72rem',
              color: '#10b981',
              fontWeight: 600
            }}
          >
            :{activeEnvironment.port}
          </Typography>
        )}
      </Box>

      {/* Right: Master Control Switch (Merged) + Theme Mode + System Settings */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Merged Switch: 启动服务 / 停止服务 (3000) */}
        <Button
          size="small"
          variant="contained"
          disabled={isStarting}
          startIcon={
            isRunning ? (
              <StopRoundedIcon sx={{ fontSize: 15 }} />
            ) : (
              <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
            )
          }
          onClick={() => toggleServer(activeEnvironment.uuid)}
          sx={{
            height: 28,
            px: 1.4,
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 1.5,
            textTransform: 'none',
            color: '#ffffff',
            boxShadow: isRunning
              ? '0 2px 6px rgba(239, 68, 68, 0.35)'
              : '0 2px 6px rgba(16, 185, 129, 0.35)',
            backgroundColor: isRunning ? '#ef4444' : '#10b981',
            '&:hover': {
              backgroundColor: isRunning ? '#dc2626' : '#059669'
            }
          }}
        >
          {isStarting
            ? t.app.starting
            : isRunning
            ? `${t.app.stopServer} (${activeEnvironment.port})`
            : t.app.startServer}
        </Button>

        {/* Theme mode toggle */}
        <Tooltip title={themeMode === 'light' ? t.settings.modeDark : t.settings.modeLight} arrow>
          <IconButton
            size="small"
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            sx={{
              width: 28,
              height: 28,
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.text.primary, 0.06)
              }
            }}
          >
            {themeMode === 'light' ? (
              <Brightness4RoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <Brightness7RoundedIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Global Settings Dialog */}
        <Tooltip title={t.settings.title} arrow>
          <IconButton
            size="small"
            onClick={onOpenSettings}
            sx={{
              width: 28,
              height: 28,
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.text.primary, 0.06)
              }
            }}
          >
            <SettingsRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
