import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  ListItemIcon,
  Button,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FileOpenRoundedIcon from '@mui/icons-material/FileOpenRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';
import { apiService } from '../../services/api.service';

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const {
    environments,
    activeEnvironmentUuid,
    setActiveEnvironmentUuid,
    serverStatuses,
    toggleServer,
    createEnvironment,
    importEnvironment,
    createEnvironmentFromOpenApi,
    openRecentEnvironment,
    clearRecentEnvironments,
    recentLocalEnvironments,
    exportEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
    settings,
    isSidebarCollapsed,
    toggleSidebar,
    layoutDensity,
    mainMenuSize,
    setMainMenuSize
  } = useApp();

  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; uuid: string } | null>(null);
  const [envMenuAnchorEl, setEnvMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const isCompact = layoutDensity === 'compact';
  const sidebarWidth = isSidebarCollapsed ? 52 : (mainMenuSize || 220);

  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = mainMenuSize || 220;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      setMainMenuSize(startWidth + delta);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, uuid: string) => {
    e.stopPropagation();
    setMenuAnchor({ el: e.currentTarget, uuid });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <Box
      sx={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === 'light'
            ? alpha(theme.palette.background.paper, 0.7)
            : alpha(theme.palette.background.default, 0.95),
        backdropFilter: 'blur(10px)',
        transition: isResizing ? 'none' : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      {/* Top Header / App Brand */}
      <Box
        sx={{
          height: 40,
          minHeight: 40,
          px: isSidebarCollapsed ? 0.8 : 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        {!isSidebarCollapsed ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, overflow: 'hidden' }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '7px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 13,
                  flexShrink: 0,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.35)}`
                }}
              >
                {'{ }'}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                MockPulse
              </Typography>
            </Box>

            <Tooltip title={t.sidebar.collapseSidebar} arrow>
              <IconButton size="small" onClick={toggleSidebar} sx={{ p: 0.5 }}>
                <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title={t.sidebar.expandSidebar} arrow>
            <IconButton size="small" onClick={toggleSidebar} sx={{ p: 0.5 }}>
              <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Environments List Subheader (Local + New/Dropdown button 1:1 with original Mockoon) */}
      {!isSidebarCollapsed && (
        <Box
          sx={{
            px: 1.5,
            pt: 1.2,
            pb: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <LaptopRoundedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                letterSpacing: 0.3,
                fontSize: '0.78rem'
              }}
            >
              {t.sidebar.local || 'Local'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.68rem',
                color: theme.palette.text.disabled,
                ml: -0.2
              }}
            >
              ({environments.length})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.1 }}>
            <Tooltip title={t.sidebar.newLocalEnvironment || 'New local environment'} arrow>
              <IconButton size="small" onClick={createEnvironment} sx={{ p: 0.4, borderRadius: 1 }}>
                <AddRoundedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={locale === 'zh-CN' ? '更多环境选项 (新建 / 打开 / 最近)' : 'More environment options'} arrow>
              <IconButton
                size="small"
                onClick={(e) => setEnvMenuAnchorEl(e.currentTarget)}
                sx={{
                  p: 0.4,
                  borderRadius: 1,
                  backgroundColor: Boolean(envMenuAnchorEl) ? alpha(theme.palette.text.primary, 0.08) : 'transparent'
                }}
              >
                <ArrowDropDownRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* New/Open Environment Dropdown Menu (1:1 with original Mockoon) */}
      <Menu
        anchorEl={envMenuAnchorEl}
        open={Boolean(envMenuAnchorEl)}
        onClose={() => setEnvMenuAnchorEl(null)}
        PaperProps={{
          sx: {
            minWidth: 260,
            maxWidth: 340,
            mt: 0.5,
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
            borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            py: 0.5
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            setEnvMenuAnchorEl(null);
            createEnvironment();
          }}
          sx={{ py: 0.8, px: 1.8, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 1.2 }}
        >
          <NoteAddOutlinedIcon sx={{ fontSize: 17, color: theme.palette.text.secondary }} />
          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
            {t.sidebar.newLocalEnvironment || 'New local environment'}
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setEnvMenuAnchorEl(null);
            importEnvironment();
          }}
          sx={{ py: 0.8, px: 1.8, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 1.2 }}
        >
          <FolderOpenOutlinedIcon sx={{ fontSize: 17, color: theme.palette.text.secondary }} />
          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
            {t.sidebar.openLocalEnvironment || 'Open local environment'}
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setEnvMenuAnchorEl(null);
            createEnvironmentFromOpenApi();
          }}
          sx={{ py: 0.8, px: 1.8, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 1.2 }}
        >
          <PostAddOutlinedIcon sx={{ fontSize: 17, color: theme.palette.text.secondary }} />
          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
            {t.sidebar.newFromOpenApi || 'New local environment from OpenAPI/Swagger'}
          </Typography>
        </MenuItem>

        {recentLocalEnvironments && recentLocalEnvironments.length > 0 && (
          <>
            <Divider sx={{ my: 0.6 }} />
            {recentLocalEnvironments.map((recent, idx) => (
              <MenuItem
                key={recent.path + idx}
                onClick={() => {
                  setEnvMenuAnchorEl(null);
                  openRecentEnvironment(recent.path);
                }}
                sx={{
                  py: 0.7,
                  px: 1.8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 0.2
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    width: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {recent.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.68rem',
                    color: theme.palette.text.secondary,
                    width: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {recent.path}
                </Typography>
              </MenuItem>
            ))}
            <Divider sx={{ my: 0.6 }} />
            <MenuItem
              onClick={() => {
                setEnvMenuAnchorEl(null);
                clearRecentEnvironments();
              }}
              sx={{
                py: 0.8,
                px: 1.8,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.error.main }
              }}
            >
              <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                {t.sidebar.clearRecentlyOpened || 'Clear recently opened'}
              </Typography>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Environments Scrollable List */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: isSidebarCollapsed ? 0.6 : 0.8, py: 0.5 }}>
        <List sx={{ p: 0 }}>
          {environments.map((env) => {
            const isSelected = env.uuid === activeEnvironmentUuid;
            const status = serverStatuses[env.uuid] || 'stopped';
            const isRunning = status === 'running';

            if (isSidebarCollapsed) {
              // Collapsed mode: icon badge + running dot
              return (
                <ListItem key={env.uuid} disablePadding sx={{ mb: 0.8, justifyContent: 'center' }}>
                  <Tooltip title={`${env.name} (:${env.port}) - ${isRunning ? t.app.running : t.app.stopped}`} placement="right" arrow>
                    <Box
                      onClick={() => setActiveEnvironmentUuid(env.uuid)}
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        backgroundColor: isSelected
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.text.primary, 0.04),
                        border: isSelected ? `1.5px solid ${theme.palette.primary.main}` : '1px solid transparent',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2)
                        }
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {env.name.charAt(0).toUpperCase()}
                      </Typography>
                      {/* Status indicator */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 2,
                          right: 2,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: isRunning ? theme.palette.success.main : theme.palette.text.disabled,
                          border: `1.5px solid ${theme.palette.background.paper}`,
                          boxShadow: isRunning ? `0 0 6px ${theme.palette.success.main}` : 'none'
                        }}
                      />
                    </Box>
                  </Tooltip>
                </ListItem>
              );
            }

            // Expanded mode: full item
            return (
              <ListItem
                key={env.uuid}
                disablePadding
                secondaryAction={
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, env.uuid)}
                    sx={{
                      p: 0.4,
                      opacity: isSelected ? 1 : 0.4,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <MoreVertRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                }
                sx={{ mb: 0.4 }}
              >
                <ListItemButton
                  selected={isSelected}
                  onClick={() => setActiveEnvironmentUuid(env.uuid)}
                  sx={{
                    borderRadius: 1.5,
                    py: isCompact ? 0.6 : 0.9,
                    px: isCompact ? 1 : 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2
                  }}
                >
                  {/* Server Play/Stop Button with Status Indicator */}
                  <Tooltip title={isRunning ? t.app.stopServer : t.app.startServer} arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleServer(env.uuid);
                      }}
                      sx={{
                        p: 0.4,
                        backgroundColor: isRunning
                          ? alpha(theme.palette.success.main, 0.15)
                          : alpha(theme.palette.text.secondary, 0.1),
                        color: isRunning ? theme.palette.success.main : theme.palette.text.secondary,
                        '&:hover': {
                          backgroundColor: isRunning
                            ? alpha(theme.palette.error.main, 0.2)
                            : alpha(theme.palette.primary.main, 0.2),
                          color: isRunning ? theme.palette.error.main : theme.palette.primary.main
                        }
                      }}
                    >
                      {isRunning ? (
                        <StopRoundedIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                  </Tooltip>

                  <ListItemText
                    sx={{ minWidth: 0, overflow: 'hidden' }}
                    primary={
                      <Tooltip title={env.name} arrow enterDelay={400} placement="top">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 600 : 500,
                            lineHeight: 1.25,
                            fontSize: isCompact ? '0.78rem' : '0.85rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {env.name}
                        </Typography>
                      </Tooltip>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.2 }}>
                        <Box
                          sx={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            backgroundColor: isRunning
                              ? theme.palette.success.main
                              : theme.palette.text.disabled,
                            boxShadow: isRunning
                              ? `0 0 5px ${theme.palette.success.main}`
                              : 'none'
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "'Fira Code', monospace",
                            fontSize: '0.68rem',
                            color: isRunning ? theme.palette.success.main : theme.palette.text.secondary
                          }}
                        >
                          :{env.port}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Action Footer */}
      <Box
        sx={{
          p: isSidebarCollapsed ? 0.8 : 1.2,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {!isSidebarCollapsed ? (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={createEnvironment}
            sx={{
              py: isCompact ? 0.5 : 0.7,
              fontSize: isCompact ? '0.75rem' : '0.8rem',
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            {t.sidebar.newEnvironment}
          </Button>
        ) : (
          <Tooltip title={t.sidebar.newEnvironment} placement="right" arrow>
            <IconButton
              size="small"
              onClick={createEnvironment}
              sx={{
                width: 34,
                height: 34,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            if (menuAnchor) duplicateEnvironment(menuAnchor.uuid);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <ContentCopyRoundedIcon fontSize="small" />
          </ListItemIcon>
          {t.sidebar.duplicateEnvironment}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuAnchor) {
              const env = environments.find((e) => e.uuid === menuAnchor.uuid);
              if (env) exportEnvironment(env);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <FileDownloadRoundedIcon fontSize="small" />
          </ListItemIcon>
          {t.sidebar.exportEnvironment}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuAnchor && settings) {
              const desc = settings.environments.find((d) => d.uuid === menuAnchor.uuid);
              if (desc?.path) {
                apiService.showFile(desc.path);
              }
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <FolderOpenRoundedIcon fontSize="small" />
          </ListItemIcon>
          {t.sidebar.openInFolder}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (menuAnchor) {
              if (window.confirm(t.sidebar.deleteConfirm)) {
                deleteEnvironment(menuAnchor.uuid);
              }
            }
            handleMenuClose();
          }}
          disabled={environments.length <= 1}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          {t.sidebar.deleteEnvironment}
        </MenuItem>
      </Menu>

      {/* Resizable Splitter Handle */}
      {!isSidebarCollapsed && (
        <Box
          onMouseDown={handleSplitterMouseDown}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 5,
            height: '100%',
            cursor: 'col-resize',
            zIndex: 10,
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.4)
            }
          }}
        />
      )}
    </Box>
  );
};
