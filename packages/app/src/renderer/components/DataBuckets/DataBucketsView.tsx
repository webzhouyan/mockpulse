import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  Alert,
  alpha,
  useTheme
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { DataBucket } from '@mockoon/commons';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';
import { apiService } from '../../services/api.service';

export const DataBucketsView: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const { activeEnvironment, updateActiveEnvironment, layoutDensity } = useApp();

  const isCompact = layoutDensity === 'compact';
  const [copyFeedback, setCopyFeedback] = useState(false);

  const dataBuckets = activeEnvironment?.data || [];
  const [selectedId, setSelectedId] = useState<string | null>(dataBuckets[0]?.id || null);

  const activeBucket = dataBuckets.find((d) => d.id === selectedId) || dataBuckets[0] || null;

  // Ensure all data buckets have a valid uuid
  React.useEffect(() => {
    if (activeEnvironment?.data?.some((d) => !d.uuid)) {
      updateActiveEnvironment((env) => ({
        ...env,
        data: (env.data || []).map((d) => ({
          ...d,
          uuid: d.uuid || 'db_' + Math.random().toString(36).substring(2, 10)
        }))
      }));
    }
  }, [activeEnvironment?.data]);

  const handleAddBucket = () => {
    const uniqueUuid = 'db_' + Math.random().toString(36).substring(2, 10);
    const newBucket: DataBucket = {
      uuid: uniqueUuid,
      id: 'bucket_' + Math.random().toString(36).substring(2, 8),
      name: `Data Bucket ${dataBuckets.length + 1}`,
      documentation: '',
      value: '[\n  {{#repeat 10}}\n  {\n    "id": "{{@index}}",\n    "name": "{{faker \'person.fullName\'}}"\n  }\n  {{/repeat}}\n]'
    };

    updateActiveEnvironment((env) => ({
      ...env,
      data: [...(env.data || []), newBucket]
    }));
    setSelectedId(newBucket.id);
  };

  const handleDeleteBucket = (id: string) => {
    updateActiveEnvironment((env) => ({
      ...env,
      data: (env.data || []).filter((d) => d.id !== id)
    }));
    if (selectedId === id) setSelectedId(null);
  };

  const updateActive = (updater: (prev: DataBucket) => DataBucket) => {
    if (!activeBucket) return;
    updateActiveEnvironment((env) => ({
      ...env,
      data: (env.data || []).map((d) => (d.id === activeBucket.id ? updater(d) : d))
    }));
  };

  const handleFormat = () => {
    if (!activeBucket || !activeBucket.value) return;
    try {
      const parsed = JSON.parse(activeBucket.value);
      updateActive((b) => ({ ...b, value: JSON.stringify(parsed, null, 2) }));
    } catch (e) {
      // not JSON or contains template tags, keep as is
    }
  };

  const handleCopy = () => {
    if (!activeBucket) return;
    apiService.writeClipboard(activeBucket.value || '');
    setCopyFeedback(true);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Bucket List (Left, resizable) */}
      <Box
        sx={{
          width: 250,
          minWidth: 250,
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
            p: isCompact ? 1 : 1.5,
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
            {t.dataBuckets.title} ({dataBuckets.length})
          </Typography>

          <Tooltip title={t.dataBuckets.addBucket} arrow>
            <IconButton
              size="small"
              onClick={handleAddBucket}
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
            {dataBuckets.map((bucket) => {
              const isSelected = activeBucket?.id === bucket.id;
              return (
                <ListItem
                  key={bucket.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBucket(bucket.id);
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
                    onClick={() => setSelectedId(bucket.id)}
                    sx={{
                      borderRadius: 1.5,
                      py: isCompact ? 0.6 : 0.9,
                      px: isCompact ? 1 : 1.2,
                      pr: 4.5
                    }}
                  >
                    <StorageRoundedIcon sx={{ fontSize: 16, mr: 1.2, color: theme.palette.primary.main, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <Tooltip title={bucket.name} arrow enterDelay={500}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: isCompact ? '0.78rem' : '0.85rem'
                          }}
                        >
                          {bucket.name}
                        </Typography>
                      </Tooltip>
                      <Tooltip title={bucket.id} arrow enterDelay={500}>
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            display: 'block',
                            fontSize: '0.68rem',
                            color: theme.palette.text.secondary,
                            fontFamily: "'Fira Code', monospace"
                          }}
                        >
                          {bucket.id}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>

      {/* Bucket Editor (Right) */}
      {activeBucket ? (
        <Box sx={{ flex: 1, p: isCompact ? 2 : 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto' }}>
          {/* Row 1: Name and ID inputs perfectly aligned */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              size="small"
              label={t.dataBuckets.bucketName}
              value={activeBucket.name}
              onChange={(e) => updateActive((b) => ({ ...b, name: e.target.value }))}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="ID"
              disabled
              value={activeBucket.id}
              sx={{ width: 160, '& input': { fontFamily: "'Fira Code', monospace", fontSize: '0.8rem' } }}
            />
          </Box>

          {/* Subtitle & Format/Copy Toolbar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem' }}>
              {t.dataBuckets.subtitle}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AutoFixHighRoundedIcon sx={{ fontSize: 15 }} />}
                onClick={handleFormat}
                sx={{ fontSize: '0.75rem', py: 0.2 }}
              >
                {t.routes.formatJson || '格式化'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                onClick={handleCopy}
                sx={{ fontSize: '0.75rem', py: 0.2 }}
              >
                {t.common.copy || '复制'}
              </Button>
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={14}
            maxRows={30}
            label={t.dataBuckets.bucketValue}
            value={activeBucket.value}
            onChange={(e) => updateActive((b) => ({ ...b, value: e.target.value }))}
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
            {t.dataBuckets.noBuckets}
          </Typography>
        </Box>
      )}

      {/* Copy Feedback */}
      <Snackbar
        open={copyFeedback}
        autoHideDuration={2000}
        onClose={() => setCopyFeedback(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', py: 0.5, px: 2, fontSize: '0.85rem' }}>
          {t.common.copied || '已复制到剪贴板'}
        </Alert>
      </Snackbar>
    </Box>
  );
};
