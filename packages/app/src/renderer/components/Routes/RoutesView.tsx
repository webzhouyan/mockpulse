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
import RuleRoundedIcon from '@mui/icons-material/RuleRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { Route, RouteResponse, Header as ResponseHeader, ResponseRule } from '@mockoon/commons';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all'];

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
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

  const [search, setSearch] = useState('');
  const [selectedRouteUuid, setSelectedRouteUuid] = useState<string | null>(null);
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);
  const [responseSubTab, setResponseSubTab] = useState(0); // 0: Body, 1: Headers, 2: Rules

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
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Route List Sidebar (Left) */}
      <Box
        sx={{
          width: isCompact ? 260 : 310,
          minWidth: isCompact ? 260 : 310,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.background.paper, 0.4)
              : alpha(theme.palette.background.default, 0.5)
        }}
      >
        {/* Search & Add */}
        <Box sx={{ p: isCompact ? 1 : 1.5, display: 'flex', gap: 0.8, alignItems: 'center' }}>
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
                width: isCompact ? 32 : 36,
                height: isCompact ? 32 : 36,
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
        <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
          <List sx={{ p: 0 }}>
            {filteredRoutes.map((route) => {
              const isSelected = activeRoute?.uuid === route.uuid;
              const methodConfig = METHOD_COLORS[route.method.toLowerCase()] || METHOD_COLORS.get;

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
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  }
                  sx={{ mb: 0.5 }}
                >
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => {
                      setSelectedRouteUuid(route.uuid);
                      setSelectedResponseIndex(0);
                    }}
                    sx={{
                      borderRadius: 2,
                      py: 0.8,
                      px: 1.2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        minWidth: 48,
                        textAlign: 'center',
                        py: 0.2,
                        borderRadius: 1,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: methodConfig.bg,
                        color: methodConfig.text,
                        textTransform: 'uppercase',
                        fontFamily: "'Fira Code', monospace"
                      }}
                    >
                      {route.method}
                    </Box>

                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 600 : 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontFamily: "'Fira Code', monospace",
                            fontSize: '0.8rem'
                          }}
                        >
                          /{route.endpoint}
                        </Typography>
                      }
                      secondary={
                        route.documentation ? (
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: '0.7rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {route.documentation}
                          </Typography>
                        ) : null
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>

      {/* Route Detail & Responses (Right) */}
      {activeRoute && activeResponse ? (
        <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Route Header (Method & Path & Doc) */}
          <Paper
            square
            sx={{
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <FormControl size="small" sx={{ width: 110 }}>
                <Select
                  value={activeRoute.method}
                  onChange={(e) => updateRoute((r) => ({ ...r, method: e.target.value as any }))}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontFamily: "'Fira Code', monospace"
                  }}
                >
                  {HTTP_METHODS.map((m) => (
                    <MenuItem key={m} value={m} sx={{ textTransform: 'uppercase', fontFamily: "'Fira Code', monospace" }}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label={t.routes.path}
                value={activeRoute.endpoint}
                onChange={(e) => updateRoute((r) => ({ ...r, endpoint: e.target.value.replace(/^\//, '') }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">/</InputAdornment>
                }}
                sx={{ '& input': { fontFamily: "'Fira Code', monospace" } }}
              />
            </Box>

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
              px: 2,
              pt: 1,
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
              sx={{ minHeight: 40 }}
            >
              {activeRoute.responses.map((resp, idx) => (
                <Tab
                  key={resp.uuid}
                  sx={{ minHeight: 40, py: 0.5 }}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      {resp.default && <StarRoundedIcon sx={{ fontSize: 16, color: '#f59e0b' }} />}
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
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

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={t.routes.addResponse} arrow>
                <IconButton size="small" onClick={handleAddResponse}>
                  <AddRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              {activeRoute.responses.length > 1 && (
                <Tooltip title={t.common.delete} arrow>
                  <IconButton size="small" onClick={() => handleDeleteResponse(activeResponse.uuid)}>
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Response Body & Properties Section */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Status Code, Latency, Label, Default flag */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ width: 130 }}>
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
                sx={{ width: 130 }}
              />

              <TextField
                size="small"
                label={t.routes.label}
                value={activeResponse.label || ''}
                placeholder="OK, Error, etc."
                onChange={(e) => updateActiveResponse((resp) => ({ ...resp, label: e.target.value }))}
                sx={{ flex: 1, minWidth: 150 }}
              />

              <FormControlLabel
                control={
                  <Switch
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
                label={t.routes.isDefault}
              />
            </Box>

            {/* Sub Tabs: Body / Headers / Rules */}
            <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Tabs value={responseSubTab} onChange={(_, v) => setResponseSubTab(v)} sx={{ minHeight: 36 }}>
                <Tab icon={<CodeRoundedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={t.routes.bodyContent} sx={{ minHeight: 36, py: 0 }} />
                <Tab
                  icon={
                    <Chip
                      size="small"
                      label={activeResponse.headers.length}
                      sx={{ height: 18, fontSize: '0.68rem', mr: 0.5 }}
                    />
                  }
                  iconPosition="end"
                  label={t.routes.headers}
                  sx={{ minHeight: 36, py: 0 }}
                />
                <Tab
                  icon={
                    <Chip
                      size="small"
                      label={(activeResponse.rules || []).length}
                      sx={{ height: 18, fontSize: '0.68rem', mr: 0.5 }}
                    />
                  }
                  iconPosition="end"
                  label={t.routes.rules}
                  sx={{ minHeight: 36, py: 0 }}
                />
              </Tabs>
            </Box>

            {/* Sub Tab 0: Body Editor */}
            {responseSubTab === 0 && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    {t.routes.bodyType}:
                  </Typography>
                  <Chip
                    size="small"
                    label={t.routes.bodyInline}
                    color={activeResponse.bodyType === 'INLINE' ? 'primary' : 'default'}
                    onClick={() => updateActiveResponse((resp) => ({ ...resp, bodyType: 'INLINE' }))}
                  />
                  <Chip
                    size="small"
                    label={t.routes.bodyFile}
                    color={activeResponse.bodyType === 'FILE' ? 'primary' : 'default'}
                    onClick={() => updateActiveResponse((resp) => ({ ...resp, bodyType: 'FILE' }))}
                  />
                  <Chip
                    size="small"
                    label={t.routes.bodyDatabucket}
                    color={activeResponse.bodyType === 'DATABUCKET' ? 'primary' : 'default'}
                    onClick={() => updateActiveResponse((resp) => ({ ...resp, bodyType: 'DATABUCKET' }))}
                  />
                </Box>

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
                        fontSize: '0.85rem',
                        lineHeight: 1.5
                      }
                    }}
                  />
                )}

                {activeResponse.bodyType === 'FILE' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t.routes.bodyPath}
                      value={activeResponse.filePath || ''}
                      onChange={(e) => updateActiveResponse((resp) => ({ ...resp, filePath: e.target.value }))}
                    />
                  </Box>
                )}

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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {t.routes.headers}
                  </Typography>
                  <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={handleAddHeader}>
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
                          <TableCell>
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
                          <TableCell>
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
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => {
                                updateActiveResponse((resp) => ({
                                  ...resp,
                                  headers: resp.headers.filter((_, idx) => idx !== i)
                                }));
                              }}
                              sx={{ color: theme.palette.error.main }}
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {t.routes.rulesNotice}
                  </Typography>
                  <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={handleAddRule}>
                    {t.routes.addRule}
                  </Button>
                </Box>

                {(activeResponse.rules || []).map((rule, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ width: 140 }}>
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

                    <FormControl size="small" sx={{ width: 130 }}>
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
                      sx={{ color: theme.palette.error.main }}
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
    </Box>
  );
};

