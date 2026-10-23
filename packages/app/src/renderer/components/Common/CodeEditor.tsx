import React, { useState, useMemo } from 'react';
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
  Button
} from '@mui/material';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { useI18n } from '../../i18n';

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
  const { t, locale } = useI18n();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Line count
  const lineCount = useMemo(() => {
    if (!value) return 1;
    return value.split('\n').length;
  }, [value]);

  // CodeMirror extensions with JSON syntax highlighting and folding
  const extensions = useMemo(() => [json()], []);

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

  const cmTheme = theme.palette.mode === 'dark' ? githubDark : githubLight;

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
                {t.routes.bodyInline || 'Inline Content'}
              </MenuItem>
              <MenuItem value="FILE" sx={{ fontSize: '0.75rem' }}>
                {t.routes.bodyFile || 'File Response'}
              </MenuItem>
              <MenuItem value="DATABUCKET" sx={{ fontSize: '0.75rem' }}>
                {t.routes.bodyDatabucket || 'Data Bucket'}
              </MenuItem>
            </Select>
          )}

          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
            {lineCount} {locale === 'en' ? 'lines' : '行'} · {value ? (new Blob([value]).size / 1024).toFixed(1) : 0} KB
          </Typography>
        </Box>

        {/* Right: Quick action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={t.routes.formatJson || 'Format JSON'} arrow>
            <IconButton size="small" onClick={handleFormat} sx={{ width: 26, height: 26 }}>
              <AutoFixHighRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={t.common.copy || 'Copy'} arrow>
            <IconButton size="small" onClick={handleCopy} sx={{ width: 26, height: 26 }}>
              <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={
              isFullscreen
                ? locale === 'en'
                  ? 'Exit Fullscreen'
                  : '退出全屏'
                : t.routes.toggleFullscreen || 'Fullscreen'
            }
            arrow
          >
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

      {/* Editor Body: Rich CodeMirror with JSON Syntax Highlighting, Folding & Line Numbers */}
      <Box
        sx={{
          flex: 1,
          height: 'calc(100% - 36px)',
          overflow: 'hidden',
          '& .cm-editor': {
            height: '100%',
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
            fontSize: '0.82rem'
          },
          '& .cm-scroller': {
            overflow: 'auto',
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace"
          },
          '& .cm-gutters': {
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            backgroundColor:
              theme.palette.mode === 'light'
                ? alpha(theme.palette.grey[200], 0.3)
                : alpha(theme.palette.background.default, 0.4)
          }
        }}
      >
        <CodeMirror
          value={value}
          height="100%"
          theme={cmTheme}
          extensions={extensions}
          onChange={(val) => onChange(val)}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: false,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: false,
            lintKeymap: false
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
