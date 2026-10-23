import React, { useState, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useApp } from '../../store/AppContext';
import { useI18n } from '../../i18n';
import { apiService } from '../../services/api.service';

interface OpenApiImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export const OpenApiImportDialog: React.FC<OpenApiImportDialogProps> = ({
  open,
  onClose
}) => {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const { importEnvironmentFromOpenApiContent } = useApp();

  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Line count for the editor gutter
  const lineCount = useMemo(() => {
    if (!content) return 1;
    return content.split('\n').length;
  }, [content]);

  const lines = useMemo(() => {
    return Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);
  }, [lineCount]);

  // Sync scroll
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleBrowseFile = async () => {
    setError(null);
    try {
      const res = await apiService.showOpenDialog({
        title: 'Open OpenAPI / Swagger File',
        filters: [
          { name: 'OpenAPI / Swagger (*.json, *.yaml, *.yml)', extensions: ['json', 'yaml', 'yml'] },
          { name: 'All Files (*.*)', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (!res.canceled && res.filePaths?.[0]) {
        const filePath = res.filePaths[0];
        const fileText = await apiService.readFile(filePath);
        if (fileText) {
          setContent(fileText);
          setUrl(''); // Clear URL since user browsed a file
        }
      }
    } catch (err: any) {
      setError(err?.message || '读取本地规范文件失败');
    }
  };

  const handleImport = async () => {
    setError(null);
    setLoading(true);

    try {
      let specToImport = content.trim();

      // If URL is provided and content is empty (or user entered a URL), fetch it
      if (url.trim() && !specToImport) {
        specToImport = await apiService.fetchUrl(url.trim());
      }

      if (!specToImport) {
        throw new Error(
          locale === 'zh-CN'
            ? '请先输入规范 URL、浏览选择文件，或者在编辑框中粘贴规范内容'
            : 'Please enter a spec URL, browse a file, or paste specification content.'
        );
      }

      await importEnvironmentFromOpenApiContent(specToImport, url.trim() || undefined);
      // Reset state and close
      setUrl('');
      setContent('');
      setError(null);
      onClose();
    } catch (err: any) {
      console.error('OpenAPI import error:', err);
      setError(err?.message || '导入 OpenAPI / Swagger 规范失败，请检查格式是否有效。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          backgroundColor:
            theme.palette.mode === 'light' ? '#ffffff' : '#1e2430',
          backgroundImage: 'none',
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
          border: `1px solid ${theme.palette.divider}`
        }
      }}
    >
      {/* Title & Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          pb: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>
            {locale === 'zh-CN' ? '导入 OpenAPI / Swagger 规范' : 'OpenAPI specification import'}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5, fontSize: '0.82rem' }}>
            {locale === 'zh-CN'
              ? '支持从 URL 地址、本地文件或直接粘贴 OpenAPI v2 / v3 (JSON / YAML) 内容导入。'
              : 'Import an OpenAPI v2 or v3 specification from a URL, a file or by pasting its content.'}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': { color: theme.palette.text.primary }
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, py: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ fontSize: '0.8rem' }}>
            {error}
          </Alert>
        )}

        {/* Row 1: URL input + OR + Browse button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              letterSpacing: '0.04em'
            }}
          >
            URL
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder={
              locale === 'zh-CN'
                ? '输入或粘贴 OpenAPI 规范 URL 地址'
                : 'Paste the OpenAPI spec URL'
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            InputProps={{
              sx: {
                height: 34,
                fontSize: '0.82rem',
                fontFamily: "'Fira Code', monospace",
                borderRadius: 1.5,
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? alpha(theme.palette.text.primary, 0.02)
                    : alpha('#ffffff', 0.04)
              }
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: theme.palette.text.disabled,
              fontSize: '0.75rem',
              flexShrink: 0
            }}
          >
            OR
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SearchRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleBrowseFile}
            sx={{
              height: 34,
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
            {locale === 'zh-CN' ? '浏览选择' : 'Browse'}
          </Button>
        </Box>

        {/* Row 2: Paste content prompt & Editor */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: theme.palette.text.secondary }}>
            {locale === 'zh-CN'
              ? '或者在下方直接粘贴 OpenAPI / Swagger 规范内容 (JSON 或 YAML)：'
              : 'Or paste the OpenAPI specification content below:'}
          </Typography>

          {/* Code Editor Container */}
          <Box
            sx={{
              height: 320,
              display: 'flex',
              borderRadius: 1.5,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor:
                theme.palette.mode === 'light' ? '#ffffff' : '#141824',
              '&:focus-within': {
                borderColor: theme.palette.primary.main
              }
            }}
          >
            {/* Gutter Line Numbers */}
            <Box
              ref={gutterRef}
              sx={{
                width: 44,
                flexShrink: 0,
                py: 1,
                px: 0.5,
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? alpha(theme.palette.text.primary, 0.03)
                    : alpha('#000000', 0.25),
                borderRight: `1px solid ${theme.palette.divider}`,
                userSelect: 'none',
                overflow: 'hidden',
                textAlign: 'right',
                fontFamily: "'Fira Code', 'Roboto Mono', monospace",
                fontSize: '0.8rem',
                lineHeight: 1.5,
                color: theme.palette.text.disabled
              }}
            >
              {lines.map((l) => (
                <div key={l} style={{ height: 19.2 }}>
                  {l}
                </div>
              ))}
            </Box>

            {/* Monospace Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onScroll={handleScroll}
              placeholder={
                locale === 'zh-CN'
                  ? '{\n  "openapi": "3.0.0",\n  "info": {\n    "title": "Sample API",\n    "version": "1.0.0"\n  },\n  "paths": {}\n}'
                  : '{\n  "openapi": "3.0.0",\n  "info": {\n    "title": "Sample API",\n    "version": "1.0.0"\n  },\n  "paths": {}\n}'
              }
              spellCheck={false}
              style={{
                flex: 1,
                height: '100%',
                padding: '8px 12px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                backgroundColor: 'transparent',
                color: theme.palette.text.primary,
                fontFamily: "'Fira Code', 'Roboto Mono', monospace",
                fontSize: '0.8rem',
                lineHeight: 1.5,
                whiteSpace: 'pre',
                overflowX: 'auto',
                overflowY: 'auto'
              }}
            />
          </Box>
        </Box>

        {/* Row 3: Footnote notice */}
        <Typography
          variant="caption"
          sx={{
            fontStyle: 'italic',
            color: theme.palette.text.secondary,
            fontSize: '0.75rem'
          }}
        >
          {locale === 'zh-CN' ? (
            <>
              提示：URL 引用（<code style={{ fontStyle: 'normal' }}>$ref</code>）将自动联网解析，本地文件系统相对路径引用不支持。
            </>
          ) : (
            <>
              Note: URL references (<code style={{ fontStyle: 'normal' }}>$ref</code>) will be automatically resolved. File references are not supported.
            </>
          )}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          px: 2.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.2
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={handleImport}
          disabled={loading || (!url.trim() && !content.trim())}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{
            px: 2.2,
            py: 0.6,
            borderRadius: 1.5,
            fontSize: '0.82rem',
            fontWeight: 600,
            textTransform: 'none'
          }}
        >
          {loading ? (locale === 'zh-CN' ? '正在解析导入...' : 'Importing...') : (locale === 'zh-CN' ? '导入 (Import)' : 'Import')}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{
            px: 2,
            py: 0.6,
            borderRadius: 1.5,
            fontSize: '0.82rem',
            fontWeight: 600,
            textTransform: 'none',
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.text.primary,
              color: theme.palette.text.primary
            }
          }}
        >
          {locale === 'zh-CN' ? '取消' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

