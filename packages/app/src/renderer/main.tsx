import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './store/AppContext';
import { I18nProvider } from './i18n';
import { AppContent } from './App';
import { ErrorBoundary } from './components/Common/ErrorBoundary';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AppProvider>
          <I18nProvider>
            <AppContent />
          </I18nProvider>
        </AppProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

