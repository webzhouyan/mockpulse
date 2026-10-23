import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemButton,
  Tabs,
  Tab,
  alpha,
  useTheme,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  InputBase,
  Collapse,
  Divider
} from '@mui/material';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import SouthWestRoundedIcon from '@mui/icons-material/SouthWestRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import { Transaction, Header } from '@mockoon/commons';
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
  ws: { bg: '#06b6d4', text: '#ffffff' }
};

const formatRelativeTime = (timestampMs: number, locale: string): string => {
  if (!timestampMs) return '';
  const diffSec = Math.floor((Date.now() - timestampMs) / 1000);
  if (diffSec < 5) return locale === 'zh-CN' ? '刚刚' : 'just now';
  if (diffSec < 60) return locale === 'zh-CN' ? `${diffSec}秒前` : `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return locale === 'zh-CN' ? `${diffMin}分钟前` : `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return locale === 'zh-CN' ? `${diffHour}小时前` : `${diffHour}h ago`;
  return new Date(timestampMs).toLocaleTimeString();
};

const formatHeadersText = (headers: Header[] = []): string => {
  return headers.map((h) => `${h.key}: ${h.value}`).join('\n');
};

const formatBodyContent = (body: any): string => {
  if (!body) return '';
  if (typeof body === 'object') {
    try {
      return JSON.stringify(body, null, 2);
    } catch {
      return String(body);
    }
  }
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return body;
    }
  }
  return String(body);
};

