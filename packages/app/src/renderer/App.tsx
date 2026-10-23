import React, { useState, useMemo } from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { useApp } from './store/AppContext';
import { getAppTheme } from './theme';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { MainContent } from './components/Layout/MainContent';
import { SettingsDialog } from './components/SettingsDialog/SettingsDialog';

export const AppContent: React.FC = () => {
  const { themeMode, themePreset, layoutDensity } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const theme = useMemo(() => {
    return getAppTheme(themeMode, themePreset, layoutDensity);
  }, [themeMode, themePreset, layoutDensity]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary
        }}
      >
        {/* Left Sidebar: Environments List */}
        <Sidebar />

        {/* Right Main Panel: Header + Content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          {/* Header with scrollable tabs & right actions */}
          <Header onOpenSettings={() => setSettingsOpen(true)} />

          {/* Active Tab Main Content */}
          <MainContent />
        </Box>

        {/* Global Settings Dialog */}
        <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </Box>
    </ThemeProvider>
  );
};

