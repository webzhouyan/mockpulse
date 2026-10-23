import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Paper,
  Divider,
  InputAdornment,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  FormControlLabel,
  Tooltip,
  Snackbar,
  Alert,
  alpha,
  useTheme
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import FileOpenRoundedIcon from '@mui/icons-material/FileOpenRounded';
import { Route, RouteResponse, Header as ResponseHeader, ResponseRule } from '@mockoon/commons';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';
import { apiService } from '../../services/api.service';
import { Resizer } from '../Common/Resizer';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all'];

export const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  get: { bg: '#10b981', text: '#ffffff' },
  post: { bg: '#3b82f6', text: '#ffffff' },
  put: { bg: '#f59e0b', text: '#ffffff' },
  patch: { bg: '#8b5cf6', text: '#ffffff' },
  delete: { bg: '#ef4444', text: '#ffffff' },
  options: { bg: '#64748b', text: '#ffffff' },
  head: { bg: '#06b6d4', text: '#ffffff' },
  all: { bg: '#ec4899', text: '#ffffff' }
};

const COMMON_STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 422, 500, 502];

export const RoutesView: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const { activeEnvironment, updateActiveEnvironment, layoutDensity } = useApp();
  const isCompact = layoutDensity === 'compact';

  const [leftWidth, setLeftWidth] = useState(isCompact ? 260 : 300);
  const [search, setSearch] = useState('');
  const [selectedRouteUuid, setSelectedRouteUuid] = useState<string | null>(null);
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);
  const [responseSubTab, setResponseSubTab] = useState(0); // 0: Body, 1: Headers, 2: Rules
  const [copyFeedback, setCopyFeedback] = useState(false);

  const routes = activeEnvironment?.routes || [];

  // Filter routes
  const filteredRoutes = useMemo(() => {
    if (!search.trim()) return routes;
    const q = search.toLowerCase();
    return routes.filter(
      (r) =>
        r.endpoint.toLowerCase().includes(q) ||
        r.method.toLowerCase().includes(q) ||
        r.documentation?.toLowerCase().includes(q)
    );
  }, [routes, search]);

  const activeRoute = useMemo(() => {
    return routes.find((r) => r.uuid === selectedRouteUuid) || filteredRoutes[0] || routes[0] || null;
  }, [routes, selectedRouteUuid, filteredRoutes]);

  const activeResponse = useMemo(() => {
    if (!activeRoute || !activeRoute.responses || activeRoute.responses.length === 0) return null;
    return activeRoute.responses[selectedResponseIndex] || activeRoute.responses[0];
  }, [activeRoute, selectedResponseIndex]);

  // Route updates
  const updateRoute = (updater: (prev: Route) => Route) => {
    if (!activeRoute) return;
    updateActiveEnvironment((env) => ({
      ...env,
      routes: env.routes.map((r) => (r.uuid === activeRoute.uuid ? updater(r) : r))
    }));
  };

  // Response updates
  const updateActiveResponse = (updater: (prev: RouteResponse) => RouteResponse) => {
    if (!activeResponse || !activeRoute) return;
    updateRoute((route) => ({
      ...route,
      responses: route.responses.map((resp, i) => (resp.uuid === activeResponse.uuid ? updater(resp) : resp))
    }));
  };

  // Format JSON
  const handleFormatJson = () => {
    if (!activeResponse || !activeResponse.body) return;
    try {
      const parsed = JSON.parse(activeResponse.body);
      const formatted = JSON.stringify(parsed, null, 2);
      updateActiveResponse((resp) => ({ ...resp, body: formatted }));
    } catch (err) {
      // not JSON or parse error, ignore
    }
  };

  // Copy Body
  const handleCopyBody = () => {
    if (!activeResponse) return;
    apiService.writeClipboard(activeResponse.body || '');
    setCopyFeedback(true);
  };

  // Browse File
  const handleBrowseFile = async () => {
    const res = await apiService.showOpenDialog({
      title: 'Select Response File',
      properties: ['openFile']
    });
    if (!res.canceled && res.filePaths?.[0]) {
      const selectedPath = res.filePaths[0];
      updateActiveResponse((resp) => ({ ...resp, filePath: selectedPath }));
    }
  };

  // Add Route
  const handleAddRoute = () => {
    const newRoute: Route = {
      uuid: 'route_' + Math.random().toString(36).substring(2, 10),
      type: 'http',
      documentation: '',
      method: 'get',
      endpoint: `endpoint-${routes.length + 1}`,
      responses: [
        {
          uuid: 'resp_' + Math.random().toString(36).substring(2, 10),
          body: '{\n  "message": "Hello World"\n}',
          latency: 0,
          statusCode: 200,
          label: 'Default 200 OK',
          headers: [{ key: 'Content-Type', value: 'application/json' }],
          bodyType: 'INLINE',
          filePath: '',
          databucketID: '',
          sendFileAsBody: false,
          rules: [],
          rulesOperator: 'OR',
          disableTemplating: false,
          fallbackTo404: false,
          default: true,
          crudKey: 'id',
          callbacks: []
        }
      ],
      responseMode: null,
      streamingMode: null,
      streamingInterval: 0
    };

    updateActiveEnvironment((env) => ({
      ...env,
      routes: [...env.routes, newRoute]
    }));
    setSelectedRouteUuid(newRoute.uuid);
    setSelectedResponseIndex(0);
  };

  // Delete Route
  const handleDeleteRoute = (uuid: string) => {
    if (!window.confirm(t.routes.deleteRouteConfirm)) return;
    updateActiveEnvironment((env) => ({
      ...env,
      routes: env.routes.filter((r) => r.uuid !== uuid)
    }));
    if (selectedRouteUuid === uuid) {
      setSelectedRouteUuid(null);
    }
  };

  // Add Response
  const handleAddResponse = () => {
    if (!activeRoute) return;
    const newResp: RouteResponse = {
      uuid: 'resp_' + Math.random().toString(36).substring(2, 10),
      body: '{\n  "error": "Not Found"\n}',
      latency: 0,
      statusCode: 404,
      label: '404 Response',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      bodyType: 'INLINE',
      filePath: '',
      databucketID: '',
      sendFileAsBody: false,
      rules: [],
      rulesOperator: 'OR',
      disableTemplating: false,
      fallbackTo404: false,
      default: false,
      crudKey: 'id',
      callbacks: []
    };

    updateRoute((r) => ({
      ...r,
      responses: [...r.responses, newResp]
    }));
    setSelectedResponseIndex(activeRoute.responses.length);
  };

  // Delete Response
  const handleDeleteResponse = (uuid: string) => {
    if (!activeRoute || activeRoute.responses.length <= 1) return;
    updateRoute((r) => ({
      ...r,
      responses: r.responses.filter((resp) => resp.uuid !== uuid)
    }));
    setSelectedResponseIndex(0);
  };

  // Add Header to response
  const handleAddHeader = () => {
    if (!activeResponse) return;
    updateActiveResponse((resp) => ({
      ...resp,
      headers: [...resp.headers, { key: '', value: '' }]
    }));
  };

  // Add Rule to response
  const handleAddRule = () => {
    if (!activeResponse) return;
    const newRule: ResponseRule = {
      target: 'header',
      property: 'authorization',
      operator: 'equals',
      value: 'token123',
      invert: false
    };
    updateActiveResponse((resp) => ({
      ...resp,
      rules: [...(resp.rules || []), newRule]
    }));
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Route List Sidebar (Left, resizable) */}
      <Box
        sx={{
          width: leftWidth,
          minWidth: leftWidth,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.background.paper, 0.4)
              : alpha(theme.palette.background.default, 0.5),
          position: 'relative'
        }}
      >
        {/* Search & Add */}
        <Box sx={{ p: isCompact ? 1 : 1.5, display: 'flex', gap: 0.8, alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t.routes.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                </InputAdornment>
              )
            }}
          />
          <Tooltip title={t.routes.addRoute} arrow>
            <IconButton
              size="small"
              onClick={handleAddRoute}
              sx={{
                width: isCompact ? 30 : 34,
                height: isCompact ? 30 : 34,
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

        {/* Route Items List */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 0.8, py: 0.5 }}>
          <List sx={{ p: 0 }}>
            {filteredRoutes.map((route) => {
              const isSelected = activeRoute?.uuid === route.uuid;
              const methodConfig = METHOD_COLORS[route.method.toLowerCase()] || METHOD_COLORS.get;
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
                        handleDeleteRoute(route.uuid);
                      }}
                      sx={{ opacity: isSelected ? 1 : 0.3, '&:hover': { opacity: 1, color: theme.palette.error.main } }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  }
                  sx={{ mb: 0.4 }}
                >
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => {
                      setSelectedRouteUuid(route.uuid);
                      setSelectedResponseIndex(0);
                    }}
                    sx={{
                      borderRadius: 1.5,
                      py: isCompact ? 0.6 : 0.9,
                      px: isCompact ? 1 : 1.2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        minWidth: 44,
                        textAlign: 'center',
                        py: 0.2,
                        borderRadius: 1,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: methodConfig.bg,
                        color: methodConfig.text,
                        textTransform: 'uppercase',
                        fontFamily: "'Fira Code', monospace"
                      }}
                    >
                      {route.method}
                    </Box>

                    {/* Method & Path separated by a clear slash / */}
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Fira Code', monospace",
                          color: theme.palette.text.disabled,
                          mr: 0.3,
                          fontSize: isCompact ? '0.78rem' : '0.85rem'
                        }}
                      >
                        /
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isSelected ? 600 : 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontFamily: "'Fira Code', monospace",
                          fontSize: isCompact ? '0.78rem' : '0.85rem'
                        }}
                      >
                        {cleanEndpoint}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Resizer handle */}
        <Box sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4 }}>
          <Resizer width={leftWidth} onResize={setLeftWidth} minWidth={200} maxWidth={520} />
        </Box>
      </Box>

      {/* Route Detail & Responses (Right) */}
      {activeRoute && activeResponse ? (
        <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Route Header (Colored Method Selector & Path with slash /) */}
          <Paper
            square
            sx={{
              p: isCompact ? 1.5 : 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.2
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Method select with vibrant color badges */}
              <FormControl size="small" sx={{ width: 115 }}>
                <Select
                  value={activeRoute.method}
                  onChange={(e) => updateRoute((r) => ({ ...r, method: e.target.value as any }))}
                  renderValue={(val) => {
                    const cfg = METHOD_COLORS[val.toLowerCase()] || METHOD_COLORS.get;
                    return (
                      <Box
                        sx={{
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          backgroundColor: cfg.bg,
                          color: cfg.text,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontFamily: "'Fira Code', monospace",
                          fontSize: '0.75rem',
                          textAlign: 'center'
                        }}
                      >
                        {val}
                      </Box>
                    );
                  }}
                >
                  {HTTP_METHODS.map((m) => {
                    const cfg = METHOD_COLORS[m] || METHOD_COLORS.get;
                    return (
                      <MenuItem key={m} value={m}>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.2,
                            borderRadius: 1,
                            backgroundColor: cfg.bg,
                            color: cfg.text,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            fontFamily: "'Fira Code', monospace",
                            fontSize: '0.72rem',
                            minWidth: 50,
                            textAlign: 'center',
                            mr: 1
                          }}
                        >
                          {m}
                        </Box>
                        <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                          {m}
                        </Typography>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              {/* Slash / separator between method and endpoint */}
              <Typography
                sx={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: theme.palette.text.secondary
                }}
              >
                /
              </Typography>

              {/* Endpoint input */}
              <TextField
                fullWidth
                size="small"
                label={t.routes.path}
                value={activeRoute.endpoint.replace(/^\//, '')}
                onChange={(e) => updateRoute((r) => ({ ...r, endpoint: e.target.value.replace(/^\//, '') }))}
                sx={{ '& input': { fontFamily: "'Fira Code', monospace" } }}
              />
            </Box>

            {/* Route documentation / notes */}
            <TextField
              fullWidth
              size="small"
              placeholder={t.routes.documentation}
              value={activeRoute.documentation || ''}
              onChange={(e) => updateRoute((r) => ({ ...r, documentation: e.target.value }))}
            />
          </Paper>

          {/* Response Branches Navigation Tabs */}
          <Box
            sx={{
              px: 1.5,
              pt: 0.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Tabs
              value={selectedResponseIndex}
              onChange={(_, val) => setSelectedResponseIndex(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 36 }}
            >
              {activeRoute.responses.map((resp, idx) => (
                <Tab
                  key={resp.uuid}
                  sx={{ minHeight: 36, py: 0.4 }}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      {resp.default && <StarRoundedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />}
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {resp.statusCode}
                      </Typography>
                      {resp.label && (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          ({resp.label})
                        </Typography>
                      )}
                    </Box>
                  }
                />
              ))}
            </Tabs>

            <Box sx={{ display: 'flex', gap: 0.4 }}>
              <Tooltip title={t.routes.addResponse} arrow>
                <IconButton size="small" onClick={handleAddResponse}>
                  <AddRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              {activeRoute.responses.length > 1 && (
                <Tooltip title={t.common.delete} arrow>
                  <IconButton size="small" onClick={() => handleDeleteResponse(activeResponse.uuid)}>
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Response Branch Configuration Section */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: isCompact ? 1.5 : 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Row 1: Status Code, Latency, Branch Label, Default toggle */}
            <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ width: 120 }}>
                <InputLabel>{t.routes.statusCode}</InputLabel>
                <Select
                  value={activeResponse.statusCode}
                  label={t.routes.statusCode}
                  onChange={(e) => updateActiveResponse((resp) => ({ ...resp, statusCode: Number(e.target.value) }))}
                >
                  {COMMON_STATUS_CODES.map((code) => (
                    <MenuItem key={code} value={code}>
                      {code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                type="number"
                label={t.routes.latency}
                value={activeResponse.latency}
                onChange={(e) => updateActiveResponse((resp) => ({ ...resp, latency: Number(e.target.value) }))}
                sx={{ width: 120 }}
              />

              <TextField
                size="small"
                label={t.routes.label}
                value={activeResponse.label || ''}
                placeholder="200 OK, Error, etc."
                onChange={(e) => updateActiveResponse((resp) => ({ ...resp, label: e.target.value }))}
                sx={{ flex: 1, minWidth: 140 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={!!activeResponse.default}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      updateRoute((r) => ({
                        ...r,
                        responses: r.responses.map((resp) => ({
                          ...resp,
                          default: resp.uuid === activeResponse.uuid ? isChecked : false
                        }))
                      }));
                    }}
                  />
                }
                label={<Typography variant="body2">{t.routes.isDefault}</Typography>}
              />
            </Box>

            {/* Row 2: Response documentation / description (Added as requested) */}
            <TextField
              fullWidth
              size="small"
              placeholder="Add documentation for this response (添加此响应分支的描述与说明)..."
              value={activeResponse.label && activeResponse.label !== `${activeResponse.statusCode} OK` ? activeResponse.label : ''}
              onChange={(e) => updateActiveResponse((resp) => ({ ...resp, label: e.target.value }))}
            />

            {/* Sub Tabs: Body / Headers / Rules */}
            <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Tabs value={responseSubTab} onChange={(_, v) => setResponseSubTab(v)} sx={{ minHeight: 34 }}>
                <Tab icon={<CodeRoundedIcon sx={{ fontSize: 15 }} />} iconPosition="start" label={t.routes.bodyContent} sx={{ minHeight: 34, py: 0 }} />
                <Tab
                  icon={
                    <Chip
                      size="small"
                      label={activeResponse.headers.length}
                      sx={{ height: 16, fontSize: '0.65rem', mr: 0.5 }}
                    />
                  }
                  iconPosition="end"
                  label={t.routes.headers}
                  sx={{ minHeight: 34, py: 0 }}
                />
                <Tab
                  icon={
                    <Chip
                      size="small"
                      label={(activeResponse.rules || []).length}
                      sx={{ height: 16, fontSize: '0.65rem', mr: 0.5 }}
                    />
                  }
                  iconPosition="end"
                  label={t.routes.rules}
                  sx={{ minHeight: 34, py: 0 }}
                />
              </Tabs>
            </Box>

            {/* Sub Tab 0: Body Editor */}
            {responseSubTab === 0 && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Body Type switch + Format & Copy Actions Toolbar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                      {t.routes.bodyType}:
                    </Typography>
                    <Chip
                      size="small"
                      label={t.routes.bodyInline}
                      color={activeResponse.bodyType === 'INLINE' ? 'primary' : 'default'}
                      onClick={() => updateActiveResponse((resp) => ({ ...resp, bodyType: 'INLINE' }))}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      size="small"
                      label={t.routes.bodyFile}
                      color={activeResponse.bodyType === 'FILE' ? 'primary' : 'default'}
                      onClick={() => updateActiveResponse((resp) => ({ ...resp, bodyType: 'FILE' }))}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      size="small"
                      label={t.routes.bodyDatabucket}
                      color={activeResponse.bodyType === 'DATABUCKET' ? 'primary' : 'default'}
                      onClick={() => updateActiveResponse((resp) => ({ ...resp, bodyType: 'DATABUCKET' }))}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>

                  {/* Format JSON & Copy buttons for Inline Body */}
                  {activeResponse.bodyType === 'INLINE' && (
                    <Box sx={{ display: 'flex', gap: 0.6 }}>
                      <Tooltip title="Format JSON (格式化 JSON 内容)" arrow>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AutoFixHighRoundedIcon sx={{ fontSize: 15 }} />}
                          onClick={handleFormatJson}
                          sx={{ fontSize: '0.75rem', py: 0.2 }}
                        >
                          格式化
                        </Button>
                      </Tooltip>
                      <Tooltip title="Copy Content (复制响应内容)" arrow>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                          onClick={handleCopyBody}
                          sx={{ fontSize: '0.75rem', py: 0.2 }}
                        >
                          复制
                        </Button>
                      </Tooltip>
                    </Box>
                  )}
                </Box>

                {/* Inline Body Editor */}
                {activeResponse.bodyType === 'INLINE' && (
                  <TextField
                    fullWidth
                    multiline
                    minRows={12}
                    maxRows={24}
                    value={activeResponse.body}
                    onChange={(e) => updateActiveResponse((resp) => ({ ...resp, body: e.target.value }))}
                    sx={{
                      '& textarea': {
                        fontFamily: "'Fira Code', monospace",
                        fontSize: '0.82rem',
                        lineHeight: 1.45
                      }
                    }}
                  />
                )}

                {/* File Response (Complete file features: browse, send as body, show in folder) */}
                {activeResponse.bodyType === 'FILE' && (
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      配置文件响应 (File Response)
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        size="small"
                        label={t.routes.bodyPath}
                        placeholder="/path/to/response-data.json or image.png"
                        value={activeResponse.filePath || ''}
                        onChange={(e) => updateActiveResponse((resp) => ({ ...resp, filePath: e.target.value }))}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<FileOpenRoundedIcon sx={{ fontSize: 16 }} />}
                        onClick={handleBrowseFile}
                        sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        选择文件
                      </Button>
                      {activeResponse.filePath && (
                        <Tooltip title="在文件夹中定位此文件" arrow>
                          <IconButton
                            size="small"
                            onClick={() => apiService.showFile(activeResponse.filePath)}
                            sx={{ border: `1px solid ${theme.palette.divider}` }}
                          >
                            <FolderOpenRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={!!activeResponse.sendFileAsBody}
                          onChange={(e) => updateActiveResponse((resp) => ({ ...resp, sendFileAsBody: e.target.checked }))}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            作为响应主体直接发送 (Send as body)
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            开启后将把选定文件的实际二进制/纯文本字节流直接输出给调用方，自动适配 MIME 媒体类型。
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>
                )}

                {/* Databucket Response */}
                {activeResponse.bodyType === 'DATABUCKET' && (
                  <FormControl size="small" fullWidth>
                    <InputLabel>{t.routes.bodyDatabucket}</InputLabel>
                    <Select
                      value={activeResponse.databucketID || ''}
                      label={t.routes.bodyDatabucket}
                      onChange={(e) => updateActiveResponse((resp) => ({ ...resp, databucketID: e.target.value }))}
                    >
                      {(activeEnvironment.data || []).map((db) => (
                        <MenuItem key={db.id} value={db.id}>
                          {db.name} ({db.id})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            )}

            {/* Sub Tab 1: Headers Editor */}
            {responseSubTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {t.routes.headers}
                  </Typography>
                  <Button size="small" variant="outlined" startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />} onClick={handleAddHeader}>
                    {t.routes.addHeader}
                  </Button>
                </Box>

                <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha(theme.palette.text.primary, 0.03) }}>
                        <TableCell sx={{ fontWeight: 600 }}>{t.routes.headerName}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t.routes.headerValue}</TableCell>
                        <TableCell width={60} align="center">{t.common.actions}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeResponse.headers.map((h, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ py: 0.6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={h.key}
                              placeholder="Content-Type"
                              onChange={(e) => {
                                const newKey = e.target.value;
                                updateActiveResponse((resp) => ({
                                  ...resp,
                                  headers: resp.headers.map((hdr, idx) => (idx === i ? { ...hdr, key: newKey } : hdr))
                                }));
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 0.6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={h.value}
                              placeholder="application/json"
                              onChange={(e) => {
                                const newVal = e.target.value;
                                updateActiveResponse((resp) => ({
                                  ...resp,
                                  headers: resp.headers.map((hdr, idx) => (idx === i ? { ...hdr, value: newVal } : hdr))
                                }));
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 0.6 }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                updateActiveResponse((resp) => ({
                                  ...resp,
                                  headers: resp.headers.filter((_, idx) => idx !== i)
                                }));
                              }}
                              sx={{ color: theme.palette.error.main, p: 0.4 }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {activeResponse.headers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 3, color: theme.palette.text.secondary }}>
                            {t.headers.noHeaders}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {/* Sub Tab 2: Rules */}
            {responseSubTab === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {t.routes.rulesNotice}
                  </Typography>
                  <Button size="small" variant="outlined" startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />} onClick={handleAddRule}>
                    {t.routes.addRule}
                  </Button>
                </Box>

                {(activeResponse.rules || []).map((rule, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 1.2, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ width: 130 }}>
                      <Select
                        value={rule.target}
                        onChange={(e) => {
                          const target = e.target.value as any;
                          updateActiveResponse((resp) => ({
                            ...resp,
                            rules: resp.rules.map((r, i) => (i === idx ? { ...r, target } : r))
                          }));
                        }}
                      >
                        <MenuItem value="header">Header</MenuItem>
                        <MenuItem value="query">Query param</MenuItem>
                        <MenuItem value="body">Body (JSONPath)</MenuItem>
                        <MenuItem value="cookie">Cookie</MenuItem>
                        <MenuItem value="params">Route param</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      size="small"
                      placeholder="Property (e.g. auth)"
                      value={rule.property}
                      onChange={(e) => {
                        const property = e.target.value;
                        updateActiveResponse((resp) => ({
                          ...resp,
                          rules: resp.rules.map((r, i) => (i === idx ? { ...r, property } : r))
                        }));
                      }}
                      sx={{ flex: 1 }}
                    />

                    <FormControl size="small" sx={{ width: 120 }}>
                      <Select
                        value={rule.operator}
                        onChange={(e) => {
                          const operator = e.target.value as any;
                          updateActiveResponse((resp) => ({
                            ...resp,
                            rules: resp.rules.map((r, i) => (i === idx ? { ...r, operator } : r))
                          }));
                        }}
                      >
                        <MenuItem value="equals">equals</MenuItem>
                        <MenuItem value="regex_match">regex</MenuItem>
                        <MenuItem value="null">is null</MenuItem>
                        <MenuItem value="empty_array">empty array</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      size="small"
                      placeholder="Value"
                      value={rule.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateActiveResponse((resp) => ({
                          ...resp,
                          rules: resp.rules.map((r, i) => (i === idx ? { ...r, value } : r))
                        }));
                      }}
                      sx={{ flex: 1 }}
                    />

                    <IconButton
                      size="small"
                      onClick={() => {
                        updateActiveResponse((resp) => ({
                          ...resp,
                          rules: resp.rules.filter((_, i) => i !== idx)
                        }));
                      }}
                      sx={{ color: theme.palette.error.main, p: 0.4 }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            {t.routes.noRoutes}
          </Typography>
        </Box>
      )}

      {/* Copy feedback notification */}
      <Snackbar
        open={copyFeedback}
        autoHideDuration={2000}
        onClose={() => setCopyFeedback(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', py: 0.5, px: 2, fontSize: '0.85rem' }}>
          响应内容已成功复制到剪贴板！
        </Alert>
      </Snackbar>
    </Box>
  );
};
