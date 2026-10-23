import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            p: 3
          }}
        >
          <Paper
            elevation={4}
            sx={{
              maxWidth: 600,
              width: '100%',
              p: 4,
              borderRadius: 3,
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#f43f5e' }}>
              ⚠️ 界面加载异常 (Runtime Error)
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
              检测到界面渲染过程中出现异常，系统已阻止崩溃并保护数据完整性。
            </Typography>

            {this.state.error && (
              <Box
                sx={{
                  backgroundColor: '#090d16',
                  p: 2,
                  borderRadius: 1.5,
                  textAlign: 'left',
                  mb: 3,
                  maxHeight: 180,
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: '#fda4af',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid rgba(244, 63, 94, 0.2)'
                }}
              >
                {this.state.error.toString()}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={this.handleReload}
                sx={{
                  backgroundColor: '#6366f1',
                  '&:hover': { backgroundColor: '#4f46e5' },
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                重新加载页面
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleReset}
                sx={{
                  color: '#94a3b8',
                  borderColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { borderColor: '#f8fafc', color: '#f8fafc' },
                  px: 3,
                  py: 1,
                  textTransform: 'none'
                }}
              >
                清除缓存并重试
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

