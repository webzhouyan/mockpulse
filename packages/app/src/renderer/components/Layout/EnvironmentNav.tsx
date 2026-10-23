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
  ListItemText,
  Collapse,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  alpha,
  useTheme,
  InputAdornment
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
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
  head: { bg: '#06b6d4', text: '#ffffff' },
  all: { bg: '#14b8a6', text: '#ffffff' },
  crud: { bg: '#8b5cf6', text: '#ffffff' },
  ws: { bg: '#06b6d4', text: '#ffffff' }
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
    duplicateRoute,
    deleteRoute,
    addFolder,
    serverLogs,
    layoutDensity
  } = useApp();

  const isCompact = layoutDensity === 'compact';
  const [search, setSearch] = useState('');
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);

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
        (r.method && r.method.toLowerCase().includes(q)) ||
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
            ? alpha(theme.palette.background.paper, 0.5)
            : alpha(theme.palette.background.default, 0.65),
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Top Search & Add Route with Dropdown Menu */}
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

        {/* Add Route Button with Dropdown */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: 1.5,
            overflow: 'hidden',
            backgroundColor: theme.palette.primary.main,
            flexShrink: 0,
            boxShadow: `0 1px 4px ${alpha(theme.palette.primary.main, 0.35)}`
          }}
        >
          <Tooltip title="新增 HTTP 路由 (Add Route)" arrow>
            <IconButton
              size="small"
              onClick={() => addRoute('http')}
              sx={{
                width: 26,
                height: 32,
                borderRadius: 0,
                color: '#ffffff',
                '&:hover': { backgroundColor: theme.palette.primary.dark }
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: '1px', height: 18, backgroundColor: alpha('#ffffff', 0.3) }} />

          <Tooltip title="更多路由类型 (More types)" arrow>
            <IconButton
              size="small"
              onClick={(e) => setAddMenuAnchor(e.currentTarget)}
              sx={{
                width: 18,
                height: 32,
                borderRadius: 0,
                color: '#ffffff',
                p: 0,
                '&:hover': { backgroundColor: theme.palette.primary.dark }
              }}
            >
              <ArrowDropDownRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Dropdown Menu for New Route / Folder */}
        <Menu
          anchorEl={addMenuAnchor}
          open={Boolean(addMenuAnchor)}
          onClose={() => setAddMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              minWidth: 200,
              borderRadius: 2,
              mt: 0.5,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }
          }}
        >
          <MenuItem
            onClick={() => {
              addRoute('http');
              setAddMenuAnchor(null);
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ fontSize: 16 }}>🌐</ListItemIcon>
            <ListItemText
              primary="HTTP 路由 (HTTP route)"
              primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }}
            />
          </MenuItem>

          <MenuItem
            onClick={() => {
              addRoute('crud');
              setAddMenuAnchor(null);
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ fontSize: 16 }}>⚙️</ListItemIcon>
            <ListItemText
              primary="CRUD 路由 (CRUD route)"
              primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }}
            />
          </MenuItem>

          <MenuItem
            onClick={() => {
              addRoute('ws');
              setAddMenuAnchor(null);
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ fontSize: 16 }}>🔌</ListItemIcon>
            <ListItemText
              primary="WebSocket 路由 (WebSocket)"
              primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }}
            />
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          <MenuItem
            onClick={() => {
              addFolder();
              setAddMenuAnchor(null);
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ fontSize: 16 }}>🗂️</ListItemIcon>
            <ListItemText
              primary="新建文件夹 (Folder)"
              primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }}
            />
          </MenuItem>
        </Menu>
      </Box>

      {/* Nav Content Tree */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 0.8 }}>
        {/* Group 1: Global Configuration (Bold & Larger title) */}
        <Box sx={{ mb: 1.2 }}>
          <Box
            onClick={toggleGlobalConfig}
            sx={{
              px: 1,
              py: 0.8,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: 1.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.05)
              }
            }}
          >
            {isGlobalConfigOpen ? (
              <ExpandMoreRoundedIcon sx={{ fontSize: 18, mr: 0.5, color: theme.palette.text.primary }} />
            ) : (
              <ChevronRightRoundedIcon sx={{ fontSize: 18, mr: 0.5, color: theme.palette.text.primary }} />
            )}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                fontSize: '0.86rem',
                color: theme.palette.text.primary,
                letterSpacing: '-0.01em'
              }}
            >
              环境全局配置
            </Typography>
          </Box>

          <Collapse in={isGlobalConfigOpen}>
            {/* Sub items: Smaller font, indented */}
            <List sx={{ p: 0, mt: 0.3, pl: 0.8 }}>
              {/* Request Logs */}
              <ListItem disablePadding sx={{ mb: 0.2 }}>
                <ListItemButton
                  selected={activeTabKey === 'logs'}
                  onClick={() => setActiveTabKey('logs')}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.4,
                    px: 1,
                    minHeight: 30
                  }}
                >
                  <ArticleOutlinedIcon sx={{ fontSize: 15, mr: 1, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="请求日志"
                    primaryTypographyProps={{
                      fontSize: '0.74rem',
                      fontWeight: activeTabKey === 'logs' ? 600 : 500,
                      color: activeTabKey === 'logs' ? theme.palette.primary.main : theme.palette.text.secondary
                    }}
                  />
                  {logsCount > 0 && (
                    <Box
                      sx={{
                        px: 0.6,
                        py: 0.1,
                        borderRadius: 1,
                        fontSize: '0.62rem',
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
                    py: 0.4,
                    px: 1,
                    minHeight: 30
                  }}
                >
                  <CallSplitRoundedIcon sx={{ fontSize: 15, mr: 1, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="回调 Webhook"
                    primaryTypographyProps={{
                      fontSize: '0.74rem',
                      fontWeight: activeTabKey === 'callbacks' ? 600 : 500,
                      color: activeTabKey === 'callbacks' ? theme.palette.primary.main : theme.palette.text.secondary
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
                    py: 0.4,
                    px: 1,
                    minHeight: 30
                  }}
                >
                  <MailOutlineRoundedIcon sx={{ fontSize: 15, mr: 1, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="全局请求头"
                    primaryTypographyProps={{
                      fontSize: '0.74rem',
                      fontWeight: activeTabKey === 'headers' ? 600 : 500,
                      color: activeTabKey === 'headers' ? theme.palette.primary.main : theme.palette.text.secondary
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
                    py: 0.4,
                    px: 1,
                    minHeight: 30
                  }}
                >
                  <StorageRoundedIcon sx={{ fontSize: 15, mr: 1, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="数据桶"
                    primaryTypographyProps={{
                      fontSize: '0.74rem',
                      fontWeight: activeTabKey === 'dataBuckets' ? 600 : 500,
                      color: activeTabKey === 'dataBuckets' ? theme.palette.primary.main : theme.palette.text.secondary
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
                    py: 0.4,
                    px: 1,
                    minHeight: 30
                  }}
                >
                  <SwapHorizRoundedIcon sx={{ fontSize: 15, mr: 1, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="代理转发"
                    primaryTypographyProps={{
                      fontSize: '0.74rem',
                      fontWeight: activeTabKey === 'proxy' ? 600 : 500,
                      color: activeTabKey === 'proxy' ? theme.palette.primary.main : theme.palette.text.secondary
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
                    py: 0.4,
                    px: 1,
                    minHeight: 30
                  }}
                >
                  <SettingsOutlinedIcon sx={{ fontSize: 15, mr: 1, color: theme.palette.text.secondary }} />
                  <ListItemText
                    primary="环境设置"
                    primaryTypographyProps={{
                      fontSize: '0.74rem',
                      fontWeight: activeTabKey === 'settings' ? 600 : 500,
                      color: activeTabKey === 'settings' ? theme.palette.primary.main : theme.palette.text.secondary
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
        </Box>

        {/* Group 2: Routes List (Bold & Larger title) */}
        <Box>
          <Box
            onClick={toggleRoutes}
            sx={{
              px: 1,
              py: 0.8,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: 1.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.05)
              }
            }}
          >
            {isRoutesOpen ? (
              <ExpandMoreRoundedIcon sx={{ fontSize: 18, mr: 0.5, color: theme.palette.text.primary }} />
            ) : (
              <ChevronRightRoundedIcon sx={{ fontSize: 18, mr: 0.5, color: theme.palette.text.primary }} />
            )}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                fontSize: '0.86rem',
                color: theme.palette.text.primary,
                letterSpacing: '-0.01em',
                flex: 1
              }}
            >
              路由接口 ({routes.length})
            </Typography>
          </Box>

          <Collapse in={isRoutesOpen}>
            <List sx={{ p: 0, mt: 0.3 }}>
              {filteredRoutes.map((route) => {
                const isSelected = activeTabKey === 'routes' && selectedRouteUuid === route.uuid;
                const methodKey = (route.type === 'crud' ? 'crud' : route.type === 'ws' ? 'ws' : route.method).toLowerCase();
                const methodCfg = METHOD_COLORS[methodKey] || METHOD_COLORS.get;
                const badgeLabel = route.type === 'crud' ? 'CRUD' : route.type === 'ws' ? 'WS' : route.method;
                const cleanEndpoint = (route.endpoint || '').replace(/^\//, '');

                return (
                  <ListItem
                    key={route.uuid}
                    disablePadding
                    secondaryAction={
                      <Box
                        className="route-actions"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.3,
                          opacity: isSelected ? 0.9 : 0,
                          transition: 'opacity 0.2s ease',
                          pr: 0.2
                        }}
                      >
                        {/* Duplicate Route Button (Left of Delete) */}
                        <Tooltip title="复制路由 (Duplicate)" arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateRoute(route.uuid);
                            }}
                            sx={{
                              p: 0.4,
                              color: theme.palette.text.secondary,
                              '&:hover': { color: theme.palette.primary.main }
                            }}
                          >
                            <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>

                        {/* Delete Route Button */}
                        <Tooltip title="删除路由 (Delete)" arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRoute(route.uuid);
                            }}
                            sx={{
                              p: 0.4,
                              color: theme.palette.text.secondary,
                              '&:hover': { color: theme.palette.error.main }
                            }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                    sx={{
                      mb: 0.3,
                      '&:hover .route-actions': { opacity: 0.9 }
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
                        {badgeLabel}
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
