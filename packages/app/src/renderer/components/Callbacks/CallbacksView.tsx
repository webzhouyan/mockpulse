import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Snackbar,
  Alert,
  alpha,
  useTheme
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { Callback } from '@mockoon/commons';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';
import { Resizer } from '../Common/Resizer';

const HTTP_METHODS = ['post', 'get', 'put', 'patch', 'delete', 'head', 'options'];

const METHOD_COLORS: Record<string, string> = {
  get: '#10b981',
  post: '#3b82f6',
  put: '#f59e0b',
  patch: '#8b5cf6',
  delete: '#ef4444',
  head: '#06b6d4',
  options: '#64748b'
};

export const CallbacksView: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const { activeEnvironment, updateActiveEnvironment, layoutDensity } = useApp();

  const isCompact = layoutDensity === 'compact';
  const [leftWidth, setLeftWidth] = useState<number>(isCompact ? 260 : 300);
  const [copiedSnackbar, setCopiedSnackbar] = useState(false);

  const callbacks = activeEnvironment?.callbacks || [];
  const [selectedId, setSelectedId] = useState<string | null>(callbacks[0]?.id || null);

  const activeCallback = callbacks.find((c) => c.id === selectedId) || callbacks[0] || null;

  const handleAddCallback = () => {
    const newCallback: Callback = {
      id: 'cb_' + Math.random().toString(36).substring(2, 8),
      name: `Webhook ${callbacks.length + 1}`,
      documentation: '',
      method: 'post',
      uri: 'https://example.com/webhook',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      body: '{\n  "event": "mock_response_sent",\n  "timestamp": "{{now}}"\n}',
      bodyType: 'INLINE',
      filePath: '',
      databucketID: '',
      sendFileAsBody: false
    };

    updateActiveEnvironment((env) => ({
      ...env,
      callbacks: [...(env.callbacks || []), newCallback]
    }));
    setSelectedId(newCallback.id);
  };

  const handleDeleteCallback = (id: string) => {
    updateActiveEnvironment((env) => ({
      ...env,
      callbacks: (env.callbacks || []).filter((c) => c.id !== id)
    }));
    if (selectedId === id) setSelectedId(null);
  };

  const updateActive = (updater: (prev: Callback) => Callback) => {
    if (!activeCallback) return;
    updateActiveEnvironment((env) => ({
      ...env,
      callbacks: (env.callbacks || []).map((c) => (c.id === activeCallback.id ? updater(c) : c))
    }));
  };

  const handleFormatJson = () => {
    if (!activeCallback || !activeCallback.body) return;
    try {
      const parsed = JSON.parse(activeCallback.body);
      updateActive((c) => ({ ...c, body: JSON.stringify(parsed, null, 2) }));
    } catch (e) {
      // Ignored if not valid JSON
    }
  };

  const handleCopyBody = () => {
    if (!activeCallback || !activeCallback.body) return;
    navigator.clipboard.writeText(activeCallback.body);
    setCopiedSnackbar(true);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Callback List (Left) */}
      <Box
        sx={{
          width: leftWidth,
          minWidth: 200,
          maxWidth: 520,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.background.paper, 0.4)
              : alpha(theme.palette.background.default, 0.5),
          position: 'relative'
        }}
      >
        <Box
          sx={{
            p: isCompact ? 1.2 : 1.8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              fontSize: isCompact ? '0.78rem' : '0.85rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mr: 1
            }}
          >
            {t.callbacks.title} ({callbacks.length})
          </Typography>

          <Tooltip title={t.callbacks.addCallback} arrow>
            <IconButton
              size="small"
              onClick={handleAddCallback}
              sx={{
                width: 28,
                height: 28,
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

        <Box sx={{ flex: 1, overflowY: 'auto', px: 0.8, py: 0.5 }}>
          <List sx={{ p: 0 }}>
            {callbacks.map((cb) => {
              const isSelected = activeCallback?.id === cb.id;
              const methodColor = METHOD_COLORS[cb.method.toLowerCase()] || '#64748b';

              return (
                <ListItem
                  key={cb.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCallback(cb.id);
                      }}
                      sx={{ opacity: isSelected ? 1 : 0.3, '&:hover': { opacity: 1, color: theme.palette.error.main } }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{ mb: 0.4 }}
                >
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => setSelectedId(cb.id)}
                    sx={{
                      borderRadius: 1.5,
                      py: isCompact ? 0.6 : 0.9,
                      px: isCompact ? 1 : 1.2,
                      gap: 1
                    }}
                  >
                    <Box
                      sx={{
                        px: 0.6,
                        py: 0.15,
                        borderRadius: 0.8,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        backgroundColor: alpha(methodColor, 0.15),
                        color: methodColor,
                        textTransform: 'uppercase',
                        fontFamily: "'Fira Code', monospace",
                        flexShrink: 0
                      }}
                    >
                      {cb.method}
                    </Box>
                    <ListItemText
                      primary={cb.name}
                      secondary={cb.uri}
                      primaryTypographyProps={{
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: isCompact ? '0.78rem' : '0.85rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      secondaryTypographyProps={{
                        fontSize: '0.68rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: "'Fira Code', monospace"
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Resizer */}
        <Box sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4 }}>
          <Resizer width={leftWidth} onResize={setLeftWidth} minWidth={200} maxWidth={520} />
        </Box>
      </Box>

      {/* Callback Editor (Right) */}
      {activeCallback ? (
        <Box sx={{ flex: 1, p: isCompact ? 2 : 3, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {/* Row 1: Callback Name & Documentation */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              size="small"
              label={t.callbacks.callbackName}
              value={activeCallback.name}
              onChange={(e) => updateActive((c) => ({ ...c, name: e.target.value }))}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label={t.callbacks.documentation}
              placeholder="Webhook 说明"
              value={activeCallback.documentation || ''}
              onChange={(e) => updateActive((c) => ({ ...c, documentation: e.target.value }))}
              sx={{ flex: 1.5 }}
            />
          </Box>

          {/* Row 2: Method Selector & URL Input (aligned perfectly) */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <FormControl size="small" sx={{ width: 130, flexShrink: 0 }}>
              <InputLabel id="callback-method-label">{t.callbacks.callbackMethod}</InputLabel>
              <Select
                labelId="callback-method-label"
                id="callback-method-select"
                value={activeCallback.method}
                label={t.callbacks.callbackMethod}
                onChange={(e) => updateActive((c) => ({ ...c, method: e.target.value as any }))}
                renderValue={(val) => {
                  const color = METHOD_COLORS[val.toLowerCase()] || '#64748b';
                  return (
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 0.8,
                        py: 0.1,
                        borderRadius: 1,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: alpha(color, 0.15),
                        color: color,
                        textTransform: 'uppercase',
                        fontFamily: "'Fira Code', monospace"
                      }}
                    >
                      {val}
                    </Box>
                  );
                }}
              >
                {HTTP_METHODS.map((m) => {
                  const color = METHOD_COLORS[m.toLowerCase()] || '#64748b';
                  return (
                    <MenuItem key={m} value={m}>
                      <Box
                        sx={{
                          px: 0.8,
                          py: 0.2,
                          borderRadius: 1,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: alpha(color, 0.15),
                          color: color,
                          textTransform: 'uppercase',
                          fontFamily: "'Fira Code', monospace"
                        }}
                      >
                        {m}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label={t.callbacks.callbackUrl}
              placeholder="https://example.com/webhook"
              value={activeCallback.uri}
              onChange={(e) => updateActive((c) => ({ ...c, uri: e.target.value }))}
              InputProps={{
                sx: { fontFamily: "'Fira Code', monospace", fontSize: '0.85rem' }
              }}
            />
          </Box>

          {/* Row 3: Body Header with Format & Copy tools */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t.callbacks.callbackBody}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CodeRoundedIcon />}
                onClick={handleFormatJson}
                sx={{ textTransform: 'none', py: 0.2, px: 1, fontSize: '0.75rem' }}
              >
                {t.callbacks.formatJson}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyRoundedIcon />}
                onClick={handleCopyBody}
                sx={{ textTransform: 'none', py: 0.2, px: 1, fontSize: '0.75rem' }}
              >
                {t.callbacks.copy}
              </Button>
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={12}
            maxRows={24}
            value={activeCallback.body}
            onChange={(e) => updateActive((c) => ({ ...c, body: e.target.value }))}
            sx={{
              '& textarea': {
                fontFamily: "'Fira Code', monospace",
                fontSize: '0.82rem',
                lineHeight: 1.45
              }
            }}
          />

          <Snackbar
            open={copiedSnackbar}
            autoHideDuration={2000}
            onClose={() => setCopiedSnackbar(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="success" sx={{ width: '100%', py: 0.5, fontSize: '0.8rem' }}>
              {t.callbacks.copied}
            </Alert>
          </Snackbar>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {t.callbacks.noCallbacks}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
