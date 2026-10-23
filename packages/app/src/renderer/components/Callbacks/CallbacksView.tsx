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
  alpha,
  useTheme
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import { Callback } from '@mockoon/commons';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

export const CallbacksView: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const { activeEnvironment, updateActiveEnvironment, layoutDensity } = useApp();

  const isCompact = layoutDensity === 'compact';
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

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Callback List (Left) */}
      <Box
        sx={{
          width: isCompact ? 260 : 300,
          minWidth: isCompact ? 260 : 300,
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
                      px: isCompact ? 1 : 1.2
                    }}
                  >
                    <CallSplitRoundedIcon sx={{ fontSize: 16, mr: 1.2, color: theme.palette.secondary.main }} />
                    <ListItemText
                      primary={cb.name}
                      secondary={`${cb.method.toUpperCase()} ${cb.uri}`}
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
                        whiteSpace: 'nowrap'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>

      {/* Callback Editor (Right) */}
      {activeCallback ? (
        <Box sx={{ flex: 1, p: isCompact ? 2 : 3, display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              size="small"
              label={t.callbacks.callbackName}
              value={activeCallback.name}
              onChange={(e) => updateActive((c) => ({ ...c, name: e.target.value }))}
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ width: 120 }}>
              <InputLabel>{t.callbacks.callbackMethod}</InputLabel>
              <Select
                value={activeCallback.method}
                label={t.callbacks.callbackMethod}
                onChange={(e) => updateActive((c) => ({ ...c, method: e.target.value as any }))}
              >
                {HTTP_METHODS.map((m) => (
                  <MenuItem key={m} value={m} sx={{ textTransform: 'uppercase' }}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            size="small"
            label={t.callbacks.callbackUrl}
            value={activeCallback.uri}
            onChange={(e) => updateActive((c) => ({ ...c, uri: e.target.value }))}
          />

          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem' }}>
            {t.callbacks.subtitle}
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={12}
            maxRows={24}
            label={t.callbacks.callbackBody}
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