export const LogsView: React.FC = () => {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const {
    activeEnvironment,
    serverStatuses,
    toggleServer,
    serverLogs,
    clearLogs,
    setSelectedRouteUuid,
    setActiveTabKey
  } = useApp();

  const [copiedSnackbar, setCopiedSnackbar] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('request');

  // Accordion fold states
  const [openReqGeneral, setOpenReqGeneral] = useState(true);
  const [openReqHeaders, setOpenReqHeaders] = useState(true);
  const [openReqParams, setOpenReqParams] = useState(true);
  const [openReqQuery, setOpenReqQuery] = useState(true);
  const [openReqBody, setOpenReqBody] = useState(true);

  const [openResGeneral, setOpenResGeneral] = useState(true);
  const [openResHeaders, setOpenResHeaders] = useState(true);
  const [openResBody, setOpenResBody] = useState(true);

  const logs = activeEnvironment ? serverLogs[activeEnvironment.uuid] || [] : [];
  const status = activeEnvironment ? serverStatuses[activeEnvironment.uuid] || 'stopped' : 'stopped';
  const isRunning = status === 'running';

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter((tx) => {
      const methodMatch = (tx.request?.method || '').toLowerCase().includes(q);
      const pathMatch = (tx.request?.urlPath || '').toLowerCase().includes(q);
      const statusMatch = String(tx.response?.statusCode || '').includes(q);
      return methodMatch || pathMatch || statusMatch;
    });
  }, [logs, search]);

  const activeTx: Transaction | null = filteredLogs[selectedIndex] || filteredLogs[0] || null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnackbar(true);
  };

  // Locate matched route in active environment
  const matchedRouteInfo = useMemo(() => {
    if (!activeTx || !activeEnvironment) return null;
    const route = (activeEnvironment.routes || []).find((r) => r.uuid === activeTx.routeUUID);
    if (!route) return null;
    const respIdx = (route.responses || []).findIndex((r) => r.uuid === activeTx.routeResponseUUID);
    const response = route.responses[respIdx] || route.responses[0] || null;
    return {
      route,
      response,
      respIdx: respIdx !== -1 ? respIdx + 1 : 1
    };
  }, [activeTx, activeEnvironment]);

  // Navigate to route in editor
  const handleJumpToRoute = () => {
    if (!matchedRouteInfo) return;
    setSelectedRouteUuid(matchedRouteInfo.route.uuid);
    setActiveTabKey('routes');
  };

  // 1. Empty State
  if (logs.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.background.paper, 0.4)
              : alpha(theme.palette.background.default, 0.5)
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
          }}
        >
          <ArticleOutlinedIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.8, color: theme.palette.text.primary }}>
          {t.logs.noLogsTitle || '暂无实时请求日志'}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: 'center',
            maxWidth: 420,
            mb: 3,
            lineHeight: 1.6,
            fontSize: '0.8rem'
          }}
        >
          {t.logs.noLogsDesc || '当客户端向当前服务端口发送 HTTP 请求时，每一次调用的方法、路径、状态码和耗时将在此实时呈现。'}
        </Typography>

        {!isRunning && activeEnvironment && (
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={() => toggleServer(activeEnvironment.uuid)}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 0.7,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}
          >
            {t.app.startServer} ({activeEnvironment.port})
          </Button>
        )}
      </Box>
    );
  }

  // 2. Standard Mockoon-style Inspector
  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Left Column: Requests Log Stream (Identical to original Mockoon) */}
      <Box
        sx={{
          width: 310,
          minWidth: 280,
          maxWidth: 400,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.background.paper, 0.5)
              : alpha(theme.palette.background.default, 0.6)
        }}
      >
        {/* Stream Header */}
        <Box
          sx={{
            p: 1.2,
            px: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800, fontSize: '0.84rem' }}>
            {t.logs.streamTitle || '请求流'} ({filteredLogs.length})
          </Typography>

          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepRoundedIcon sx={{ fontSize: 14 }} />}
            onClick={() => {
              if (activeEnvironment) clearLogs(activeEnvironment.uuid);
            }}
            sx={{
              textTransform: 'none',
              py: 0.2,
              px: 1,
              fontSize: '0.7rem',
              borderRadius: 1.5,
              whiteSpace: 'nowrap'
            }}
          >
            {t.logs.clearLogs}
          </Button>
        </Box>

        {/* Filter Input (Filter Cmd+Shift+F) */}
        <Box
          sx={{
            p: 1,
            px: 1.2,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor:
                theme.palette.mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.6),
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              px: 1,
              py: 0.3
            }}
          >
            <SearchRoundedIcon sx={{ fontSize: 16, color: theme.palette.text.disabled, mr: 0.6 }} />
            <InputBase
              placeholder="Filter (Cmd+Shift+F)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ fontSize: '0.76rem', width: '100%', fontFamily: "'Fira Code', monospace" }}
            />
          </Box>
        </Box>

        {/* Stream Items List (2-Line Mockoon Design) */}
        <Box className="selectable" sx={{ flex: 1, overflowY: 'auto', userSelect: 'text' }}>
          <List sx={{ p: 0.6 }}>
            {filteredLogs.map((tx, idx) => {
              const isSelected = activeTx === tx;
              const methodKey = (tx.request?.method || 'get').toLowerCase();
              const methodCfg = METHOD_COLORS[methodKey] || { bg: '#64748b', text: '#ffffff' };
              const statusCode = tx.response?.statusCode || 200;
              const is2xx = statusCode >= 200 && statusCode < 300;
              const is3xx = statusCode >= 300 && statusCode < 400;
              const is4xx = statusCode >= 400 && statusCode < 500;
              const is5xx = statusCode >= 500;

              const statusColor = is2xx
                ? '#10b981'
                : is3xx
                ? '#3b82f6'
                : is4xx
                ? '#f59e0b'
                : '#ef4444';

              return (
                <ListItem key={tx.uuid || idx} disablePadding sx={{ mb: 0.4 }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => setSelectedIndex(idx)}
                    sx={{
                      borderRadius: 1.5,
                      py: 0.7,
                      px: 1.2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 0.4,
                      position: 'relative',
                      borderLeft: isSelected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                      backgroundColor: isSelected
                        ? alpha(theme.palette.primary.main, 0.12)
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: isSelected
                          ? alpha(theme.palette.primary.main, 0.16)
                          : alpha(theme.palette.text.primary, 0.04)
                      }
                    }}
                  >
                    {/* Line 1: Bold URL Path */}
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: 700,
                        fontFamily: "'Fira Code', monospace",
                        fontSize: '0.78rem',
                        color: theme.palette.text.primary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {tx.request?.urlPath || '/'}
                    </Typography>

                    {/* Line 2: Method + Status + Relative Time */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        {/* Micro Method Tag */}
                        <Box
                          sx={{
                            px: 0.5,
                            py: 0.05,
                            borderRadius: 0.6,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            backgroundColor: methodCfg.bg,
                            color: methodCfg.text,
                            textTransform: 'uppercase',
                            fontFamily: "'Fira Code', monospace",
                            lineHeight: 1.3
                          }}
                        >
                          {tx.request?.method}
                        </Box>

                        {/* Status Code with Checkmark */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <Typography
                            sx={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              fontFamily: "'Fira Code', monospace",
                              color: statusColor
                            }}
                          >
                            {statusCode}
                          </Typography>
                          {is2xx && (
                            <CheckRoundedIcon sx={{ fontSize: 13, color: '#10b981', strokeWidth: 2 }} />
                          )}
                        </Box>
                      </Box>

                      {/* Time */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: '0.66rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {formatRelativeTime(tx.timestampMs, locale)}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>

      {/* Right Column: Request / Response Inspector (Original Mockoon Layout) */}
      {activeTx ? (
        <Box
          className="selectable"
          sx={{
            flex: 1,
            height: '100%',
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            userSelect: 'text',
            '& *': { userSelect: 'text' }
          }}
        >
          {/* Top Tabs: Request ↙ & Response ↗ */}
          <Box
            sx={{
              height: 38,
              minHeight: 38,
              flexShrink: 0,
              borderBottom: `1px solid ${theme.palette.divider}`,
              px: 2,
              backgroundColor:
                theme.palette.mode === 'light'
                  ? alpha(theme.palette.background.paper, 0.8)
                  : alpha(theme.palette.background.default, 0.8),
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              sx={{
                minHeight: 38,
                '& .MuiTab-root': {
                  minHeight: 38,
                  py: 0,
                  px: 2,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'none'
                }
              }}
            >
              <Tab
                value="request"
                icon={<SouthWestRoundedIcon sx={{ fontSize: 14 }} />}
                iconPosition="end"
                label={locale === 'zh-CN' ? '请求详情 (Request)' : 'Request'}
              />
              <Tab
                value="response"
                icon={<ArrowOutwardRoundedIcon sx={{ fontSize: 14 }} />}
                iconPosition="end"
                label={locale === 'zh-CN' ? '响应详情 (Response)' : 'Response'}
              />
            </Tabs>
          </Box>

          {/* Inspector Content */}
          <Box
            className="selectable"
            sx={{
              flex: 1,
              minHeight: 0,
              p: 2,
              pb: 4,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              userSelect: 'text',
              '& *': { userSelect: 'text' }
            }}
          >
            {activeTab === 'request' ? (
              // ==================== REQUEST TAB ====================
              <>
                {/* 1. General Info Accordion */}
                <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'visible', flexShrink: 0 }}>
                  <Box
                    onClick={() => setOpenReqGeneral(!openReqGeneral)}
                    sx={{
                      px: 1.5,
                      py: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      backgroundColor: alpha(theme.palette.text.primary, 0.02),
                      '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.05) }
                    }}
                  >
                    {openReqGeneral ? (
                      <ExpandMoreRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                    ) : (
                      <ChevronRightRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>
                      General
                    </Typography>
                  </Box>

                  <Collapse in={openReqGeneral} timeout="auto" unmountOnExit={false}>
                    <Divider />
                    <Box sx={{ p: 1.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                      {/* Request URL */}
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.2 }}>
                        <Typography sx={{ width: 140, fontWeight: 700, fontSize: '0.76rem', color: theme.palette.text.secondary, flexShrink: 0 }}>
                          Request URL:
                        </Typography>
                        <Typography sx={{ fontFamily: "'Fira Code', monospace", fontSize: '0.76rem', fontWeight: 600, wordBreak: 'break-all' }}>
                          {activeTx.request?.urlPath || '/'}
                          {activeTx.request?.query ? `?${activeTx.request.query}` : ''}
                        </Typography>
                      </Box>

                      {/* Method */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Typography sx={{ width: 140, fontWeight: 700, fontSize: '0.76rem', color: theme.palette.text.secondary, flexShrink: 0 }}>
                          Method:
                        </Typography>
                        <Box
                          sx={{
                            px: 0.7,
                            py: 0.1,
                            borderRadius: 0.8,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            backgroundColor: (METHOD_COLORS[(activeTx.request?.method || 'get').toLowerCase()] || METHOD_COLORS.get).bg,
                            color: '#ffffff',
                            textTransform: 'uppercase',
                            fontFamily: "'Fira Code', monospace"
                          }}
                        >
                          {activeTx.request?.method}
                        </Box>
                      </Box>

                      {/* Caught by route */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                        <Typography sx={{ width: 140, fontWeight: 700, fontSize: '0.76rem', color: theme.palette.text.secondary, flexShrink: 0, pt: 0.2 }}>
                          Caught by route:
                        </Typography>
                        {matchedRouteInfo ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontFamily: "'Fira Code', monospace",
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                color: theme.palette.primary.main,
                                wordBreak: 'break-all'
                              }}
                            >
                              /{matchedRouteInfo.route.endpoint} - {matchedRouteInfo.response?.label || `Response ${matchedRouteInfo.respIdx}`} ({matchedRouteInfo.response?.statusCode || 200})
                            </Typography>
                            <Tooltip title="在接口编辑器中定位 (Jump to route)" arrow>
                              <IconButton
                                size="small"
                                onClick={handleJumpToRoute}
                                sx={{
                                  p: 0.2,
                                  color: theme.palette.primary.main,
                                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                                }}
                              >
                                <OpenInNewRoundedIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: '0.76rem', color: theme.palette.text.disabled, fontStyle: 'italic', pt: 0.2 }}>
                            None (404 Not Found)
                          </Typography>
                        )}
                      </Box>

                      {/* Proxied */}
                      {activeTx.proxied && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Typography sx={{ width: 140, fontWeight: 700, fontSize: '0.76rem', color: theme.palette.text.secondary, flexShrink: 0 }}>
                            Proxied:
                          </Typography>
                          <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#3b82f6' }}>
                            Yes
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Paper>

                {/* 2. Headers (N) Accordion */}
                <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'visible', flexShrink: 0 }}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      backgroundColor: alpha(theme.palette.text.primary, 0.02)
                    }}
                  >
                    <Box
                      onClick={() => setOpenReqHeaders(!openReqHeaders)}
                      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}
                    >
                      {openReqHeaders ? (
                        <ExpandMoreRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      ) : (
                        <ChevronRightRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      )}
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>
                        Headers ({activeTx.request?.headers?.length || 0})
                      </Typography>
                    </Box>

                    <Tooltip title="复制全部 Headers" arrow>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(formatHeadersText(activeTx.request?.headers || []))}
                        sx={{ p: 0.3 }}
                      >
                        <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Collapse in={openReqHeaders} timeout="auto" unmountOnExit={false}>
                    <Divider />
                    <Box sx={{ p: 1.5 }}>
                      {activeTx.request?.headers && activeTx.request.headers.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                          {activeTx.request.headers.map((h, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'baseline', gap: 1, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace" }}>
                              <Typography component="span" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace" }}>
                                {h.key}:
                              </Typography>
                              <Typography component="span" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace", wordBreak: 'break-all' }}>
                                {h.value}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography sx={{ color: theme.palette.text.disabled, fontSize: '0.74rem', fontStyle: 'italic' }}>
                          (No headers)
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Paper>

                {/* 3. Route params (If any) */}
                {activeTx.request?.params && activeTx.request.params.length > 0 && (
                  <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'visible', flexShrink: 0 }}>
                    <Box
                      onClick={() => setOpenReqParams(!openReqParams)}
                      sx={{
                        px: 1.5,
                        py: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                        backgroundColor: alpha(theme.palette.text.primary, 0.02)
                      }}
                    >
                      {openReqParams ? (
                        <ExpandMoreRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      ) : (
                        <ChevronRightRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      )}
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>
                        Route params ({activeTx.request.params.length})
                      </Typography>
                    </Box>

                    <Collapse in={openReqParams} timeout="auto" unmountOnExit={false}>
                      <Divider />
                      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                        {activeTx.request.params.map((p, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'baseline', gap: 1, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace" }}>
                            <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace" }}>
                              {p.name}:
                            </Typography>
                            <Typography component="span" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace" }}>
                              {p.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Collapse>
                  </Paper>
                )}

                {/* 4. Query params (If any) */}
                {activeTx.request?.queryParams && Object.keys(activeTx.request.queryParams).length > 0 && (
                  <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'visible', flexShrink: 0 }}>
                    <Box
                      onClick={() => setOpenReqQuery(!openReqQuery)}
                      sx={{
                        px: 1.5,
                        py: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                        backgroundColor: alpha(theme.palette.text.primary, 0.02)
                      }}
                    >
                      {openReqQuery ? (
                        <ExpandMoreRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      ) : (
                        <ChevronRightRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      )}
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>
                        Query params ({Object.keys(activeTx.request.queryParams).length})
                      </Typography>
                    </Box>

                    <Collapse in={openReqQuery} timeout="auto" unmountOnExit={false}>
                      <Divider />
                      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                        {Object.entries(activeTx.request.queryParams).map(([key, value], i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'baseline', gap: 1, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace" }}>
                            <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace" }}>
                              {key}:
                            </Typography>
                            <Typography component="span" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace" }}>
                              {String(value)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Collapse>
                  </Paper>
                )}

                {/* 5. Request Body Accordion */}
                <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'visible', flexShrink: 0 }}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      backgroundColor: alpha(theme.palette.text.primary, 0.02)
                    }}
                  >
                    <Box
                      onClick={() => setOpenReqBody(!openReqBody)}
                      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}
                    >
                      {openReqBody ? (
                        <ExpandMoreRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      ) : (
                        <ChevronRightRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      )}
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>
                        Body
                      </Typography>
                    </Box>

                    {activeTx.request?.body && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <Tooltip title="格式化 JSON" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              try {
                                const parsed = typeof activeTx.request.body === 'string'
                                  ? JSON.parse(activeTx.request.body)
                                  : activeTx.request.body;
                                activeTx.request.body = JSON.stringify(parsed, null, 2);
                                setCopiedSnackbar(true);
                              } catch (e) {}
                            }}
                            sx={{ p: 0.3 }}
                          >
                            <AutoFixHighRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="复制 Body" arrow>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(formatBodyContent(activeTx.request.body))}
                            sx={{ p: 0.3 }}
                          >
                            <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>

                  <Collapse in={openReqBody} timeout="auto" unmountOnExit={false}>
                    <Divider />
                    <Box sx={{ p: 1.5, pb: 2, overflowX: 'auto' }}>
                      {activeTx.request?.body ? (
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            fontFamily: "'Fira Code', monospace",
                            fontSize: '0.76rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            color: theme.palette.text.primary
                          }}
                        >
                          {formatBodyContent(activeTx.request.body)}
                        </Box>
                      ) : (
                        <Typography sx={{ color: theme.palette.text.disabled, fontSize: '0.74rem', fontStyle: 'italic' }}>
                          (No body)
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Paper>

                {/* Bottom trailing spacer */}
                <Box sx={{ height: 48, flexShrink: 0 }} />
              </>
            ) : (
              // ==================== RESPONSE TAB ====================
              <>
                {/* 1. Response General Info */}
                <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'visible' }}>
                  <Box
                    onClick={() => setOpenResGeneral(!openResGeneral)}
                    sx={{
                      px: 1.5,
                      py: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      backgroundColor: alpha(theme.palette.text.primary, 0.02),
                      '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.05) }
                    }}
                  >
                    {openResGeneral ? (
                      <ExpandMoreRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                    ) : (
                      <ChevronRightRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>
                      General
                    </Typography>
                  </Box>

                  <Collapse in={openResGeneral} timeout="auto" unmountOnExit={false}>
                    <Divider />
                    <Box sx={{ p: 1.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                      {/* Status Code with Message */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Typography sx={{ width: 140, fontWeight: 700, fontSize: '0.76rem', color: theme.palette.text.secondary, flexShrink: 0 }}>
                          Status:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Box
                            sx={{
                              px: 0.8,
                              py: 0.15,
                              borderRadius: 0.8,
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              backgroundColor: (activeTx.response?.statusCode || 200) < 400
                                ? alpha('#10b981', 0.15)
                                : alpha('#ef4444', 0.15),
                              color: (activeTx.response?.statusCode || 200) < 400
                                ? '#10b981'
                                : '#ef4444',
                              fontFamily: "'Fira Code', monospace"
                            }}
                          >
                            {activeTx.response?.statusCode || 200}
                            {activeTx.response?.statusMessage ? ` - ${activeTx.response.statusMessage}` : ''}
                          </Box>
                        </Box>
                      </Box>

                      {/* Served by route */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                        <Typography sx={{ width: 140, fontWeight: 700, fontSize: '0.76rem', color: theme.palette.text.secondary, flexShrink: 0, pt: 0.2 }}>
                          Served by route:
                        </Typography>
                        {matchedRouteInfo ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontFamily: "'Fira Code', monospace",
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                color: theme.palette.primary.main,
                                wordBreak: 'break-all'
                              }}
                            >
                              /{matchedRouteInfo.route.endpoint} - {matchedRouteInfo.response?.label || `Response ${matchedRouteInfo.respIdx}`} ({matchedRouteInfo.response?.statusCode || 200})
                            </Typography>
                            <Tooltip title="在接口编辑器中定位 (Jump to route)" arrow>
                              <IconButton
                                size="small"
                                onClick={handleJumpToRoute}
                                sx={{
                                  p: 0.2,
                                  color: theme.palette.primary.main,
                                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                                }}
                              >
                                <OpenInNewRoundedIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: '0.76rem', color: theme.palette.text.disabled, fontStyle: 'italic', pt: 0.2 }}>
                            None (404 Not Found)
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>

                {/* 2. Response Headers (N) Accordion */}
                <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'visible', flexShrink: 0 }}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      backgroundColor: alpha(theme.palette.text.primary, 0.02)
                    }}
                  >
                    <Box
                      onClick={() => setOpenResHeaders(!openResHeaders)}
                      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}
                    >
                      {openResHeaders ? (
                        <ExpandMoreRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      ) : (
                        <ChevronRightRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      )}
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>
                        Headers ({activeTx.response?.headers?.length || 0})
                      </Typography>
                    </Box>

                    <Tooltip title="复制全部 Headers" arrow>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(formatHeadersText(activeTx.response?.headers || []))}
                        sx={{ p: 0.3 }}
                      >
                        <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Collapse in={openResHeaders} timeout="auto" unmountOnExit={false}>
                    <Divider />
                    <Box sx={{ p: 1.5 }}>
                      {activeTx.response?.headers && activeTx.response.headers.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                          {activeTx.response.headers.map((h, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'baseline', gap: 1, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace" }}>
                              <Typography component="span" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace" }}>
                                {h.key}:
                              </Typography>
                              <Typography component="span" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem', fontFamily: "'Fira Code', monospace", wordBreak: 'break-all' }}>
                                {h.value}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography sx={{ color: theme.palette.text.disabled, fontSize: '0.74rem', fontStyle: 'italic' }}>
                          (No headers)
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Paper>

                {/* 3. Response Body Accordion */}
                <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'visible', flexShrink: 0 }}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      backgroundColor: alpha(theme.palette.text.primary, 0.02)
                    }}
                  >
                    <Box
                      onClick={() => setOpenResBody(!openResBody)}
                      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}
                    >
                      {openResBody ? (
                        <ExpandMoreRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      ) : (
                        <ChevronRightRoundedIcon sx={{ fontSize: 16, mr: 0.6, color: theme.palette.text.secondary }} />
                      )}
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>
                        Body
                      </Typography>
                    </Box>

                    {activeTx.response?.body && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <Tooltip title="格式化 JSON" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              try {
                                const parsed = JSON.parse(activeTx.response.body);
                                activeTx.response.body = JSON.stringify(parsed, null, 2);
                                setCopiedSnackbar(true);
                              } catch (e) {}
                            }}
                            sx={{ p: 0.3 }}
                          >
                            <AutoFixHighRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="复制 Body" arrow>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(formatBodyContent(activeTx.response.body))}
                            sx={{ p: 0.3 }}
                          >
                            <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>

                  <Collapse in={openResBody} timeout="auto" unmountOnExit={false}>
                    <Divider />
                    <Box sx={{ p: 1.5, pb: 2, overflowX: 'auto' }}>
                      {activeTx.response?.body ? (
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            fontFamily: "'Fira Code', monospace",
                            fontSize: '0.76rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            color: theme.palette.text.primary
                          }}
                        >
                          {formatBodyContent(activeTx.response.body)}
                        </Box>
                      ) : (
                        <Typography sx={{ color: theme.palette.text.disabled, fontSize: '0.74rem', fontStyle: 'italic' }}>
                          (No body)
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Paper>

                {/* Bottom trailing spacer */}
                <Box sx={{ height: 48, flexShrink: 0 }} />
              </>
            )}
          </Box>

          {/* Copy Toast */}
          <Snackbar
            open={copiedSnackbar}
            autoHideDuration={2000}
            onClose={() => setCopiedSnackbar(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="success" sx={{ width: '100%', py: 0.5, fontSize: '0.8rem' }}>
              {t.common.copied || '已复制到剪贴板'}
            </Alert>
          </Snackbar>
        </Box>
      ) : null}
    </Box>
  );
};
