import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  bodyType?: 'INLINE' | 'FILE' | 'DATABUCKET';
  onBodyTypeChange?: (type: 'INLINE' | 'FILE' | 'DATABUCKET') => void;
  placeholder?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  bodyType,
  onBodyTypeChange,
  placeholder = '{\n  "status": "ok"\n}'
}) => {
  const theme = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Calculate lines for gutter
  const lineCount = useMemo(() => {
    if (!value) return 1;
    return value.split('\n').length;
  }, [value]);

  const lines = useMemo(() => {
    return Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);
  }, [lineCount]);

  // Synchronize gutter scroll with textarea
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Format JSON
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      setFeedback('已成功格式化 JSON！');
    } catch (e: any) {
      setFeedback(`格式化失败: ${e?.message || '非有效 JSON 内容'}`);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setFeedback('已成功复制响应体到剪贴板！');
  };

  const editorContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        borderRadius: isFullscreen ? 0 : 2,
        border: isFullscreen ? 'none' : `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        backgroundColor:
          theme.palette.mode === 'light' ? '#fbfcfe' : '#0d1117'
      }}
    >
      {/* Editor Top Toolbar */}
      <Box
        sx={{
          height: 36,
          minHeight: 36,
          px: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.grey[100], 0.8)
              : alpha(theme.palette.background.paper, 0.6)
        }}
      >
        {/* Left: Body type dropdown (integrated) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onBodyTypeChange && bodyType && (
            <Select
              size="small"
              value={bodyType}
              onChange={(e) => onBodyTypeChange(e.target.value as any)}
              sx={{
                height: 26,
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
                borderRadius: 1.2,
                '& .MuiSelect-select': { py: 0.3, px: 1 },
                '& fieldset': { borderColor: 'transparent' }
              }}
            >
              <MenuItem value="INLINE" sx={{ fontSize: '0.75rem' }}>
                自定义内容 (Inline JSON/Text)
              </MenuItem>
              <MenuItem value="FILE" sx={{ fontSize: '0.75rem' }}>
                文件响应 (File)
              </MenuItem>
              <MenuItem value="DATABUCKET" sx={{ fontSize: '0.75rem' }}>
                数据桶生成 (Data Bucket)
              </MenuItem>
            </Select>
          )}

          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
            {lineCount} 行 · {value ? (new Blob([value]).size / 1024).toFixed(1) : 0} KB
          </Typography>
        </Box>

        {/* Right: Quick action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="格式化 JSON (Format)" arrow>
            <IconButton size="small" onClick={handleFormat} sx={{ width: 26, height: 26 }}>
              <AutoFixHighRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="复制内容 (Copy)" arrow>
            <IconButton size="small" onClick={handleCopy} sx={{ width: 26, height: 26 }}>
              <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? '退出全屏' : '全屏编辑 (Fullscreen)'} arrow>
            <IconButton size="small" onClick={() => setIsFullscreen(!isFullscreen)} sx={{ width: 26, height: 26 }}>
              {isFullscreen ? (
                <FullscreenExitRoundedIcon sx={{ fontSize: 16 }} />
              ) : (
                <FullscreenRoundedIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Editor Body: Gutter line numbers + Textarea */}
      <Box sx={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Line Numbers Gutter */}
        <Box
          ref={gutterRef}
          sx={{
            width: 44,
            minWidth: 44,
            py: 1,
            px: 0.5,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            backgroundColor:
              theme.palette.mode === 'light'
                ? alpha(theme.palette.grey[200], 0.3)
                : alpha(theme.palette.background.default, 0.4),
            color: theme.palette.text.disabled,
            fontFamily: "'Fira Code', monospace",
            fontSize: '0.8rem',
            lineHeight: 1.5,
            textAlign: 'right',
            userSelect: 'none',
            overflow: 'hidden'
          }}
        >
          {lines.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </Box>

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          placeholder={placeholder}
          spellCheck={false}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            resize: 'none',
            outline: 'none',
            border: 'none',
            backgroundColor: 'transparent',
            color: theme.palette.mode === 'light' ? '#1f2937' : '#e6edf3',
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
            fontSize: '0.82rem',
            lineHeight: 1.5,
            padding: '8px 12px',
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            overflowX: 'auto',
            tabSize: 2
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Normal mode */}
      {!isFullscreen && editorContent}

      {/* Fullscreen Dialog Mode */}
      <Dialog
        fullScreen
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle
          sx={{
            height: 44,
            p: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            MockPulse - 全屏 JSON 代码编辑器
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FullscreenExitRoundedIcon />}
            onClick={() => setIsFullscreen(false)}
            sx={{ py: 0.2, fontSize: '0.75rem' }}
          >
            完成并退出
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 0, flex: 1, overflow: 'hidden' }}>
          {editorContent}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!feedback}
        autoHideDuration={2200}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={feedback?.includes('失败') ? 'warning' : 'success'}
          sx={{ py: 0.5, fontSize: '0.78rem' }}
        >
          {feedback}
        </Alert>
      </Snackbar>
    </Box>
  );
};
