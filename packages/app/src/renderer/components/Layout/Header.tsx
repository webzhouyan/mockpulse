import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Badge,
  alpha,
  useTheme
} from '@mui/material';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import HttpRoundedIcon from '@mui/icons-material/HttpRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import AltRouteRoundedIcon from '@mui/icons-material/AltRouteRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded';
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
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
    serverLogs,
    toggleServer,
    activeTabKey,
    setActiveTabKey,
    themeMode,
    setThemeMode,
    navTabsOrder,
    setNavTabsOrder,
    layoutDensity
  } = useApp();

  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  if (!activeEnvironment) return null;

  const isCompact = layoutDensity === 'compact';
  const status = serverStatuses[activeEnvironment.uuid] || 'stopped';
  const isRunning = status === 'running';
  const logsCount = (serverLogs[activeEnvironment.uuid] || []).length;

  const tabConfigs: Record<
    string,
    { label: string; icon: React.ReactElement; badge?: number }
  > = {
    routes: {
      label: t.nav.routes,
      icon: <RouteRoundedIcon sx={{ fontSize: isCompact ? 15 : 18 }} />
    },
    dataBuckets: {
      label: t.nav.dataBuckets,
      icon: <StorageRoundedIcon sx={{ fontSize: isCompact ? 15 : 18 }} />
    },
    headers: {
      label: t.nav.headers,
      icon: <HttpRoundedIcon sx={{ fontSize: isCompact ? 15 : 18 }} />
    },
    callbacks: {
      label: t.nav.callbacks,
      icon: <CallSplitRoundedIcon sx={{ fontSize: isCompact ? 15 : 18 }} />
    },
    logs: {
      label: t.nav.logs,
      icon: <FormatListBulletedRoundedIcon sx={{ fontSize: isCompact ? 15 : 18 }} />,
      badge: logsCount
    },
    proxy: {
      label: t.nav.proxy,
      icon: <AltRouteRoundedIcon sx={{ fontSize: isCompact ? 15 : 18 }} />
    },
    settings: {
      label: t.nav.settings,
      icon: <SettingsRoundedIcon sx={{ fontSize: isCompact ? 15 : 18 }} />
    }
  };

  const handleDragStart = (e: React.DragEvent, key: string) => {
    setDraggedKey(key);
    e.dataTransfer.setData('text/plain', key);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    if (key !== draggedKey) {
      setDragOverKey(key);
    }
  };

  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedKey || draggedKey === targetKey) {
      setDraggedKey(null);
      setDragOverKey(null);
      return;
    }

    const currentIndex = navTabsOrder.indexOf(draggedKey);
    const targetIndex = navTabsOrder.indexOf(targetKey);

    if (currentIndex !== -1 && targetIndex !== -1) {
      const nextOrder = [...navTabsOrder];
      nextOrder.splice(currentIndex, 1);
      nextOrder.splice(targetIndex, 0, draggedKey);
      setNavTabsOrder(nextOrder);
    }

    setDraggedKey(null);
    setDragOverKey(null);
  };

  return (
    <Box
      sx={{
        height: isCompact ? 42 : 52,
        minHeight: isCompact ? 42 : 52,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        px: 1.5,
        gap: 1,
        overflow: 'hidden'
      }}
    >
      {/* Left: Environment Name & Status (Auto-adapts to text length without empty gaps) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexShrink: 0, pr: 1.2, borderRight: `1px solid ${theme.palette.divider}` }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 160,
            fontSize: isCompact ? '0.8rem' : '0.875rem'
          }}
        >
          {activeEnvironment.name}
        </Typography>

        <Chip
          size="small"
          label={isRunning ? `${t.app.running} :${activeEnvironment.port}` : t.app.stopped}
          color={isRunning ? 'success' : 'default'}
          variant={isRunning ? 'filled' : 'outlined'}
          sx={{
            fontWeight: 600,
            fontSize: '0.68rem',
            height: isCompact ? 20 : 22,
            '& .MuiChip-label': { px: 0.8 }
          }}
        />
      </Box>

      {/* Middle: Draggable & Scrollable Tabs (Expanded immediately next to environment info) */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          overflowX: 'auto',
          px: 0.5,
          py: 0.2,
          '&::-webkit-scrollbar': { height: 3 }
        }}
      >
        {navTabsOrder.map((key) => {
          const cfg = tabConfigs[key];
          if (!cfg) return null;
          const isActive = activeTabKey === key;
          const isOver = dragOverKey === key;
          const isDragging = draggedKey === key;

          return (
            <Box
              key={key}
              draggable
              onDragStart={(e) => handleDragStart(e, key)}
              onDragOver={(e) => handleDragOver(e, key)}
              onDrop={(e) => handleDrop(e, key)}
              onDragEnd={() => {
                setDraggedKey(null);
                setDragOverKey(null);
              }}
              onClick={() => setActiveTabKey(key)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                px: isCompact ? 1.1 : 1.5,
                py: isCompact ? 0.4 : 0.6,
                borderRadius: 1.5,
                cursor: 'pointer',
                userSelect: 'none',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                backgroundColor: isActive
                  ? alpha(theme.palette.primary.main, 0.12)
                  : isOver
                  ? alpha(theme.palette.primary.main, 0.06)
                  : 'transparent',
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                fontWeight: isActive ? 600 : 500,
                border: isOver
                  ? `1px dashed ${theme.palette.primary.main}`
                  : isActive
                  ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                  : '1px solid transparent',
                opacity: isDragging ? 0.4 : 1,
                '&:hover': {
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.16)
                    : alpha(theme.palette.text.primary, 0.04),
                  color: isActive ? theme.palette.primary.main : theme.palette.text.primary
                }
              }}
            >
              {/* Drag handle hint */}
              <DragIndicatorRoundedIcon
                sx={{
                  fontSize: 12,
                  color: theme.palette.text.disabled,
                  cursor: 'grab',
                  opacity: 0.4,
                  '&:hover': { opacity: 0.9 }
                }}
              />

              {/* Icon / Badge */}
              {cfg.badge && cfg.badge > 0 ? (
                <Badge
                  badgeContent={cfg.badge}
                  color="primary"
                  max={99}
                  sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 14, minWidth: 14, top: 2, right: -4 } }}
                >
                  {cfg.icon}
                </Badge>
              ) : (
                cfg.icon
              )}

              {/* Tab Title */}
              <Typography
                variant="caption"
                sx={{
                  fontSize: isCompact ? '0.78rem' : '0.84rem',
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap'
                }}
              >
                {cfg.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Right Actions: Play/Stop + Light/Dark Mode + Settings (Palette removed as requested) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexShrink: 0 }}>
        {/* Play / Stop Button */}
        <Button
          variant={isRunning ? 'contained' : 'outlined'}
          color={isRunning ? 'error' : 'primary'}
          size="small"
          startIcon={
            isRunning ? (
              <StopRoundedIcon sx={{ fontSize: isCompact ? 16 : 18 }} />
            ) : (
              <PlayArrowRoundedIcon sx={{ fontSize: isCompact ? 16 : 18 }} />
            )
          }
          onClick={() => toggleServer(activeEnvironment.uuid)}
          sx={{
            height: isCompact ? 28 : 32,
            px: isCompact ? 1.2 : 1.5,
            fontSize: isCompact ? '0.75rem' : '0.8rem',
            fontWeight: 600
          }}
        >
          {isRunning ? t.app.stopServer : t.app.startServer}
        </Button>

        {/* Light / Dark Mode Toggle */}
        <Tooltip title={themeMode === 'light' ? t.settings.modeDark : t.settings.modeLight} arrow>
          <IconButton
            size="small"
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            sx={{ p: isCompact ? 0.4 : 0.6 }}
          >
            {themeMode === 'light' ? (
              <Brightness4RoundedIcon sx={{ fontSize: isCompact ? 18 : 20 }} />
            ) : (
              <Brightness7RoundedIcon sx={{ fontSize: isCompact ? 18 : 20 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* System Settings Dialog Button */}
        <Tooltip title={t.settings.title} arrow>
          <IconButton size="small" onClick={onOpenSettings} sx={{ p: isCompact ? 0.4 : 0.6 }}>
            <SettingsRoundedIcon sx={{ fontSize: isCompact ? 18 : 20 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
