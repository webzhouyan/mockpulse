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

        {/* Pulse Dot (No redundant "已停止" label) */}
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isRunning ? '#10b981' : theme.palette.text.disabled,
            boxShadow: isRunning ? '0 0 0 2px rgba(16, 185, 129, 0.25)' : 'none',
            transition: 'all 0.3s ease',
            animation: isRunning ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.4 }
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
        {/* Merged Switch: 启动服务 / 停止 (端口 XXXX) */}
        <Button
          size="small"
          variant="contained"
          color={isRunning ? 'error' : 'primary'}
          disabled={isStarting}
          startIcon={
            isRunning ? (
              <StopRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
            )
          }
          onClick={() => toggleServer(activeEnvironment.uuid)}
          sx={{
            height: 28,
            px: 1.5,
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 1.5,
            textTransform: 'none',
            boxShadow: isRunning
              ? '0 2px 6px rgba(239, 68, 68, 0.35)'
              : '0 2px 6px rgba(16, 185, 129, 0.35)',
            backgroundColor: isRunning ? '#ef4444' : theme.palette.primary.main,
            '&:hover': {
              backgroundColor: isRunning ? '#dc2626' : theme.palette.primary.dark
            }
          }}
        >
          {isStarting
            ? '启动中...'
            : isRunning
            ? `停止 (端口 ${activeEnvironment.port})`
            : '启动服务'}
        </Button>

        {/* Theme mode toggle */}
        <Tooltip title={themeMode === 'light' ? t.settings.modeDark : t.settings.modeLight} arrow>
          <IconButton
            size="small"
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            sx={{ width: 28, height: 28 }}
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
          <IconButton size="small" onClick={onOpenSettings} sx={{ width: 28, height: 28 }}>
            <SettingsRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
