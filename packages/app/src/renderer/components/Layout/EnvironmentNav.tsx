import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  Collapse,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Route,
  Folder,
  FolderChild,
  Environment,
  reorderRoutesMutator,
  ReorderActionType
} from '@mockoon/commons';
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

interface DropIndicator {
  targetId: string;
  position: 'BEFORE' | 'AFTER' | 'INSIDE';
}

export const EnvironmentNav: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const {
    activeEnvironment,
    updateActiveEnvironment,
    activeTabKey,
    setActiveTabKey,
    selectedRouteUuid,
    setSelectedRouteUuid,
    addRoute,
    duplicateRoute,
    deleteRoute,
    addFolder,
    updateFolder,
    deleteFolder,
    serverLogs,
    layoutDensity,
    secondaryMenuSize,
    setSecondaryMenuSize
  } = useApp();

  const isCompact = layoutDensity === 'compact';
  const [search, setSearch] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);

  // Rename folder dialog
  const [editingFolder, setEditingFolder] = useState<{ uuid: string; name: string } | null>(null);

  // Drag and drop states
  const [draggingItem, setDraggingItem] = useState<{ id: string; isFolder: boolean; parentId: string } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);

  // Persist collapsible sections
  const [isGlobalConfigOpen, setIsGlobalConfigOpen] = useState<boolean>(() => {
    return localStorage.getItem('mockpulse_nav_global_open') !== 'false';
  });

  const [isRoutesOpen, setIsRoutesOpen] = useState<boolean>(() => {
    return localStorage.getItem('mockpulse_nav_routes_open') !== 'false';
  });

  // Collapsed folders state
  const [collapsedFolderUuids, setCollapsedFolderUuids] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('mockpulse_collapsed_folders') || '{}');
    } catch {
      return {};
    }
  });

  const toggleFolderCollapse = (uuid: string) => {
    setCollapsedFolderUuids((prev) => {
      const next = { ...prev, [uuid]: !prev[uuid] };
      localStorage.setItem('mockpulse_collapsed_folders', JSON.stringify(next));
      return next;
    });
  };

  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = secondaryMenuSize || 280;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      setSecondaryMenuSize(startWidth + delta);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

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
  const folders = activeEnvironment?.folders || [];

  // Map for fast route and folder lookup
  const routeMap = useMemo(() => {
    const map = new Map<string, Route>();
    routes.forEach((r) => map.set(r.uuid, r));
    return map;
  }, [routes]);

  const folderMap = useMemo(() => {
    const map = new Map<string, Folder>();
    folders.forEach((f) => map.set(f.uuid, f));
    return map;
  }, [folders]);

  // Compute Root Items to display
  const rootChildrenList: FolderChild[] = useMemo(() => {
    if (!activeEnvironment) return [];
    const allAccountedFor = new Set<string>();
    (activeEnvironment.rootChildren || []).forEach((c) => allAccountedFor.add(c.uuid));
    folders.forEach((f) => f.children?.forEach((fc) => allAccountedFor.add(fc.uuid)));

    const extraFolders: FolderChild[] = folders
      .filter((f) => !allAccountedFor.has(f.uuid))
      .map((f) => ({ type: 'folder', uuid: f.uuid }));

    const extraRoutes: FolderChild[] = routes
      .filter((r) => !allAccountedFor.has(r.uuid))
      .map((r) => ({ type: 'route', uuid: r.uuid }));

    return [...(activeEnvironment.rootChildren || []), ...extraFolders, ...extraRoutes];
  }, [activeEnvironment?.rootChildren, routes, folders]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string, isFolder: boolean, parentId: string) => {
    e.stopPropagation();
    const item = { id, isFolder, parentId };
    setDraggingItem(item);
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
    setDropIndicator(null);
  };

  const handleDragOverItem = (
    e: React.DragEvent,
    targetId: string,
    isTargetFolder: boolean,
    targetParentId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingItem || draggingItem.id === targetId) {
      setDropIndicator(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;

    if (isTargetFolder) {
      if (relY < 6) {
        setDropIndicator({ targetId, position: 'BEFORE' });
      } else if (relY > rect.height - 6) {
        setDropIndicator({ targetId, position: 'AFTER' });
      } else {
        setDropIndicator({ targetId, position: 'INSIDE' });
      }
    } else {
      if (relY < rect.height / 2) {
        setDropIndicator({ targetId, position: 'BEFORE' });
      } else {
        setDropIndicator({ targetId, position: 'AFTER' });
      }
    }
    e.dataTransfer.dropEffect = 'move';
  };

  // Robust Tree Move to guarantee moving route inside folder
  const executeMove = useCallback(
    (sourceId: string, isSourceFolder: boolean, targetId: string, isTargetFolder: boolean, action: 'BEFORE' | 'AFTER' | 'INSIDE', targetParentId: string) => {
      if (!activeEnvironment) return;

      // Ensure activeEnvironment has synchronized rootChildren before mutator runs
      const accounted = new Set<string>();
      (activeEnvironment.rootChildren || []).forEach((c) => accounted.add(c.uuid));
      (activeEnvironment.folders || []).forEach((f) => f.children?.forEach((fc) => accounted.add(fc.uuid)));

      const missingRoots: FolderChild[] = [];
      (activeEnvironment.folders || []).forEach((f) => {
        if (!accounted.has(f.uuid)) missingRoots.push({ type: 'folder', uuid: f.uuid });
      });
      (activeEnvironment.routes || []).forEach((r) => {
        if (!accounted.has(r.uuid)) missingRoots.push({ type: 'route', uuid: r.uuid });
      });

      const normalizedEnv: Environment = {
        ...activeEnvironment,
        rootChildren: [...(activeEnvironment.rootChildren || []), ...missingRoots]
      };

      // 1. Direct Move INSIDE Folder
      if (action === 'INSIDE' && isTargetFolder && !isSourceFolder) {
        // Remove source route from root and all folders
        const cleanRoot = normalizedEnv.rootChildren.filter((c) => c.uuid !== sourceId);
        const cleanFolders = normalizedEnv.folders.map((f) => {
          if (f.uuid === targetId) {
            const alreadyHas = f.children.some((c) => c.uuid === sourceId);
            return {
              ...f,
              children: alreadyHas ? f.children : [...f.children, { type: 'route' as const, uuid: sourceId }]
            };
          }
          return {
            ...f,
            children: f.children.filter((c) => c.uuid !== sourceId)
          };
        });

        updateActiveEnvironment(() => ({
          ...normalizedEnv,
          rootChildren: cleanRoot,
          folders: cleanFolders
        }));

        // Expand target folder automatically so user sees the moved route
        setCollapsedFolderUuids((prev) => ({ ...prev, [targetId]: false }));
        return;
      }

      // 2. Standard Mutator for BEFORE/AFTER reorder
      try {
        const actionType =
          action === 'INSIDE'
            ? ReorderActionType.INSIDE
            : action === 'BEFORE'
            ? ReorderActionType.BEFORE
            : ReorderActionType.AFTER;

        const updated = reorderRoutesMutator(normalizedEnv, {
          sourceId,
          targetId,
          targetParentId: action === 'INSIDE' ? targetId : targetParentId,
          reorderActionType: actionType,
          isSourceContainer: isSourceFolder,
          isTargetContainer: isTargetFolder
        });

        updateActiveEnvironment(() => updated);
      } catch (err) {
        console.error('Failed to reorder tree:', err);
      }
    },
    [activeEnvironment, updateActiveEnvironment]
  );

  const handleDropOnItem = (
    e: React.DragEvent,
    targetId: string,
    isTargetFolder: boolean,
    targetParentId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggingItem || !dropIndicator || !activeEnvironment) {
      setDraggingItem(null);
      setDropIndicator(null);
      return;
    }

    if (draggingItem.id === targetId) {
      setDraggingItem(null);
      setDropIndicator(null);
      return;
    }

    executeMove(
      draggingItem.id,
      draggingItem.isFolder,
      targetId,
      isTargetFolder,
      dropIndicator.position,
      targetParentId
    );

    setDraggingItem(null);
    setDropIndicator(null);
  };

  if (!activeEnvironment) return null;

  // Render a single route item
  const renderRouteItem = (route: Route, parentFolderUuid = 'root', indent = false) => {
    // If search active, check match
    if (search.trim()) {
      const q = search.toLowerCase();
      const matches =
        (route.endpoint || '').toLowerCase().includes(q) ||
        (route.method && route.method.toLowerCase().includes(q)) ||
        (route.documentation && route.documentation.toLowerCase().includes(q));
      if (!matches) return null;
    }

    const isSelected = activeTabKey === 'routes' && selectedRouteUuid === route.uuid;
    const isDragging = !!draggingItem && draggingItem.id === route.uuid;
    const isDropBefore = !!dropIndicator && !!route.uuid && dropIndicator.targetId === route.uuid && dropIndicator.position === 'BEFORE';
    const isDropAfter = !!dropIndicator && !!route.uuid && dropIndicator.targetId === route.uuid && dropIndicator.position === 'AFTER';

    const methodKey = (route.type === 'crud' ? 'crud' : route.type === 'ws' ? 'ws' : route.method || 'get').toLowerCase();
    const methodCfg = METHOD_COLORS[methodKey] || METHOD_COLORS.get;
    const badgeLabel = route.type === 'crud' ? 'CRUD' : route.type === 'ws' ? 'WS' : route.method || 'GET';
    const cleanEndpoint = (route.endpoint || '').replace(/^\//, '');

    return (
      <ListItem
        key={route.uuid}
        disablePadding
        draggable
        onDragStart={(e) => handleDragStart(e, route.uuid, false, parentFolderUuid)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOverItem(e, route.uuid, false, parentFolderUuid)}
        onDrop={(e) => handleDropOnItem(e, route.uuid, false, parentFolderUuid)}
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
            {/* Duplicate Route Button */}
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
          cursor: 'grab',
          opacity: isDragging ? 0.35 : 1,
          borderTop: isDropBefore ? `2px solid ${theme.palette.primary.main}` : 'none',
          borderBottom: isDropAfter ? `2px solid ${theme.palette.primary.main}` : 'none',
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
            py: route.documentation ? 0.45 : 0.4,
            px: 1,
            pl: indent ? 2.5 : 1,
            pr: 4.8, // prevent secondaryAction from overlapping text
            minHeight: 32,
            alignItems: 'flex-start'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', flex: 1 }}>
            {/* Line 1: Method Micro-Badge + Path */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0 }}>
              <Box
                sx={{
                  px: 0.5,
                  py: 0.1,
                  minWidth: 34,
                  textAlign: 'center',
                  borderRadius: 0.6,
                  backgroundColor: methodCfg.bg,
                  color: methodCfg.text,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontFamily: "'Fira Code', monospace",
                  fontSize: '0.62rem',
                  lineHeight: 1.25,
                  flexShrink: 0,
                  letterSpacing: '0.01em'
                }}
              >
                {badgeLabel}
              </Box>

              <Tooltip title={`/${cleanEndpoint}`} arrow enterDelay={400} placement="top">
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected
                      ? theme.palette.text.primary
                      : theme.palette.mode === 'light'
                      ? '#1e293b'
                      : '#f1f5f9',
                    letterSpacing: '-0.01em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  /{cleanEndpoint}
                </Typography>
              </Tooltip>
            </Box>

            {/* Line 2 (Optional): Documentation in subtle small font */}
            {route.documentation && (
              <Tooltip title={route.documentation} arrow enterDelay={400} placement="top">
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    mt: 0.25,
                    pl: 0.2,
                    fontSize: '0.68rem',
                    color: theme.palette.text.secondary,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {route.documentation}
                </Typography>
              </Tooltip>
            )}
          </Box>
        </ListItemButton>
      </ListItem>
    );
  };

  // Render a folder item
  const renderFolderItem = (folder: Folder) => {
    const isCollapsed = !!collapsedFolderUuids[folder.uuid];
    const isDragging = !!draggingItem && draggingItem.id === folder.uuid;
    const isDropBefore = !!dropIndicator && !!folder.uuid && dropIndicator.targetId === folder.uuid && dropIndicator.position === 'BEFORE';
    const isDropAfter = !!dropIndicator && !!folder.uuid && dropIndicator.targetId === folder.uuid && dropIndicator.position === 'AFTER';
    const isDropInside = !!dropIndicator && !!folder.uuid && dropIndicator.targetId === folder.uuid && dropIndicator.position === 'INSIDE';

    const childRoutes = (folder.children || [])
      .map((c) => (c.type === 'route' ? routeMap.get(c.uuid) : null))
      .filter((r): r is Route => Boolean(r));

    return (
      <Box
        key={folder.uuid}
        draggable
        onDragStart={(e) => handleDragStart(e, folder.uuid, true, 'root')}
        onDragEnd={handleDragEnd}
        sx={{
          mb: 0.4,
          borderRadius: 1.5,
          opacity: isDragging ? 0.35 : 1,
          borderTop: isDropBefore ? `2px solid ${theme.palette.primary.main}` : 'none',
          borderBottom: isDropAfter ? `2px solid ${theme.palette.primary.main}` : 'none'
        }}
      >
        {/* Folder Header as Drop Target */}
        <Box
          className="folder-header"
          onDragOver={(e) => handleDragOverItem(e, folder.uuid, true, 'root')}
          onDrop={(e) => handleDropOnItem(e, folder.uuid, true, 'root')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 0.8,
            py: 0.4,
            borderRadius: 1.5,
            minHeight: 32,
            cursor: 'pointer',
            backgroundColor: isDropInside
              ? alpha(theme.palette.primary.main, 0.16)
              : 'transparent',
            transition: 'background-color 0.15s ease',
            '&:hover': {
              backgroundColor: isDropInside
                ? alpha(theme.palette.primary.main, 0.18)
                : alpha(theme.palette.text.primary, 0.04)
            },
            '&:hover .folder-actions': { opacity: 0.9 }
          }}
        >
          {/* Collapse Toggle */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolderCollapse(folder.uuid);
            }}
            sx={{ p: 0.3, mr: 0.3 }}
          >
            {isCollapsed ? (
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>

          {/* Folder Icon */}
          {isCollapsed ? (
            <FolderRoundedIcon sx={{ fontSize: 16, mr: 0.8, color: '#f59e0b' }} />
          ) : (
            <FolderOpenRoundedIcon sx={{ fontSize: 16, mr: 0.8, color: '#f59e0b' }} />
          )}

          {/* Folder Name */}
          <Typography
            variant="body2"
            noWrap
            onClick={() => toggleFolderCollapse(folder.uuid)}
            sx={{
              fontWeight: 600,
              fontSize: '0.78rem',
              flex: 1
            }}
          >
            {folder.name}
          </Typography>

          <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontSize: '0.68rem', mr: 0.5 }}>
            ({childRoutes.length})
          </Typography>

          {/* Folder Actions */}
          <Box
            className="folder-actions"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.2,
              opacity: 0,
              transition: 'opacity 0.2s'
            }}
          >
            <Tooltip title="重命名文件夹" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFolder({ uuid: folder.uuid, name: folder.name });
                }}
                sx={{ p: 0.3, color: theme.palette.text.secondary, '&:hover': { color: theme.palette.primary.main } }}
              >
                <EditRoundedIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="删除文件夹" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(folder.uuid);
                }}
                sx={{ p: 0.3, color: theme.palette.text.secondary, '&:hover': { color: theme.palette.error.main } }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Children Routes inside Folder */}
        <Collapse in={!isCollapsed}>
          <List
            sx={{ p: 0, mt: 0.2 }}
            onDragOver={(e) => {
              if (childRoutes.length === 0) {
                e.preventDefault();
                e.stopPropagation();
                setDropIndicator({ targetId: folder.uuid, position: 'INSIDE' });
              }
            }}
            onDrop={(e) => {
              if (childRoutes.length === 0) {
                handleDropOnItem(e, folder.uuid, true, 'root');
              }
            }}
          >
            {childRoutes.map((route) => renderRouteItem(route, folder.uuid, true))}
            {childRoutes.length === 0 && (
              <Box
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropIndicator({ targetId: folder.uuid, position: 'INSIDE' });
                }}
                onDrop={(e) => handleDropOnItem(e, folder.uuid, true, 'root')}
                sx={{
                  pl: 3.5,
                  py: 0.8,
                  borderRadius: 1,
                  backgroundColor: isDropInside ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: isDropInside ? theme.palette.primary.main : theme.palette.text.disabled,
                    fontSize: '0.7rem',
                    fontStyle: 'italic',
                    fontWeight: isDropInside ? 600 : 400
                  }}
                >
                  {isDropInside ? '释放以移入此文件夹' : '(空文件夹，可直接拖入接口)'}
                </Typography>
              </Box>
            )}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: secondaryMenuSize || 280,
        minWidth: secondaryMenuSize || 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === 'light'
            ? alpha(theme.palette.background.paper, 0.5)
            : alpha(theme.palette.background.default, 0.65),
        transition: isResizing
          ? 'none'
          : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Top Search & Harmonious Compact Add Route Control */}
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

        {/* Harmonious Compact Add Control (32px high, seamless, beautiful) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: 32,
            borderRadius: 1.5,
            backgroundColor: theme.palette.primary.main,
            color: '#ffffff',
            overflow: 'hidden',
            boxShadow: `0 1px 3px ${alpha(theme.palette.primary.main, 0.35)}`,
            transition: 'background-color 0.2s ease',
            flexShrink: 0,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            }
          }}
        >
          <Tooltip title="一键新增 HTTP 接口" arrow>
            <Box
              onClick={() => addRoute('http')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 32,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                '&:hover': { backgroundColor: alpha('#ffffff', 0.15) }
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
          </Tooltip>

          <Tooltip title="更多类型：CRUD / WebSocket / 文件夹" arrow>
            <Box
              onClick={(e) => setAddMenuAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 32,
                cursor: 'pointer',
                borderLeft: `1px solid ${alpha('#ffffff', 0.2)}`,
                transition: 'background-color 0.15s ease',
                '&:hover': { backgroundColor: alpha('#ffffff', 0.15) }
              }}
            >
              <ArrowDropDownRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
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

        {/* Group 2: Routes & Folders Tree (Bold & Larger title, Draggable) */}
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
              {rootChildrenList.map((item) => {
                if (!item || !item.uuid) return null;
                if (item.type === 'folder') {
                  const folder = folderMap.get(item.uuid);
                  if (!folder) return null;
                  return renderFolderItem(folder);
                } else {
                  const route = routeMap.get(item.uuid);
                  if (!route) return null;
                  return renderRouteItem(route, 'root', false);
                }
              })}
            </List>
          </Collapse>
        </Box>
      </Box>

      {/* Rename Folder Dialog */}
      <Dialog
        open={Boolean(editingFolder)}
        onClose={() => setEditingFolder(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ py: 1.5, fontSize: '0.9rem', fontWeight: 700 }}>
          重命名文件夹
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={editingFolder?.name || ''}
            onChange={(e) => setEditingFolder((prev) => (prev ? { ...prev, name: e.target.value } : null))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && editingFolder) {
                updateFolder(editingFolder.uuid, { name: editingFolder.name });
                setEditingFolder(null);
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button size="small" onClick={() => setEditingFolder(null)}>
            取消
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              if (editingFolder) {
                updateFolder(editingFolder.uuid, { name: editingFolder.name });
                setEditingFolder(null);
              }
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resizable Splitter Handle */}
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
    </Box>
  );
};
