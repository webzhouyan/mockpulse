import React from 'react';
import { Box } from '@mui/material';
import { useApp } from '../../store/AppContext';
import { RoutesView } from '../Routes/RoutesView';
import { DataBucketsView } from '../DataBuckets/DataBucketsView';
import { HeadersView } from '../Headers/HeadersView';
import { CallbacksView } from '../Callbacks/CallbacksView';
import { LogsView } from '../Logs/LogsView';
import { ProxyView } from '../Proxy/ProxyView';
import { EnvSettingsView } from '../EnvSettings/EnvSettingsView';

export const MainContent: React.FC = () => {
  const { activeTabKey } = useApp();

  return (
    <Box sx={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden', position: 'relative' }}>
      {activeTabKey === 'routes' && <RoutesView />}
      {activeTabKey === 'dataBuckets' && <DataBucketsView />}
      {activeTabKey === 'headers' && <HeadersView />}
      {activeTabKey === 'callbacks' && <CallbacksView />}
      {activeTabKey === 'logs' && <LogsView />}
      {activeTabKey === 'proxy' && <ProxyView />}
      {activeTabKey === 'settings' && <EnvSettingsView />}
    </Box>
  );
};
