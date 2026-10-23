import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Checkbox,
  Chip,
  Paper,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  alpha,
  useTheme,
  InputBase,
  Snackbar,
  Alert
} from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AltRouteRoundedIcon from '@mui/icons-material/AltRouteRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import WifiTetheringRoundedIcon from '@mui/icons-material/WifiTetheringRounded';
import InputAdornment from '@mui/material/InputAdornment';
import { Route, RouteResponse, ResponseRule } from '@mockoon/commons';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';
import { apiService } from '../../services/api.service';
import { CodeEditor } from '../Common/CodeEditor';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

const COMMON_STATUS_CODES = [
  200, 201, 204, 301, 302, 400, 401, 403, 404, 422, 500, 502, 503
];

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

export const RoutesView: React.FC = () => {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const {
    activeEnvironment,
    updateActiveEnvironment,
    selectedRouteUuid,
    setActiveTabKey
  } = useApp();

  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);
  const [responseSubTab, setResponseSubTab] = useState(0); // 0: Body, 1: Headers, 2: Rules
  const [copiedSnackbar, setCopiedSnackbar] = useState(false);

  const routes = activeEnvironment?.routes || [];
  const activeRoute: Route | null =
    routes.find((r) => r.uuid === selectedRouteUuid) || routes[0] || null;

  const activeResponse: RouteResponse | null =
    activeRoute && activeRoute.responses[selectedResponseIndex]
      ? activeRoute.responses[selectedResponseIndex]
      : activeRoute?.responses[0] || null;

  const fullRouteUrl = useMemo(() => {
    if (!activeEnvironment || !activeRoute) return '';
    const protocol = activeEnvironment.tlsOptions?.enabled ? 'https' : 'http';
    const hostname = activeEnvironment.hostname || 'localhost';
    const port = activeEnvironment.port || 3000;
    const prefix = (activeEnvironment.endpointPrefix || '').replace(/^\/|\/$/g, '');
    const ep = (activeRoute.endpoint || '').replace(/^\//, '');
    return `${protocol}://${hostname}:${port}/${prefix ? prefix + '/' : ''}${ep}`;
  }, [activeEnvironment, activeRoute]);

  const updateRoute = (updater: (prev: Route) => Route) => {
    if (!activeRoute) return;
    updateActiveEnvironment((env) => ({
      ...env,
      routes: env.routes.map((r) => (r.uuid === activeRoute.uuid ? updater(r) : r))
    }));
  };

  const updateActiveResponse = (updater: (prev: RouteResponse) => RouteResponse) => {
    if (!activeRoute || !activeResponse) return;
    updateRoute((r) => ({
      ...r,
      responses: r.responses.map((resp) =>
        resp.uuid === activeResponse.uuid ? updater(resp) : resp
      )
    }));
  };

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

  const handleDeleteResponse = (uuid: string) => {
    if (!activeRoute || activeRoute.responses.length <= 1) return;
    const deleteIdx = activeRoute.responses.findIndex((r) => r.uuid === uuid);
    const newResponses = activeRoute.responses.filter((resp) => resp.uuid !== uuid);

    // If deleted response was default, ensure there is at least one default
    if (!newResponses.some((r) => r.default) && newResponses.length > 0) {
      newResponses[0].default = true;
    }

    updateRoute((r) => ({
      ...r,
      responses: newResponses
    }));

    if (selectedResponseIndex >= newResponses.length) {
      setSelectedResponseIndex(Math.max(0, newResponses.length - 1));
    } else if (deleteIdx < selectedResponseIndex) {
      setSelectedResponseIndex(selectedResponseIndex - 1);
    }
  };

  const handleAddHeader = () => {
    if (!activeResponse) return;
    updateActiveResponse((resp) => ({
      ...resp,
      headers: [...resp.headers, { key: '', value: '' }]
    }));
  };

  const handleAddRule = () => {
    if (!activeResponse) return;
    const newRule: ResponseRule = {
      target: 'header',
      modifier: '',
      operator: 'equals',
      value: '',
      invert: false
    };
    (newRule as any).property = '';
    updateActiveResponse((resp) => ({
      ...resp,
      rules: [...(resp.rules || []), newRule]
    }));
  };

  // Safely extract string file path even if previously stored as an object
  const cleanFilePath = useMemo(() => {
    if (!activeResponse?.filePath) return '';
    if (typeof activeResponse.filePath === 'string') return activeResponse.filePath;
    if (typeof (activeResponse.filePath as any)?.filePaths?.[0] === 'string') {
      return (activeResponse.filePath as any).filePaths[0];
    }
    return '';
  }, [activeResponse?.filePath]);

  // Auto-heal activeResponse.filePath if it's an object
  React.useEffect(() => {
    if (activeResponse?.filePath && typeof activeResponse.filePath !== 'string') {
      const sanitized = cleanFilePath;
      updateActiveResponse((resp) => ({ ...resp, filePath: sanitized }));
    }
  }, [activeResponse?.filePath, cleanFilePath]);

  // Browse local file dialog
  const handleBrowseFile = async () => {
    if (!activeResponse) return;
    try {
      const res = await apiService.showOpenDialog({
        title: '选择响应数据文件',
        buttonLabel: '选择文件',
        filters: [
          { name: 'All Files (*.*)', extensions: ['*'] },
          { name: 'JSON Files (*.json)', extensions: ['json'] },
          { name: 'Images (*.png, *.jpg, *.jpeg, *.svg, *.webp)', extensions: ['png', 'jpg', 'jpeg', 'svg', 'webp'] },
          { name: 'Documents (*.pdf, *.txt, *.csv, *.xml, *.html)', extensions: ['pdf', 'txt', 'csv', 'xml', 'html'] }
        ]
      });
      if (res && !res.canceled && res.filePaths?.[0]) {
        updateActiveResponse((resp) => ({ ...resp, filePath: res.filePaths[0] }));
      }
    } catch (e) {
      console.error('Failed to browse file:', e);
    }
  };

  if (!activeRoute || !activeResponse) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          暂未选择路由接口或暂无路由数据
        </Typography>
      </Box>
    );
  }

  const methodCfg = METHOD_COLORS[activeRoute.method.toLowerCase()] || METHOD_COLORS.get;
  const cleanEndpoint = activeRoute.endpoint.replace(/^\//, '');

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default
      }}
    >
      {/* 1. Unified Modern Browser-style Address Bar & Description Hint */}
      <Box
        sx={{
          py: 1.2,
          px: 1.8,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.background.paper, 0.95)
              : alpha(theme.palette.background.default, 0.9),
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {/* Unified Address Bar Box */}
        <Box
          sx={{
            height: 36,
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.6),
            px: 0.8,
            gap: 0.8,
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.18)}`
            }
          }}
        >
          {/* Method Addon on Left (Pill Badge or Pill Select) */}
          {activeRoute.type === 'crud' ? (
            <Box
              sx={{
                height: 24,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.72rem',
                fontFamily: "'Fira Code', monospace",
                letterSpacing: '0.02em',
                userSelect: 'none',
                flexShrink: 0
              }}
            >
              CRUD
            </Box>
          ) : activeRoute.type === 'ws' ? (
            <Box
              sx={{
                height: 24,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                backgroundColor: '#06b6d4',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.72rem',
                fontFamily: "'Fira Code', monospace",
                letterSpacing: '0.02em',
                userSelect: 'none',
                flexShrink: 0
              }}
            >
              WS
            </Box>
          ) : (
            <Select
              value={activeRoute.method}
              onChange={(e) => updateRoute((r) => ({ ...r, method: e.target.value as any }))}
              variant="standard"
              disableUnderline
              renderValue={(val) => (val as string).toUpperCase()}
              sx={{
                height: 24,
                minWidth: 72,
                flexShrink: 0,
                borderRadius: 1,
                backgroundColor: (METHOD_COLORS[activeRoute.method.toLowerCase()] || METHOD_COLORS.get).bg,
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 800,
                fontFamily: "'Fira Code', monospace",
                '& .MuiSelect-select': {
                  py: 0,
                  pl: 0.9,
                  pr: '22px !important',
                  height: '24px !important',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                },
                '& .MuiSelect-icon': {
                  color: '#ffffff',
                  fontSize: 16,
                  right: 2
                }
              }}
            >
              {HTTP_METHODS.map((m) => {
                const cfg = METHOD_COLORS[m] || METHOD_COLORS.get;
                return (
                  <MenuItem key={m} value={m} sx={{ py: 0.6 }}>
                    <Box
                      sx={{
                        px: 0.8,
                        py: 0.15,
                        borderRadius: 1,
                        backgroundColor: cfg.bg,
                        color: cfg.text,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontFamily: "'Fira Code', monospace",
                        fontSize: '0.68rem',
                        minWidth: 46,
                        textAlign: 'center',
                        mr: 1
                      }}
                    >
                      {m}
                    </Box>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                      {m}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Select>
          )}

          {/* Slash Prefix */}
          <Typography
            sx={{
              fontFamily: "'Fira Code', monospace",
              fontSize: '0.95rem',
              fontWeight: 700,
              color: theme.palette.text.disabled,
              userSelect: 'none',
              lineHeight: 1
            }}
          >
            /
          </Typography>

          {/* Clean Endpoint Input */}
          <InputBase
            placeholder="endpoint/path"
            value={cleanEndpoint}
            onChange={(e) => updateRoute((r) => ({ ...r, endpoint: e.target.value.replace(/^\//, '') }))}
            sx={{
              flex: 1,
              height: '100%',
              fontSize: '0.86rem',
              fontFamily: "'Fira Code', monospace",
              fontWeight: 600
            }}
          />

          {/* Copy Full Route URL Icon Button */}
          <Tooltip title={locale === 'zh-CN' ? `复制完整接口地址: ${fullRouteUrl}` : `Copy Full URL: ${fullRouteUrl}`} arrow>
            <IconButton
              size="small"
              onClick={() => {
                if (fullRouteUrl) {
                  navigator.clipboard.writeText(fullRouteUrl);
                  setCopiedSnackbar(true);
                }
              }}
              sx={{
                p: 0.5,
                mr: 0.2,
                color: theme.palette.text.secondary,
                borderRadius: 1,
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                }
              }}
            >
              <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Documentation / Alias Hint Input below address bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            px: 1,
            py: 0.35,
            borderRadius: 1.2,
            backgroundColor:
              theme.palette.mode === 'light'
                ? alpha(theme.palette.grey[100], 0.6)
                : alpha(theme.palette.background.paper, 0.4),
            border: `1px dashed ${alpha(theme.palette.divider, 0.7)}`,
            transition: 'all 0.15s ease',
            '&:hover, &:focus-within': {
              backgroundColor:
                theme.palette.mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.8),
              borderColor: alpha(theme.palette.primary.main, 0.5)
            }
          }}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 15, color: theme.palette.text.disabled, flexShrink: 0 }} />
          <InputBase
            placeholder={
              locale === 'zh-CN'
                ? '添加接口文档说明 / 别名（如：用户数据 CRUD 自动化服务）...'
                : 'Add route documentation or description (e.g. Users CRUD Service)...'
            }
            value={activeRoute.documentation || ''}
            onChange={(e) => updateRoute((r) => ({ ...r, documentation: e.target.value }))}
            sx={{
              flex: 1,
              fontSize: '0.74rem',
              color: theme.palette.text.secondary,
              '& input': { py: 0.1 }
            }}
          />
        </Box>

        {/* CRUD Route Special Setting Card */}
        {activeRoute.type === 'crud' && (
          <Paper
            elevation={0}
            sx={{
              p: 1.2,
              px: 1.5,
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'light'
                  ? alpha('#8b5cf6', 0.05)
                  : alpha('#8b5cf6', 0.1),
              border: `1px solid ${alpha('#8b5cf6', 0.25)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            {/* Top row: Title + Settings (Data bucket + ID Key) */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: 1,
                    backgroundColor: alpha('#8b5cf6', 0.18),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8b5cf6'
                  }}
                >
                  <StorageRoundedIcon sx={{ fontSize: 14 }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: '#7c3aed',
                    fontSize: '0.78rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {locale === 'zh-CN' ? 'CRUD 数据桶自动化服务' : 'CRUD Data Bucket Service'}
                </Typography>
              </Box>

              {/* Controls on Right */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {/* Data Bucket Selector */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      color: theme.palette.text.secondary,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {locale === 'zh-CN' ? '绑定数据桶:' : 'Data Bucket:'}
                  </Typography>
                  <Select
                    size="small"
                    value={activeResponse?.databucketID || ''}
                    onChange={(e) => updateActiveResponse((resp) => ({ ...resp, databucketID: e.target.value }))}
                    displayEmpty
                    sx={{
                      height: 26,
                      fontSize: '0.72rem',
                      borderRadius: 1.2,
                      minWidth: 130,
                      backgroundColor:
                        theme.palette.mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.6),
                      '& .MuiSelect-select': { py: 0.2, px: 1 }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.72rem', color: theme.palette.text.disabled }}>
                      <em>{locale === 'zh-CN' ? '(未绑定数据桶)' : '(Select Data Bucket)'}</em>
                    </MenuItem>
                    {(activeEnvironment.data || []).map((db) => (
                      <MenuItem key={db.id} value={db.id} sx={{ fontSize: '0.72rem' }}>
                        {db.name} ({db.id})
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* ID Property (crudKey) */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      color: theme.palette.text.secondary,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {locale === 'zh-CN' ? '主键字段 (Key):' : 'Key Property:'}
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="id"
                    value={activeResponse?.crudKey || 'id'}
                    onChange={(e) => updateActiveResponse((resp) => ({ ...resp, crudKey: e.target.value }))}
                    InputProps={{
                      sx: {
                        height: 26,
                        width: 72,
                        fontSize: '0.75rem',
                        fontFamily: "'Fira Code', monospace",
                        borderRadius: 1.2,
                        backgroundColor:
                          theme.palette.mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.6)
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Bottom row: Clean badges for auto-generated endpoints */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                flexWrap: 'wrap',
                pt: 0.8,
                borderTop: `1px dashed ${alpha('#8b5cf6', 0.2)}`
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  whiteSpace: 'nowrap',
                  mr: 0.2
                }}
              >
                {locale === 'zh-CN' ? '自动挂载 5 个 REST 操作:' : 'Auto-generated operations:'}
              </Typography>

              {/* GET /users */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  px: 0.7,
                  py: 0.2,
                  borderRadius: 1,
                  backgroundColor: alpha('#16a34a', 0.1),
                  border: `1px solid ${alpha('#16a34a', 0.25)}`
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#16a34a', fontFamily: "'Fira Code', monospace" }}>
                  GET
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.68rem', fontFamily: "'Fira Code', monospace", color: theme.palette.text.primary }}>
                  /{cleanEndpoint}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: theme.palette.text.secondary, ml: 0.2 }}>
                  {locale === 'zh-CN' ? '(列表)' : '(List)'}
                </Typography>
              </Box>

              {/* GET /users/:id */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  px: 0.7,
                  py: 0.2,
                  borderRadius: 1,
                  backgroundColor: alpha('#16a34a', 0.1),
                  border: `1px solid ${alpha('#16a34a', 0.25)}`
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#16a34a', fontFamily: "'Fira Code', monospace" }}>
                  GET
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.68rem', fontFamily: "'Fira Code', monospace", color: theme.palette.text.primary }}>
                  /{cleanEndpoint}/:id
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: theme.palette.text.secondary, ml: 0.2 }}>
                  {locale === 'zh-CN' ? '(详情)' : '(Item)'}
                </Typography>
              </Box>

              {/* POST /users */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  px: 0.7,
                  py: 0.2,
                  borderRadius: 1,
                  backgroundColor: alpha('#2563eb', 0.1),
                  border: `1px solid ${alpha('#2563eb', 0.25)}`
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#2563eb', fontFamily: "'Fira Code', monospace" }}>
                  POST
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.68rem', fontFamily: "'Fira Code', monospace", color: theme.palette.text.primary }}>
                  /{cleanEndpoint}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: theme.palette.text.secondary, ml: 0.2 }}>
                  {locale === 'zh-CN' ? '(新增)' : '(Create)'}
                </Typography>
              </Box>

              {/* PUT /users/:id */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  px: 0.7,
                  py: 0.2,
                  borderRadius: 1,
                  backgroundColor: alpha('#f59e0b', 0.1),
                  border: `1px solid ${alpha('#f59e0b', 0.25)}`
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#d97706', fontFamily: "'Fira Code', monospace" }}>
                  PUT
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.68rem', fontFamily: "'Fira Code', monospace", color: theme.palette.text.primary }}>
                  /{cleanEndpoint}/:id
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: theme.palette.text.secondary, ml: 0.2 }}>
                  {locale === 'zh-CN' ? '(修改)' : '(Update)'}
                </Typography>
              </Box>

              {/* DELETE /users/:id */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  px: 0.7,
                  py: 0.2,
                  borderRadius: 1,
                  backgroundColor: alpha('#dc2626', 0.1),
                  border: `1px solid ${alpha('#dc2626', 0.25)}`
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#dc2626', fontFamily: "'Fira Code', monospace" }}>
                  DELETE
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.68rem', fontFamily: "'Fira Code', monospace", color: theme.palette.text.primary }}>
                  /{cleanEndpoint}/:id
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: theme.palette.text.secondary, ml: 0.2 }}>
                  {locale === 'zh-CN' ? '(删除)' : '(Delete)'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* WebSocket Route Special Setting */}
        {activeRoute.type === 'ws' && (
          <Paper
            elevation={0}
            sx={{
              p: 1.2,
              px: 1.5,
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'light'
                  ? alpha('#06b6d4', 0.05)
                  : alpha('#06b6d4', 0.1),
              border: `1px solid ${alpha('#06b6d4', 0.25)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: 1,
                  backgroundColor: alpha('#06b6d4', 0.18),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4'
                }}
              >
                <WifiTetheringRoundedIcon sx={{ fontSize: 14 }} />
              </Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, color: '#0891b2', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
              >
                {locale === 'zh-CN' ? 'WebSocket 实时长连接' : 'WebSocket Streaming Service'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem', display: { xs: 'none', sm: 'inline' } }}
              >
                {locale === 'zh-CN' ? '· 支持双向通讯与数据流周期推送' : '· Bi-directional messaging & streaming'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, fontSize: '0.72rem', color: theme.palette.text.secondary, whiteSpace: 'nowrap' }}
                >
                  {locale === 'zh-CN' ? '推送模式:' : 'Mode:'}
                </Typography>
                <Select
                  size="small"
                  value={activeRoute.streamingMode || 'UNICAST'}
                  onChange={(e) => updateRoute((r) => ({ ...r, streamingMode: e.target.value as any }))}
                  sx={{
                    height: 26,
                    fontSize: '0.72rem',
                    borderRadius: 1.2,
                    backgroundColor:
                      theme.palette.mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.6),
                    '& .MuiSelect-select': { py: 0.2, px: 1 }
                  }}
                >
                  <MenuItem value="UNICAST" sx={{ fontSize: '0.72rem' }}>
                    {locale === 'zh-CN' ? '单播 (Unicast)' : 'Unicast'}
                  </MenuItem>
                  <MenuItem value="BROADCAST" sx={{ fontSize: '0.72rem' }}>
                    {locale === 'zh-CN' ? '广播 (Broadcast)' : 'Broadcast'}
                  </MenuItem>
                </Select>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, fontSize: '0.72rem', color: theme.palette.text.secondary, whiteSpace: 'nowrap' }}
                >
                  {locale === 'zh-CN' ? '推送周期:' : 'Interval:'}
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={activeRoute.streamingInterval || 0}
                  onChange={(e) => updateRoute((r) => ({ ...r, streamingInterval: Math.max(0, Number(e.target.value)) }))}
                  InputProps={{
                    sx: {
                      height: 26,
                      width: 68,
                      fontSize: '0.75rem',
                      fontFamily: "'Fira Code', monospace",
                      borderRadius: 1.2,
                      backgroundColor:
                        theme.palette.mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.6)
                    }
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.68rem', color: theme.palette.text.disabled }}>
                  ms
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      {/* 2. Response Branches Tab Bar */}
      <Box
        sx={{
          height: 34,
          minHeight: 34,
          px: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.background.paper, 0.6)
              : alpha(theme.palette.background.default, 0.8)
        }}
      >
        <Tabs
          value={selectedResponseIndex}
          onChange={(_, val) => setSelectedResponseIndex(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 34,
            '& .MuiTab-root': {
              minHeight: 34,
              py: 0,
              px: 1.2,
              fontSize: '0.75rem',
              textTransform: 'none'
            }
          }}
        >
          {activeRoute.responses.map((resp, idx) => (
            <Tab
              key={resp.uuid}
              label={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                    position: 'relative',
                    pr: activeRoute.responses.length > 1 ? 2.2 : 0,
                    '&:hover .tab-delete-btn': {
                      opacity: 1,
                      visibility: 'visible',
                      transform: 'translateY(-50%) scale(1)'
                    }
                  }}
                >
                  {resp.default && <StarRoundedIcon sx={{ fontSize: 13, color: '#f59e0b', flexShrink: 0 }} />}
                  <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: "'Fira Code', monospace" }}>
                    {resp.statusCode}
                  </Typography>
                  {resp.label && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ({resp.label})
                    </Typography>
                  )}
                  {activeRoute.responses.length > 1 && (
                    <Box
                      component="span"
                      className="tab-delete-btn"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteResponse(resp.uuid);
                      }}
                      sx={{
                        position: 'absolute',
                        right: -4,
                        top: '50%',
                        transform: 'translateY(-50%) scale(0.8)',
                        opacity: 0,
                        visibility: 'hidden',
                        transition: 'all 0.15s ease-in-out',
                        width: 17,
                        height: 17,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.text.secondary,
                        backgroundColor: alpha(theme.palette.text.primary, 0.08),
                        cursor: 'pointer',
                        zIndex: 2,
                        '&:hover': {
                          color: theme.palette.error.main,
                          backgroundColor: alpha(theme.palette.error.main, 0.18)
                        }
                      }}
                      title={t.common.delete || '删除此响应'}
                    >
                      <CloseRoundedIcon sx={{ fontSize: 12 }} />
                    </Box>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
          {/* Response Mode Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AltRouteRoundedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: theme.palette.text.secondary, fontWeight: 600 }}>
              {locale === 'zh-CN' ? '分发模式:' : 'Mode:'}
            </Typography>
            <Select
              size="small"
              value={activeRoute.responseMode || 'DEFAULT'}
              onChange={(e) => {
                const val = e.target.value;
                updateRoute((r) => ({ ...r, responseMode: val === 'DEFAULT' ? null : (val as any) }));
              }}
              sx={{
                height: 24,
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: 1,
                '& .MuiSelect-select': { py: 0.1, px: 0.8 }
              }}
            >
              <MenuItem value="DEFAULT" sx={{ fontSize: '0.75rem' }}>{locale === 'zh-CN' ? '规则匹配 (Rules)' : 'Rules matching'}</MenuItem>
              <MenuItem value="RANDOM" sx={{ fontSize: '0.75rem' }}>{locale === 'zh-CN' ? '随机响应 (Random)' : 'Random'}</MenuItem>
              <MenuItem value="SEQUENTIAL" sx={{ fontSize: '0.75rem' }}>{locale === 'zh-CN' ? '顺序轮询 (Sequential)' : 'Sequential'}</MenuItem>
              <MenuItem value="DISABLE_RULES" sx={{ fontSize: '0.75rem' }}>{locale === 'zh-CN' ? '仅默认响应 (Disable rules)' : 'Disable rules'}</MenuItem>
              <MenuItem value="FALLBACK" sx={{ fontSize: '0.75rem' }}>{locale === 'zh-CN' ? '规则后备 (Fallback)' : 'Fallback'}</MenuItem>
            </Select>
          </Box>

          <Tooltip title={t.routes.addResponse} arrow>
            <IconButton size="small" onClick={handleAddResponse} sx={{ width: 26, height: 26 }}>
              <AddRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 3. Compact Branch Parameters Row (Unified in 1 Row, STRICT nowrap) */}
      <Box
        sx={{
          height: 38,
          minHeight: 38,
          px: 1.5,
          display: 'flex',
          gap: 1.2,
          alignItems: 'center',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.grey[50], 0.6)
              : alpha(theme.palette.background.default, 0.4),
          '&::-webkit-scrollbar': {
            height: '3px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.text.primary, 0.15),
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.primary, 0.3)
            }
          }
        }}
      >
        {/* Status Code */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexShrink: 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {t.routes.statusLabel || '状态码:'}
          </Typography>
          <Select
            size="small"
            value={activeResponse.statusCode}
            onChange={(e) => updateActiveResponse((resp) => ({ ...resp, statusCode: Number(e.target.value) }))}
            sx={{
              height: 26,
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: "'Fira Code', monospace",
              borderRadius: 1,
              '& .MuiSelect-select': { py: 0.2, px: 0.8 }
            }}
          >
            {COMMON_STATUS_CODES.map((code) => (
              <MenuItem key={code} value={code} sx={{ fontSize: '0.75rem' }}>
                {code}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Latency */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexShrink: 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {t.routes.latencyLabel || '延迟:'}
          </Typography>
          <TextField
            size="small"
            type="number"
            value={activeResponse.latency}
            onChange={(e) => updateActiveResponse((resp) => ({ ...resp, latency: Math.max(0, Number(e.target.value)) }))}
            sx={{
              width: 68,
              minWidth: 68,
              maxWidth: 68,
              flexShrink: 0,
              '& .MuiInputBase-root': {
                height: 26,
                fontSize: '0.75rem',
                fontFamily: "'Fira Code', monospace",
                borderRadius: 1
              },
              '& input': {
                py: 0.2,
                px: 0.6,
                textAlign: 'center'
              }
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.disabled,
              fontSize: '0.68rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            ms
          </Typography>
        </Box>

        {/* Branch Label */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flex: 1, minWidth: 100, maxWidth: 320 }}>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {t.routes.branchLabel || '标签:'}
          </Typography>
          <TextField
            size="small"
            placeholder={t.routes.labelPlaceholder || '分支说明 (如 200 OK)'}
            value={activeResponse.label || ''}
            onChange={(e) => updateActiveResponse((resp) => ({ ...resp, label: e.target.value }))}
            InputProps={{
              sx: {
                height: 26,
                fontSize: '0.75rem',
                borderRadius: 1
              }
            }}
            sx={{ flex: 1, minWidth: 100 }}
          />
        </Box>

        {/* Set as Default Switch */}
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
          label={
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.72rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {t.routes.defaultResponse || '默认响应'}
            </Typography>
          }
          sx={{ mr: 0, flexShrink: 0, whiteSpace: 'nowrap' }}
        />

        {/* Disable Templating Switch */}
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={!!activeResponse.disableTemplating}
              onChange={(e) => updateActiveResponse((resp) => ({ ...resp, disableTemplating: e.target.checked }))}
            />
          }
          label={
            <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {locale === 'zh-CN' ? '禁用模板引擎' : 'Disable Templating'}
            </Typography>
          }
          sx={{ mr: 0, flexShrink: 0, whiteSpace: 'nowrap' }}
        />

        {/* Fallback to 404 (for FILE responses) */}
        {activeResponse.bodyType === 'FILE' && (
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={!!activeResponse.fallbackTo404}
                onChange={(e) => updateActiveResponse((resp) => ({ ...resp, fallbackTo404: e.target.checked }))}
              />
            }
            label={
              <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {locale === 'zh-CN' ? '缺文件回退404' : '404 on missing file'}
              </Typography>
            }
            sx={{ mr: 0, flexShrink: 0, whiteSpace: 'nowrap' }}
          />
        )}
      </Box>

      {/* 4. Single Clean Sub-Tabs: Body / Headers / Rules */}
      <Box
        sx={{
          height: 34,
          minHeight: 34,
          px: 1.5,
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Tabs
          value={responseSubTab}
          onChange={(_, v) => setResponseSubTab(v)}
          sx={{
            minHeight: 34,
            '& .MuiTab-root': {
              minHeight: 34,
              py: 0,
              px: 1.5,
              fontSize: '0.75rem',
              textTransform: 'none',
              fontWeight: 600
            }
          }}
        >
          <Tab
            icon={<CodeRoundedIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
            label={t.routes.bodyTab || '响应内容'}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>{t.routes.headersTab || '响应头'}</span>
                <Box
                  sx={{
                    px: 0.6,
                    py: 0.1,
                    borderRadius: 10,
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    minWidth: 16,
                    lineHeight: 1,
                    textAlign: 'center'
                  }}
                >
                  {activeResponse.headers.length}
                </Box>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>{t.routes.rulesTab || '规则条件'}</span>
                <Box
                  sx={{
                    px: 0.6,
                    py: 0.1,
                    borderRadius: 10,
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    minWidth: 16,
                    lineHeight: 1,
                    textAlign: 'center'
                  }}
                >
                  {(activeResponse.rules || []).length}
                </Box>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>{locale === 'zh-CN' ? '回调调用' : 'Callbacks'}</span>
                <Box
                  sx={{
                    px: 0.6,
                    py: 0.1,
                    borderRadius: 10,
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    minWidth: 16,
                    lineHeight: 1,
                    textAlign: 'center'
                  }}
                >
                  {(activeResponse.callbacks || []).length}
                </Box>
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* 5. Sub-Tab Panels (Fills remaining height) */}
      <Box sx={{ flex: 1, p: 1.2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Panel 0: Body Editor (With integrated CodeEditor, Gutter & Format/Copy Toolbar) */}
        {responseSubTab === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {activeResponse.bodyType === 'INLINE' && (
              <CodeEditor
                value={activeResponse.body || ''}
                onChange={(val) => updateActiveResponse((resp) => ({ ...resp, body: val }))}
                bodyType={activeResponse.bodyType}
                onBodyTypeChange={(type) => updateActiveResponse((resp) => ({ ...resp, bodyType: type }))}
                placeholder={t.routes.bodyPlaceholder || '在此输入响应体内容 (JSON, XML, 文本)...'}
              />
            )}

            {/* File Response View */}
            {activeResponse.bodyType === 'FILE' && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {t.routes.configFileResponse || '配置文件响应 (File Response)'}
                  </Typography>

                  <Button
                    size="small"
                    variant="text"
                    onClick={() => updateActiveResponse((resp) => ({ ...resp, bodyType: 'INLINE' }))}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {t.routes.switchToInline || '切换回自定义内容 (Inline)'}
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t.routes.bodyPath || '选择文件路径'}
                      placeholder="/path/to/response-data.json or image.png"
                      value={cleanFilePath}
                      onChange={(e) => updateActiveResponse((resp) => ({ ...resp, filePath: e.target.value }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        ),
                        endAdornment: cleanFilePath ? (
                          <InputAdornment position="end">
                            <Tooltip title="清除路径" arrow>
                              <IconButton
                                size="small"
                                onClick={() => updateActiveResponse((resp) => ({ ...resp, filePath: '' }))}
                                sx={{ p: 0.5, color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary } }}
                              >
                                <ClearRoundedIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ) : null,
                        sx: {
                          borderRadius: 1.5,
                          fontSize: '0.82rem',
                          fontFamily: "'Fira Code', monospace"
                        }
                      }}
                    />

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FolderOpenRoundedIcon sx={{ fontSize: 16 }} />}
                      onClick={handleBrowseFile}
                      sx={{
                        whiteSpace: 'nowrap',
                        height: 38,
                        px: 1.8,
                        borderRadius: 1.5,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        flexShrink: 0,
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.primary,
                        backgroundColor:
                          theme.palette.mode === 'light'
                            ? alpha(theme.palette.text.primary, 0.03)
                            : alpha('#ffffff', 0.05),
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.08)
                        }
                      }}
                    >
                      {t.routes.browseFile || '选择文件...'}
                    </Button>

                    <Tooltip title={t.routes.locateFile || '在系统访达 / 文件夹中定位该文件'} arrow>
                      <span>
                        <IconButton
                          size="small"
                          disabled={!cleanFilePath}
                          onClick={() => {
                            if (cleanFilePath) {
                              apiService.showFile(cleanFilePath);
                            }
                          }}
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1.5,
                            border: `1px solid ${theme.palette.divider}`,
                            color: cleanFilePath ? theme.palette.text.primary : theme.palette.text.disabled,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              borderColor: theme.palette.primary.main
                            }
                          }}
                        >
                          <TravelExploreRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="在默认应用中打开文件" arrow>
                      <span>
                        <IconButton
                          size="small"
                          disabled={!cleanFilePath}
                          onClick={() => {
                            if (cleanFilePath) {
                              apiService.openFile(cleanFilePath);
                            }
                          }}
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1.5,
                            border: `1px solid ${theme.palette.divider}`,
                            color: cleanFilePath ? theme.palette.text.primary : theme.palette.text.disabled,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              borderColor: theme.palette.primary.main
                            }
                          }}
                        >
                          <LaunchRoundedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>

                  {cleanFilePath && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.72rem',
                        fontFamily: "'Fira Code', monospace",
                        px: 0.5
                      }}
                    >
                      当前文件：{cleanFilePath}
                    </Typography>
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
                        {t.routes.sendFileAsBody}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {t.routes.sendFileAsBodyDesc || '开启后将直接以文件原始内容和推断的二进制/MIME 类型流式发送。'}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            )}

            {/* DataBucket View */}
            {activeResponse.bodyType === 'DATABUCKET' && (
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {t.routes.bindDataBucket || '绑定数据桶生成 (Data Bucket)'}
                  </Typography>

                  <Button
                    size="small"
                    variant="text"
                    onClick={() => updateActiveResponse((resp) => ({ ...resp, bodyType: 'INLINE' }))}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {t.routes.switchToInline || '切换回自定义内容 (Inline)'}
                  </Button>
                </Box>

                <FormControl fullWidth size="small">
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
              </Paper>
            )}
          </Box>
        )}

        {/* Panel 1: Headers Table */}
        {responseSubTab === 1 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.8 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={handleAddHeader}
                sx={{ fontSize: '0.75rem', py: 0.3 }}
              >
                {t.routes.addHeader || '添加响应头'}
              </Button>
            </Box>

            <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.text.primary, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600, width: '45%' }}>Header Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '45%' }}>Header Value</TableCell>
                    <TableCell width={50} align="center">{t.common.actions || '操作'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeResponse.headers.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ py: 0.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={h.key}
                          placeholder="Content-Type"
                          onChange={(e) => {
                            const key = e.target.value;
                            updateActiveResponse((resp) => ({
                              ...resp,
                              headers: resp.headers.map((item, idx) => (idx === i ? { ...item, key } : item))
                            }));
                          }}
                          InputProps={{ sx: { height: 28, fontSize: '0.78rem', fontFamily: "'Fira Code', monospace" } }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={h.value}
                          placeholder="application/json"
                          onChange={(e) => {
                            const value = e.target.value;
                            updateActiveResponse((resp) => ({
                              ...resp,
                              headers: resp.headers.map((item, idx) => (idx === i ? { ...item, value } : item))
                            }));
                          }}
                          InputProps={{ sx: { height: 28, fontSize: '0.78rem', fontFamily: "'Fira Code', monospace" } }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            updateActiveResponse((resp) => ({
                              ...resp,
                              headers: resp.headers.filter((_, idx) => idx !== i)
                            }));
                          }}
                          sx={{ '&:hover': { color: theme.palette.error.main } }}
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}

        {/* Panel 2: Rules Table */}
        {responseSubTab === 2 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                  {locale === 'zh-CN' ? '规则逻辑关系:' : 'Rules operator:'}
                </Typography>
                <Select
                  size="small"
                  value={activeResponse.rulesOperator || 'OR'}
                  onChange={(e) => updateActiveResponse((resp) => ({ ...resp, rulesOperator: e.target.value as any }))}
                  sx={{ height: 26, fontSize: '0.72rem', borderRadius: 1 }}
                >
                  <MenuItem value="OR" sx={{ fontSize: '0.72rem' }}>{locale === 'zh-CN' ? '满足任意条件 (OR)' : 'Match ANY (OR)'}</MenuItem>
                  <MenuItem value="AND" sx={{ fontSize: '0.72rem' }}>{locale === 'zh-CN' ? '满足所有条件 (AND)' : 'Match ALL (AND)'}</MenuItem>
                </Select>
              </Box>

              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={handleAddRule}
                sx={{ fontSize: '0.75rem', py: 0.3 }}
              >
                {t.routes.addRule || '添加规则条件'}
              </Button>
            </Box>

            <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', p: 1, borderRadius: 1.5 }}>
              {(activeResponse.rules || []).length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', color: theme.palette.text.disabled, fontSize: '0.8rem' }}>
                  {locale === 'zh-CN' ? '暂未添加任何条件规则。未设规则时将默认作为后备响应。' : 'No rules defined yet. This response will serve as fallback.'}
                </Box>
              ) : (
                (activeResponse.rules || []).map((rule, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.text.primary, 0.02)
                    }}
                  >
                    <Select
                      size="small"
                      value={rule.target || 'header'}
                      onChange={(e) => {
                        const target = e.target.value as any;
                        updateActiveResponse((resp) => ({
                          ...resp,
                          rules: (resp.rules || []).map((r, i) => (i === idx ? { ...r, target } : r))
                        }));
                      }}
                      sx={{ height: 28, fontSize: '0.75rem', width: 120 }}
                    >
                      <MenuItem value="header">Header</MenuItem>
                      <MenuItem value="query">Query Param</MenuItem>
                      <MenuItem value="body">Body (JSONPath)</MenuItem>
                      <MenuItem value="params">Route Param (:id)</MenuItem>
                      <MenuItem value="cookie">Cookie</MenuItem>
                      <MenuItem value="path">Path</MenuItem>
                      <MenuItem value="method">Method</MenuItem>
                      <MenuItem value="request_number">Request Count</MenuItem>
                      <MenuItem value="global_var">Global Var</MenuItem>
                      <MenuItem value="data_bucket">Data Bucket</MenuItem>
                      <MenuItem value="templating">Templating</MenuItem>
                    </Select>

                    <TextField
                      size="small"
                      placeholder={t.routes.ruleProperty || '属性 / 键名 (Property)'}
                      value={rule.modifier || (rule as any).property || ''}
                      onChange={(e) => {
                        const modifier = e.target.value;
                        updateActiveResponse((resp) => ({
                          ...resp,
                          rules: (resp.rules || []).map((r, i) =>
                            i === idx ? { ...r, modifier, property: modifier } : r
                          )
                        }));
                      }}
                      InputProps={{ sx: { height: 28, fontSize: '0.75rem' } }}
                      sx={{ flex: 1 }}
                    />

                    <Select
                      size="small"
                      value={rule.operator || 'equals'}
                      onChange={(e) => {
                        const operator = e.target.value as any;
                        updateActiveResponse((resp) => ({
                          ...resp,
                          rules: (resp.rules || []).map((r, i) => (i === idx ? { ...r, operator } : r))
                        }));
                      }}
                      sx={{ height: 28, fontSize: '0.75rem', width: 130 }}
                    >
                      <MenuItem value="equals">{t.routes.ruleOperatorEquals || '等于 (=)'}</MenuItem>
                      <MenuItem value="regex">{t.routes.ruleOperatorRegex || '正则匹配'}</MenuItem>
                      <MenuItem value="regex_i">正则 (忽略大小写)</MenuItem>
                      <MenuItem value="null">{t.routes.ruleOperatorNull || '为空 (Null)'}</MenuItem>
                      <MenuItem value="empty_array">{t.routes.ruleOperatorEmptyArray || '空数组'}</MenuItem>
                      <MenuItem value="array_includes">包含在数组中</MenuItem>
                      <MenuItem value="valid_json_schema">符合 JSON Schema</MenuItem>
                    </Select>

                    <TextField
                      size="small"
                      placeholder={t.routes.ruleValue || '匹配值 (Value)'}
                      value={rule.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateActiveResponse((resp) => ({
                          ...resp,
                          rules: (resp.rules || []).map((r, i) => (i === idx ? { ...r, value } : r))
                        }));
                      }}
                      InputProps={{ sx: { height: 28, fontSize: '0.75rem' } }}
                      sx={{ flex: 1 }}
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={!!rule.invert}
                          onChange={(e) => {
                            const invert = e.target.checked;
                            updateActiveResponse((resp) => ({
                              ...resp,
                              rules: (resp.rules || []).map((r, i) => (i === idx ? { ...r, invert } : r))
                            }));
                          }}
                          sx={{ p: 0.3 }}
                        />
                      }
                      label={<Typography variant="caption" sx={{ fontSize: '0.72rem' }}>取反</Typography>}
                      sx={{ mr: 0.5, flexShrink: 0 }}
                    />

                    <IconButton
                      size="small"
                      onClick={() => {
                        updateActiveResponse((resp) => ({
                          ...resp,
                          rules: (resp.rules || []).filter((_, i) => i !== idx)
                        }));
                      }}
                      sx={{ '&:hover': { color: theme.palette.error.main } }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))
              )}
            </Paper>
          </Box>
        )}

        {/* Panel 3: Callbacks Invocations */}
        {responseSubTab === 3 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {locale === 'zh-CN'
                  ? '当请求命中并返回此响应时，自动异步触发已配置的 Webhook 回调。'
                  : 'Trigger asynchronous webhook callbacks when this response is sent.'}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  const defaultCbUuid = activeEnvironment.callbacks?.[0]?.uuid || '';
                  updateActiveResponse((resp) => ({
                    ...resp,
                    callbacks: [...(resp.callbacks || []), { uuid: defaultCbUuid, latency: 0 }]
                  }));
                }}
                sx={{ fontSize: '0.75rem', py: 0.3 }}
              >
                {locale === 'zh-CN' ? '添加回调调用' : 'Add Callback'}
              </Button>
            </Box>

            {(!activeEnvironment.callbacks || activeEnvironment.callbacks.length === 0) ? (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1.5 }}>
                  {locale === 'zh-CN'
                    ? '当前环境尚未定义任何 Webhook 回调。请先在左侧环境导航栏的 [回调 Webhook] 中创建回调，即可在此关联调用。'
                    : 'No callbacks defined in this environment yet. Create a callback in the Callbacks tab first.'}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setActiveTabKey('callbacks')}
                  sx={{ fontSize: '0.78rem', textTransform: 'none', borderRadius: 1.5 }}
                >
                  {locale === 'zh-CN' ? '前往配置 Webhook 回调' : 'Go to Callbacks'}
                </Button>
              </Paper>
            ) : (
              <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', p: 1, borderRadius: 1.5 }}>
                {(!activeResponse.callbacks || activeResponse.callbacks.length === 0) ? (
                  <Box sx={{ p: 3, textAlign: 'center', color: theme.palette.text.disabled, fontSize: '0.8rem' }}>
                    {locale === 'zh-CN' ? '暂未添加任何回调调用，点击右上角按钮添加。' : 'No callbacks added yet.'}
                  </Box>
                ) : (
                  activeResponse.callbacks.map((inv, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'center',
                        mb: 1,
                        p: 1.2,
                        borderRadius: 1.5,
                        backgroundColor: alpha(theme.palette.text.primary, 0.02),
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel>{locale === 'zh-CN' ? '选择 Webhook 回调' : 'Callback'}</InputLabel>
                        <Select
                          value={inv.uuid}
                          label={locale === 'zh-CN' ? '选择 Webhook 回调' : 'Callback'}
                          onChange={(e) => {
                            const uuid = e.target.value;
                            updateActiveResponse((resp) => ({
                              ...resp,
                              callbacks: (resp.callbacks || []).map((c, i) => (i === idx ? { ...c, uuid } : c))
                            }));
                          }}
                          sx={{ height: 32, fontSize: '0.8rem' }}
                        >
                          {activeEnvironment.callbacks.map((cb) => (
                            <MenuItem key={cb.uuid || cb.id} value={cb.uuid}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    px: 0.6,
                                    py: 0.1,
                                    borderRadius: 0.8,
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                    backgroundColor: (METHOD_COLORS[cb.method.toLowerCase()] || METHOD_COLORS.get).bg,
                                    color: '#ffffff',
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  {cb.method}
                                </Box>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {cb.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: "'Fira Code', monospace" }}>
                                  ({cb.uri})
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.72rem' }}>
                          {locale === 'zh-CN' ? '延迟调用:' : 'Delay:'}
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={inv.latency}
                          onChange={(e) => {
                            const latency = Math.max(0, Number(e.target.value));
                            updateActiveResponse((resp) => ({
                              ...resp,
                              callbacks: (resp.callbacks || []).map((c, i) => (i === idx ? { ...c, latency } : c))
                            }));
                          }}
                          sx={{
                            width: 72,
                            '& .MuiInputBase-root': { height: 32, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace", borderRadius: 1 },
                            '& input': { textAlign: 'center', py: 0.2, px: 0.5 }
                          }}
                        />
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontSize: '0.68rem' }}>
                          ms
                        </Typography>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() => {
                          updateActiveResponse((resp) => ({
                            ...resp,
                            callbacks: (resp.callbacks || []).filter((_, i) => i !== idx)
                          }));
                        }}
                        sx={{ '&:hover': { color: theme.palette.error.main } }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))
                )}
              </Paper>
            )}
          </Box>
        )}
      </Box>

      {/* Copied Full URL Toast */}
      <Snackbar
        open={copiedSnackbar}
        autoHideDuration={2500}
        onClose={() => setCopiedSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCopiedSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%', fontSize: '0.8rem', py: 0.5, boxShadow: 3 }}
        >
          {locale === 'zh-CN' ? `接口完整路径已复制到剪贴板！(${fullRouteUrl})` : `Full route URL copied to clipboard! (${fullRouteUrl})`}
        </Alert>
      </Snackbar>
    </Box>
  );
};
