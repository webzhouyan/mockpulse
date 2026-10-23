import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './store/AppContext';
import { I18nProvider } from './i18n';
import { AppContent } from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <I18nProvider>
          <AppContent />
        </I18nProvider>
      </AppProvider>
    </React.StrictMode>
  );
}

