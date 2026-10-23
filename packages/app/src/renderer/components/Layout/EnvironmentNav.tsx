import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Badge,
  alpha,
  useTheme,
  InputAdornment
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  get: { bg: '#10b981', text: '#ffffff' },
  post: { bg: '#3b82f6', text: '#ffffff' },
  put: { bg: '#f59e0b', text: '#ffffff' },
  patch: { bg: '#8b5cf6', text: '#ffffff' },
  delete: { bg: '#ef4444', text: '#ffffff' },
  options: { bg: '#64748b', text: '#ffffff' },
  head: { bg: '#06b6d4', text: '#ffffff' }
};

export const EnvironmentNav: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const {
    activeEnvironment,
    activeTabKey,
    setActiveTabKey,
    selectedRouteUuid,
    setSelectedRouteUuid,
    addRoute,
    deleteRoute,
    serverLogs,
    layoutDensity
  } = useApp();

  const isCompact = layoutDensity === 'compact';
  const [search, setSearch] = useState('');

  // Persist collapsible sections
  const [isGlobalConfigOpen, setIsGlobalConfigOpen] = useState<boolean>(() => {
    return localStorage.getItem('mockpulse_nav_global_open') !== 'false';
  });

  const [isRoutesOpen, setIsRoutesOpen] = useState<boolean>(() => {
    return localStorage.getItem('mockpulse_nav_routes_open') !== 'false';
  });

  const toggleGlobalConfig = () => {
    setIsGlobalConfigOpen((prev) => {
      const next = !prev;
      localStorage.setItem('mockpulse_nav_global_open', String(next));
      return next;
    });
  };

  const toggleRoutes = () => {
    setIsRoutesOpen((prev) => {
      const next = !prev;
      localStorage.setItem('mockpulse_nav_routes_open', String(next));
      return next;
    });
  };

  const logsCount = activeEnvironment ? serverLogs[activeEnvironment.uuid]?.length || 0 : 0;
  const routes = activeEnvironment?.routes || [];

  const filteredRoutes = useMemo(() => {
    if (!search.trim()) return routes;
    const q = search.toLowerCase();
    return routes.filter(
      (r) =>
        r.endpoint.toLowerCase().includes(q) ||
        r.method.toLowerCase().includes(q) ||
        (r.documentation && r.documentation.toLowerCase().includes(q))
    );
  }, [routes, search]);

  if (!activeEnvironment) return null;

  return (
    <Box
      sx={{
        width: 250,
        minWidth: 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === 'light'
            ? alpha(theme.palette.background.paper, 0.45)
            : alpha(theme.palette.background.default, 0.6),
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Top Search & Add Route */}
      <Box
        sx={{
          p: 1.2,
          display: 'flex',
          gap: 0.8,
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="搜索接口路径、文档..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
            sx: {
              height: 32,
              fontSize: '0.78rem',
              borderRadius: 1.5
            }
          }}
        />

        <Tooltip title={t.routes.addRoute} arrow>
          <IconButton
            size="small"
            onClick={addRoute}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              backgroundColor: theme.palette.primary.main,
              color: '#ffffff',
              flexShrink: 0,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Nav Content Tree */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 0.8 }}>
        {/* Group 1: Global Configuration (Collapsible) */}
        <Box sx={{ mb: 1 }}>
          <Box
            onClick={toggleGlobalConfig}
            sx={{
              px: 1,
              py: 0.6,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: 1.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.04)
              }
            }}
          >
            {isGlobalConfigOpen ? (
              <ExpandMoreRoundedIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
            ) : (
              <ChevronRightRoundedIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                color: theme.palette.text.secondary
              }}
            >
              环境全局配置 (独立分组)
            </Typography>
          </Box>

          <Collapse in={isGlobalConfigOpen}>
            <List sx={{ p: 0, mt: 0.2 }}>
              {/* Request Logs */}
              <ListItem disablePadding sx={{ mb: 0.2 }}>
                <ListItemButton
                  selected={activeTabKey === 'logs'}
                  onClick={() => setActiveTabKey('logs')}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.5,
                    px: 1.2,
                    minHeight: 32
                  }}
                >
                  <ArticleOutlinedIcon sx={{ fontSize: 16, mr: 1.2, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="请求日志"
                    primaryTypographyProps={{
                      fontSize: '0.8rem',
                      fontWeight: activeTabKey === 'logs' ? 600 : 500
                    }}
                  />
                  {logsCount > 0 && (
                    <Box
                      sx={{
                        px: 0.7,
                        py: 0.1,
                        borderRadius: 1,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                        color: theme.palette.primary.main
                      }}
                    >
                      {logsCount}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>

              {/* Webhooks */}
              <ListItem disablePadding sx={{ mb: 0.2 }}>
                <ListItemButton
                  selected={activeTabKey === 'callbacks'}
                  onClick={() => setActiveTabKey('callbacks')}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.5,
                    px: 1.2,
                    minHeight: 32
                  }}
                >
                  <CallSplitRoundedIcon sx={{ fontSize: 16, mr: 1.2, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="回调 Webhook"
                    primaryTypographyProps={{
                      fontSize: '0.8rem',
                      fontWeight: activeTabKey === 'callbacks' ? 600 : 500
                    }}
                  />
                </ListItemButton>
              </ListItem>

              {/* Global Headers */}
              <ListItem disablePadding sx={{ mb: 0.2 }}>
                <ListItemButton
                  selected={activeTabKey === 'headers'}
                  onClick={() => setActiveTabKey('headers')}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.5,
                    px: 1.2,
                    minHeight: 32
                  }}
                >
                  <MailOutlineRoundedIcon sx={{ fontSize: 16, mr: 1.2, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="全局请求头"
                    primaryTypographyProps={{
                      fontSize: '0.8rem',
                      fontWeight: activeTabKey === 'headers' ? 600 : 500
                    }}
                  />
                </ListItemButton>
              </ListItem>

              {/* Data Buckets */}
              <ListItem disablePadding sx={{ mb: 0.2 }}>
                <ListItemButton
                  selected={activeTabKey === 'dataBuckets'}
                  onClick={() => setActiveTabKey('dataBuckets')}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.5,
                    px: 1.2,
                    minHeight: 32
                  }}
                >
                  <StorageRoundedIcon sx={{ fontSize: 16, mr: 1.2, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="数据桶"
                    primaryTypographyProps={{
                      fontSize: '0.8rem',
                      fontWeight: activeTabKey === 'dataBuckets' ? 600 : 500
                    }}
                  />
                </ListItemButton>
              </ListItem>

              {/* Proxy Mode */}
              <ListItem disablePadding sx={{ mb: 0.2 }}>
                <ListItemButton
                  selected={activeTabKey === 'proxy'}
                  onClick={() => setActiveTabKey('proxy')}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.5,
                    px: 1.2,
                    minHeight: 32
                  }}
                >
                  <SwapHorizRoundedIcon sx={{ fontSize: 16, mr: 1.2, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="代理转发"
                    primaryTypographyProps={{
                      fontSize: '0.8rem',
                      fontWeight: activeTabKey === 'proxy' ? 600 : 500
                    }}
                  />
                </ListItemButton>
              </ListItem>

              {/* Environment Settings */}
              <ListItem disablePadding sx={{ mb: 0.2 }}>
                <ListItemButton
                  selected={activeTabKey === 'settings'}
                  onClick={() => setActiveTabKey('settings')}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.5,
                    px: 1.2,
                    minHeight: 32
                  }}
                >
                  <SettingsOutlinedIcon sx={{ fontSize: 16, mr: 1.2, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="环境设置"
                    primaryTypographyProps={{
                      fontSize: '0.8rem',
                      fontWeight: activeTabKey === 'settings' ? 600 : 500
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
        </Box>

        {/* Group 2: Routes List (Collapsible) */}
        <Box>
          <Box
            onClick={toggleRoutes}
            sx={{
              px: 1,
              py: 0.6,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: 1.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.04)
              }
            }}
          >
            {isRoutesOpen ? (
              <ExpandMoreRoundedIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
            ) : (
              <ChevronRightRoundedIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
                flex: 1
              }}
            >
              路由接口 ({routes.length})
            </Typography>
          </Box>

          <Collapse in={isRoutesOpen}>
            <List sx={{ p: 0, mt: 0.2 }}>
              {filteredRoutes.map((route) => {
                const isSelected = activeTabKey === 'routes' && selectedRouteUuid === route.uuid;
                const methodCfg = METHOD_COLORS[route.method.toLowerCase()] || METHOD_COLORS.get;
                const cleanEndpoint = route.endpoint.replace(/^\//, '');

                return (
                  <ListItem
                    key={route.uuid}
                    disablePadding
                    secondaryAction={
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoute(route.uuid);
                        }}
                        sx={{
                          opacity: isSelected ? 0.7 : 0,
                          transition: 'opacity 0.2s',
                          p: 0.3,
                          '&:hover': { opacity: 1, color: theme.palette.error.main }
                        }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    }
                    sx={{
                      mb: 0.3,
                      '&:hover .MuiIconButton-root': { opacity: 0.7 }
                    }}
                  >
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => {
                        setSelectedRouteUuid(route.uuid);
                        setActiveTabKey('routes');
                      }}
                      sx={{
                        borderRadius: 1.5,
                        py: 0.4,
                        px: 1,
                        minHeight: 32,
                        gap: 0.8
                      }}
                    >
                      {/* Method color badge */}
                      <Box
                        sx={{
                          px: 0.6,
                          py: 0.15,
                          borderRadius: 0.8,
                          backgroundColor: methodCfg.bg,
                          color: methodCfg.text,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontFamily: "'Fira Code', monospace",
                          fontSize: '0.62rem',
                          flexShrink: 0
                        }}
                      >
                        {route.method}
                      </Box>

                      {/* Path and optional documentation alias */}
                      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, overflow: 'hidden', flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Fira Code', monospace",
                            fontSize: '0.78rem',
                            fontWeight: isSelected ? 600 : 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          /{cleanEndpoint}
                        </Typography>

                        {route.documentation && (
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 0.6,
                              fontSize: '0.68rem',
                              color: theme.palette.text.secondary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {route.documentation}
                          </Typography>
                        )}
                      </Box>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
};
