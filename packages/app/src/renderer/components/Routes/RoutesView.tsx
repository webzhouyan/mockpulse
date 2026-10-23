import React, { useState } from 'react';
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
  InputBase
} from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
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
  const { t } = useI18n();
  const {
    activeEnvironment,
    updateActiveEnvironment,
    selectedRouteUuid
  } = useApp();

  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);
  const [responseSubTab, setResponseSubTab] = useState(0); // 0: Body, 1: Headers, 2: Rules

  const routes = activeEnvironment?.routes || [];
  const activeRoute: Route | null =
    routes.find((r) => r.uuid === selectedRouteUuid) || routes[0] || null;

  const activeResponse: RouteResponse | null =
    activeRoute && activeRoute.responses[selectedResponseIndex]
      ? activeRoute.responses[selectedResponseIndex]
      : activeRoute?.responses[0] || null;

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
    updateRoute((r) => ({
      ...r,
      responses: r.responses.filter((resp) => resp.uuid !== uuid)
    }));
    setSelectedResponseIndex(0);
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
      property: '',
      operator: 'equals',
      value: '',
      invert: false
    };
    updateActiveResponse((resp) => ({
      ...resp,
      rules: [...(resp.rules || []), newRule]
    }));
  };

  // Browse local file dialog
  const handleBrowseFile = async () => {
    if (!activeResponse) return;
    try {
      const selectedPath = await apiService.showOpenDialog({
        title: '选择响应数据文件',
        buttonLabel: '选择文件',
        filters: [
          { name: 'All Files (*.*)', extensions: ['*'] },
          { name: 'JSON Files (*.json)', extensions: ['json'] },
          { name: 'Images (*.png, *.jpg, *.svg)', extensions: ['png', 'jpg', 'jpeg', 'svg'] }
        ]
      });
      if (selectedPath) {
        updateActiveResponse((resp) => ({ ...resp, filePath: selectedPath }));
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
              : alpha(theme.palette.background.default, 0.9)
        }}
      >
        {/* Unified Address Bar Box */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.6),
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.18)}`
            },
            overflow: 'hidden'
          }}
        >
          {/* Method Addon on Left (Badge or Select) */}
          {activeRoute.type === 'crud' ? (
            <Box
              sx={{
                px: 1.2,
                py: 0.5,
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.72rem',
                fontFamily: "'Fira Code', monospace",
                flexShrink: 0,
                letterSpacing: '0.02em',
                userSelect: 'none'
              }}
            >
              CRUD
            </Box>
          ) : activeRoute.type === 'ws' ? (
            <Box
              sx={{
                px: 1.2,
                py: 0.5,
                backgroundColor: '#06b6d4',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.72rem',
                fontFamily: "'Fira Code', monospace",
                flexShrink: 0,
                letterSpacing: '0.02em',
                userSelect: 'none'
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
              sx={{
                width: 96,
                flexShrink: 0,
                height: 32,
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? '#f1f5f9'
                    : alpha(theme.palette.background.default, 0.7),
                borderRight: `1px solid ${theme.palette.divider}`,
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: "'Fira Code', monospace",
                '& .MuiSelect-select': {
                  py: 0.4,
                  px: 1,
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
              renderValue={(val) => {
                const cfg = METHOD_COLORS[val.toLowerCase()] || METHOD_COLORS.get;
                return (
                  <Box
                    sx={{
                      px: 0.8,
                      py: 0.1,
                      borderRadius: 1,
                      backgroundColor: cfg.bg,
                      color: cfg.text,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '0.68rem'
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
              px: 1,
              fontFamily: "'Fira Code', monospace",
              fontSize: '0.9rem',
              fontWeight: 700,
              color: theme.palette.text.disabled,
              userSelect: 'none'
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
              py: 0.4,
              pr: 1,
              fontSize: '0.85rem',
              fontFamily: "'Fira Code', monospace",
              fontWeight: 600
            }}
          />
        </Box>

        {/* Documentation / Alias Hint Input below address bar */}
        <Box sx={{ mt: 0.6, px: 0.4, display: 'flex', alignItems: 'center' }}>
          <InputBase
            placeholder="添加接口文档描述 / 别名（例如：用户登录鉴权、获取商品列表）"
            value={activeRoute.documentation || ''}
            onChange={(e) => updateRoute((r) => ({ ...r, documentation: e.target.value }))}
            sx={{
              width: '100%',
              fontSize: '0.74rem',
              color: theme.palette.text.secondary
            }}
          />
        </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {resp.default && <StarRoundedIcon sx={{ fontSize: 13, color: '#f59e0b' }} />}
                  <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: "'Fira Code', monospace" }}>
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

        <Box sx={{ display: 'flex', gap: 0.4, alignItems: 'center' }}>
          <Tooltip title={t.routes.addResponse} arrow>
            <IconButton size="small" onClick={handleAddResponse} sx={{ width: 26, height: 26 }}>
              <AddRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          {activeRoute.responses.length > 1 && (
            <Tooltip title={t.common.delete} arrow>
              <IconButton size="small" onClick={() => handleDeleteResponse(activeResponse.uuid)} sx={{ width: 26, height: 26 }}>
                <DeleteOutlineRoundedIcon sx={{ fontSize: 15, color: theme.palette.error.main }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* 3. Compact Branch Parameters Row (Unified in 1 Row) */}
      <Box
        sx={{
          height: 38,
          minHeight: 38,
          px: 1.5,
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.grey[50], 0.6)
              : alpha(theme.palette.background.default, 0.4)
        }}
      >
        {/* Status Code */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.72rem' }}>
            状态码:
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.72rem' }}>
            延迟:
          </Typography>
          <TextField
            size="small"
            type="number"
            value={activeResponse.latency}
            onChange={(e) => updateActiveResponse((resp) => ({ ...resp, latency: Number(e.target.value) }))}
            InputProps={{
              sx: {
                height: 26,
                width: 65,
                fontSize: '0.75rem',
                fontFamily: "'Fira Code', monospace",
                borderRadius: 1
              }
            }}
          />
          <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontSize: '0.68rem' }}>
            ms
          </Typography>
        </Box>

        {/* Branch Label */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flex: 1 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.72rem' }}>
            标签:
          </Typography>
          <TextField
            size="small"
            placeholder="分支说明 (如 200 OK)"
            value={activeResponse.label || ''}
            onChange={(e) => updateActiveResponse((resp) => ({ ...resp, label: e.target.value }))}
            InputProps={{
              sx: {
                height: 26,
                fontSize: '0.75rem',
                borderRadius: 1
              }
            }}
            sx={{ flex: 1, minWidth: 150 }}
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
            <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
              默认响应
            </Typography>
          }
          sx={{ mr: 0 }}
        />
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
            label="响应内容"
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>响应头</span>
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
                <span>规则条件</span>
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
                placeholder="在此输入响应体内容 (JSON, XML, 文本)..."
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
                    配置文件响应 (File Response)
                  </Typography>

                  <Button
                    size="small"
                    variant="text"
                    onClick={() => updateActiveResponse((resp) => ({ ...resp, bodyType: 'INLINE' }))}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    切换回自定义内容 (Inline)
                  </Button>
                </Box>

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
                    startIcon={<FolderOpenRoundedIcon sx={{ fontSize: 16 }} />}
                    onClick={handleBrowseFile}
                    sx={{ whiteSpace: 'nowrap', py: 0.8 }}
                  >
                    浏览选择
                  </Button>

                  {activeResponse.filePath && (
                    <Tooltip title="在系统访达 / 文件夹中定位该文件" arrow>
                      <IconButton
                        size="small"
                        onClick={() => apiService.showFile(activeResponse.filePath || '')}
                        sx={{ width: 34, height: 34 }}
                      >
                        <TravelExploreRoundedIcon sx={{ fontSize: 18 }} />
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
                        {t.routes.sendFileAsBody}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        开启后将直接以文件原始内容和推断的二进制/MIME 类型流式发送。
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
                    绑定数据桶生成 (Data Bucket)
                  </Typography>

                  <Button
                    size="small"
                    variant="text"
                    onClick={() => updateActiveResponse((resp) => ({ ...resp, bodyType: 'INLINE' }))}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    切换回自定义内容 (Inline)
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
                添加响应头
              </Button>
            </Box>

            <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.text.primary, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600, width: '45%' }}>Header Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '45%' }}>Header Value</TableCell>
                    <TableCell width={50} align="center">操作</TableCell>
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.8 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={handleAddRule}
                sx={{ fontSize: '0.75rem', py: 0.3 }}
              >
                添加规则条件
              </Button>
            </Box>

            <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', p: 1, borderRadius: 1.5 }}>
              {(activeResponse.rules || []).map((rule, idx) => (
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
                    value={rule.target}
                    onChange={(e) => {
                      const target = e.target.value as any;
                      updateActiveResponse((resp) => ({
                        ...resp,
                        rules: (resp.rules || []).map((r, i) => (i === idx ? { ...r, target } : r))
                      }));
                    }}
                    sx={{ height: 28, fontSize: '0.75rem', width: 110 }}
                  >
                    <MenuItem value="header">Header</MenuItem>
                    <MenuItem value="query">Query Param</MenuItem>
                    <MenuItem value="body">Body Path</MenuItem>
                    <MenuItem value="params">Route Param</MenuItem>
                  </Select>

                  <TextField
                    size="small"
                    placeholder="属性名 (Property)"
                    value={rule.property}
                    onChange={(e) => {
                      const property = e.target.value;
                      updateActiveResponse((resp) => ({
                        ...resp,
                        rules: (resp.rules || []).map((r, i) => (i === idx ? { ...r, property } : r))
                      }));
                    }}
                    InputProps={{ sx: { height: 28, fontSize: '0.75rem' } }}
                    sx={{ flex: 1 }}
                  />

                  <Select
                    size="small"
                    value={rule.operator}
                    onChange={(e) => {
                      const operator = e.target.value as any;
                      updateActiveResponse((resp) => ({
                        ...resp,
                        rules: (resp.rules || []).map((r, i) => (i === idx ? { ...r, operator } : r))
                      }));
                    }}
                    sx={{ height: 28, fontSize: '0.75rem', width: 100 }}
                  >
                    <MenuItem value="equals">等于 (=)</MenuItem>
                    <MenuItem value="regex_match">正则匹配</MenuItem>
                    <MenuItem value="null">为空 (Null)</MenuItem>
                    <MenuItem value="empty_array">空数组</MenuItem>
                  </Select>

                  <TextField
                    size="small"
                    placeholder="匹配值 (Value)"
                    value={rule.value}
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
              ))}
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};
