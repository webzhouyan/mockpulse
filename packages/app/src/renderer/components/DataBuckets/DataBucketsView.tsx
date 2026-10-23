import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  alpha,
  useTheme
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { DataBucket } from '@mockoon/commons';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';

export const DataBucketsView: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const { activeEnvironment, updateActiveEnvironment, layoutDensity } = useApp();

  const isCompact = layoutDensity === 'compact';
  const dataBuckets = activeEnvironment?.data || [];
  const [selectedId, setSelectedId] = useState<string | null>(dataBuckets[0]?.id || null);

  const activeBucket = dataBuckets.find((d) => d.id === selectedId) || dataBuckets[0] || null;

  const handleAddBucket = () => {
    const newBucket: DataBucket = {
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

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Bucket List (Left) */}
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
        {/* Header with optimized, non-wrapping compact Add Button */}
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
                      px: isCompact ? 1 : 1.2
                    }}
                  >
                    <StorageRoundedIcon sx={{ fontSize: 16, mr: 1.2, color: theme.palette.primary.main }} />
                    <ListItemText
                      primary={bucket.name}
                      secondary={bucket.id}
                      primaryTypographyProps={{
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: isCompact ? '0.78rem' : '0.85rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      secondaryTypographyProps={{
                        fontSize: '0.68rem',
                        fontFamily: "'Fira Code', monospace"
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>

      {/* Bucket Editor (Right) */}
      {activeBucket ? (
        <Box sx={{ flex: 1, p: isCompact ? 2 : 3, display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
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

          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem' }}>
            {t.dataBuckets.subtitle}
          </Typography>

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
    </Box>
  );
};
