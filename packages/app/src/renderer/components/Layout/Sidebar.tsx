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
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';
import { apiService } from '../../services/api.service';

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const {
    environments,
    activeEnvironmentUuid,
    setActiveEnvironmentUuid,
    serverStatuses,
    toggleServer,
    createEnvironment,
    importEnvironment,
    exportEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
    settings,
    isSidebarCollapsed,
    toggleSidebar,
    layoutDensity
  } = useApp();

  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; uuid: string } | null>(null);

  const isCompact = layoutDensity === 'compact';
  const sidebarWidth = isSidebarCollapsed ? 56 : isCompact ? 230 : 260;

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
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === 'light'
            ? alpha(theme.palette.background.paper, 0.7)
            : alpha(theme.palette.background.default, 0.95),
        backdropFilter: 'blur(10px)',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      {/* Top Header / App Brand */}
      <Box
        sx={{
          height: isCompact ? 42 : 52,
          minHeight: isCompact ? 42 : 52,
          px: isSidebarCollapsed ? 1 : 1.5,
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

      {/* Environments List Subheader */}
      {!isSidebarCollapsed && (
        <Box
          sx={{
            px: 1.5,
            pt: 1.2,
            pb: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              fontSize: '0.68rem'
            }}
          >
            {t.sidebar.environments} ({environments.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.2 }}>
            <Tooltip title={t.sidebar.importEnvironment} arrow>
              <IconButton size="small" onClick={importEnvironment} sx={{ p: 0.4 }}>
                <FileOpenRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t.sidebar.newEnvironment} arrow>
              <IconButton size="small" onClick={createEnvironment} sx={{ p: 0.4 }}>
                <AddRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

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
                    primary={
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
    </Box>
  );
};
