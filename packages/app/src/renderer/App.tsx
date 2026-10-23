import React, { useState, useMemo, useEffect } from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { useApp } from './store/AppContext';
import { getAppTheme } from './theme';
import { Sidebar } from './components/Layout/Sidebar';
import { EnvironmentNav } from './components/Layout/EnvironmentNav';
import { Header } from './components/Layout/Header';
import { MainContent } from './components/Layout/MainContent';
import { SettingsDialog } from './components/SettingsDialog/SettingsDialog';
import { apiService } from './services/api.service';

export const AppContent: React.FC = () => {
  const {
    environments,
    activeEnvironment,
    activeEnvironmentUuid,
    setActiveEnvironmentUuid,
    createEnvironment,
    importEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
    toggleServer,
    serverStatuses,
    selectedRouteUuid,
    addRoute,
    duplicateRoute,
    deleteRoute,
    themeMode,
    themePreset,
    layoutDensity
  } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sync menu enable/disable state with main process
  useEffect(() => {
    apiService.updateMenuState({
      environmentsCount: environments.length,
      hasActiveEnvironment: !!activeEnvironment,
      activeEnvironmentRoutesCount: activeEnvironment?.routes?.length || 0,
      isActiveEnvironmentEditable: true
    });
  }, [environments.length, activeEnvironment?.uuid, activeEnvironment?.routes?.length]);

  // Handle native OS application menu events
  useEffect(() => {
    const unsubscribe = apiService.onMenuEvent((action: string) => {
      switch (action) {
        case 'OPEN_SETTINGS':
          setSettingsOpen(true);
          break;

        case 'NEW_ENVIRONMENT':
          createEnvironment();
          break;

        case 'OPEN_ENVIRONMENT':
          importEnvironment();
          break;

        case 'DUPLICATE_ENVIRONMENT':
          if (activeEnvironmentUuid) {
            duplicateEnvironment(activeEnvironmentUuid);
          }
          break;

        case 'PREVIOUS_ENVIRONMENT': {
          const idx = environments.findIndex((e) => e.uuid === activeEnvironmentUuid);
          if (idx > 0) {
            setActiveEnvironmentUuid(environments[idx - 1].uuid);
          }
          break;
        }

        case 'NEXT_ENVIRONMENT': {
          const idx = environments.findIndex((e) => e.uuid === activeEnvironmentUuid);
          if (idx !== -1 && idx < environments.length - 1) {
            setActiveEnvironmentUuid(environments[idx + 1].uuid);
          }
          break;
        }

        case 'CLOSE_ENVIRONMENT':
          if (activeEnvironmentUuid && environments.length > 1) {
            deleteEnvironment(activeEnvironmentUuid);
          }
          break;

        case 'NEW_ROUTE':
          addRoute('http');
          break;

        case 'DUPLICATE_ROUTE': {
          const targetRouteUuid =
            selectedRouteUuid || activeEnvironment?.routes[0]?.uuid;
          if (targetRouteUuid) {
            duplicateRoute(targetRouteUuid);
          }
          break;
        }

        case 'DELETE_ROUTE': {
          const targetRouteUuid =
            selectedRouteUuid || activeEnvironment?.routes[0]?.uuid;
          if (targetRouteUuid) {
            deleteRoute(targetRouteUuid);
          }
          break;
        }

        case 'START_ENVIRONMENT':
          if (activeEnvironmentUuid) {
            toggleServer(activeEnvironmentUuid);
          }
          break;

        case 'START_ALL_ENVIRONMENTS': {
          const allRunning =
            environments.length > 0 &&
            environments.every((e) => serverStatuses[e.uuid] === 'running');
          environments.forEach((e) => {
            const isRunning = serverStatuses[e.uuid] === 'running';
            if (allRunning && isRunning) {
              toggleServer(e.uuid);
            } else if (!allRunning && !isRunning) {
              toggleServer(e.uuid);
            }
          });
          break;
        }

        default:
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [
    environments,
    activeEnvironment,
    activeEnvironmentUuid,
    selectedRouteUuid,
    serverStatuses,
    createEnvironment,
    importEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
    toggleServer,
    addRoute,
    duplicateRoute,
    deleteRoute,
    setActiveEnvironmentUuid
  ]);

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
        {/* Column 1: Leftmost Sidebar (Environments List) */}
        <Sidebar />

        {/* Column 2: Secondary Navigation Tree (Global Configs + Routes Tree) */}
        <EnvironmentNav />

        {/* Column 3: Right Main Panel (Header + Main Work Content) */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minWidth: 0,
            overflow: 'hidden'
          }}
        >
          {/* Slim Header with Merged Master Switch & Pulse Dot */}
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
