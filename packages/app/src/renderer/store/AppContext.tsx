import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Environment, Environments, Route, RouteResponse, Header, Callback, DataBucket, Transaction } from '@mockoon/commons';
import { Settings, EnvironmentDescriptor } from 'src/shared/models/settings.model';
import { apiService } from '../services/api.service';
import { ThemePresetKey, LayoutDensity } from '../theme';
import { SupportedLocale } from '../i18n';

export type ServerStatus = 'stopped' | 'starting' | 'running' | 'error';

export const DEFAULT_NAV_TABS = ['routes', 'dataBuckets', 'headers', 'callbacks', 'logs', 'proxy', 'settings'];

interface AppContextType {
  settings: Settings | null;
  environments: Environment[];
  activeEnvironmentUuid: string | null;
  activeEnvironment: Environment | null;
  serverStatuses: Record<string, ServerStatus>;
  serverLogs: Record<string, Transaction[]>;
  activeTabKey: string;
  setActiveTabKey: (key: string) => void;
  selectedRouteUuid: string | null;
  setSelectedRouteUuid: (uuid: string | null) => void;
  addRoute: () => void;
  deleteRoute: (uuid: string) => void;
  setActiveEnvironmentUuid: (uuid: string) => void;
  updateActiveEnvironment: (updater: (prev: Environment) => Environment) => void;
  createEnvironment: () => Promise<void>;
  importEnvironment: () => Promise<void>;
  exportEnvironment: (env: Environment) => Promise<void>;
  duplicateEnvironment: (uuid: string) => Promise<void>;
  deleteEnvironment: (uuid: string) => Promise<void>;
  toggleServer: (uuid: string) => Promise<void>;
  clearLogs: (uuid: string) => void;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  themePreset: ThemePresetKey;
  setThemePreset: (preset: ThemePresetKey) => void;
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  layoutDensity: LayoutDensity;
  setLayoutDensity: (density: LayoutDensity) => void;
  navTabsOrder: string[];
  setNavTabsOrder: (order: string[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_SETTINGS: Settings = {
  welcomeShown: true,
  apiUrl: '',
  maxLogsPerEnvironment: 100,
  truncateRouteName: true,
  mainMenuSize: 240,
  secondaryMenuSize: 280,
  fakerLocale: 'en',
  fakerSeed: 1234,
  lastChangelog: '',
  environments: [],
  disabledRoutes: {},
  collapsedFolders: {},
  storagePrettyPrint: true,
  fileWatcherEnabled: 'auto' as any,
  dialogWorkingDir: '',
  startEnvironmentsOnLoad: false,
  logTransactions: true,
  environmentsCategoriesOrder: ['local'],
  environmentsCategoriesCollapsed: { local: false, cloud: false },
  envVarsPrefix: '',
  activeEnvironmentUuid: null,
  enableRandomLatency: false,
  recentLocalEnvironments: [],
  displayLogsIsoTimestamp: true,
  deployPreferredRegion: 'us' as any,
  commandPaletteRecentCommands: [],
  themeMode: 'dark',
  themePreset: 'modern-indigo',
  locale: 'zh-CN',
  layoutDensity: 'compact',
  navTabsOrder: DEFAULT_NAV_TABS
};

export const DEFAULT_GLOBAL_HEADERS = [
  { key: 'Content-Type', value: 'application/json' },
  { key: 'Access-Control-Allow-Origin', value: '*' },
  { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Origin, Accept, Authorization, Content-Length, X-Requested-With' }
];

const createDefaultEnvironment = (name = 'Local API'): Environment => {
  const uuid = 'env_' + Math.random().toString(36).substring(2, 10);
  return {
    uuid,
    lastMigration: 33,
    name,
    endpointPrefix: '',
    latency: 0,
    port: 3000,
    hostname: 'localhost',
    folders: [],
    routes: [
      {
        uuid: 'route_' + Math.random().toString(36).substring(2, 10),
        type: 'http',
        documentation: 'Default user list API',
        method: 'get',
        endpoint: 'users',
        responses: [
          {
            uuid: 'resp_' + Math.random().toString(36).substring(2, 10),
            body: JSON.stringify([
              { id: 1, name: 'John Doe', role: 'Developer' },
              { id: 2, name: 'Alice Smith', role: 'Designer' }
            ], null, 2),
            latency: 0,
            statusCode: 200,
            label: '200 OK',
            headers: [{ key: 'Content-Type', value: 'application/json' }],
            bodyType: 'INLINE',
            filePath: '',
            databucketID: '',
            sendFileAsBody: false,
            rules: [],
            rulesOperator: 'OR',
            disableTemplating: false,
            fallbackTo404: false,
            default: true,
            crudKey: 'id',
            callbacks: []
          }
        ],
        responseMode: null,
        streamingMode: null,
        streamingInterval: 0
      }
    ],
    rootChildren: [],
    proxyMode: false,
    proxyHost: '',
    proxyRemovePrefix: false,
    tlsOptions: {
      enabled: false,
      type: 'CERT',
      pfxPath: '',
      certPath: '',
      keyPath: '',
      caPath: '',
      passphrase: ''
    },
    cors: true,
    headers: [...DEFAULT_GLOBAL_HEADERS],
    proxyReqHeaders: [],
    proxyResHeaders: [],
    data: [],
    callbacks: []
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvironmentUuid, setActiveEnvironmentUuid] = useState<string | null>(null);
  const [serverStatuses, setServerStatuses] = useState<Record<string, ServerStatus>>({});
  const [serverLogs, setServerLogs] = useState<Record<string, Transaction[]>>({});
  const [activeTabKey, setActiveTabKey] = useState<string>('routes');
  const [selectedRouteUuid, setSelectedRouteUuid] = useState<string | null>(null);
  const [navTabsOrder, setNavTabsOrderState] = useState<string[]>(DEFAULT_NAV_TABS);

  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>('dark');
  const [themePreset, setThemePresetState] = useState<ThemePresetKey>('modern-indigo');
  const [locale, setLocaleState] = useState<SupportedLocale>('zh-CN');
  const [layoutDensity, setLayoutDensityState] = useState<LayoutDensity>('compact');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Load initial settings and environments
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      let loadedSettings = await apiService.readSettings();
      if (!loadedSettings) {
        loadedSettings = DEFAULT_SETTINGS;
      }

      if (loadedSettings.themeMode === 'light' || loadedSettings.themeMode === 'dark') {
        setThemeModeState(loadedSettings.themeMode);
      }
      if (loadedSettings.themePreset && loadedSettings.themePreset !== 'custom') {
        setThemePresetState(loadedSettings.themePreset as ThemePresetKey);
      }
      if (loadedSettings.locale && (loadedSettings.locale === 'zh-CN' || loadedSettings.locale === 'en')) {
        setLocaleState(loadedSettings.locale as SupportedLocale);
      }
      if (loadedSettings.layoutDensity) {
        setLayoutDensityState(loadedSettings.layoutDensity);
      }
      if (Array.isArray(loadedSettings.navTabsOrder) && loadedSettings.navTabsOrder.length > 0) {
        // Ensure all tabs exist
        const merged = [...loadedSettings.navTabsOrder];
        DEFAULT_NAV_TABS.forEach((t) => {
          if (!merged.includes(t)) merged.push(t);
        });
        setNavTabsOrderState(merged);
      }

      const envList: Environment[] = [];
      const descriptors = loadedSettings.environments || [];

      for (const desc of descriptors) {
        if (!desc.cloud && desc.path) {
          const envData = await apiService.readEnvironment(desc.path);
          if (envData) {
            envList.push(envData);
          }
        }
      }

      // If no environment exists, create a default one
      if (envList.length === 0) {
        const defaultEnv = createDefaultEnvironment('MockPulse Demo');
        const storagePath = await apiService.buildStorageFilePath(defaultEnv.uuid);
        const desc: EnvironmentDescriptor = {
          uuid: defaultEnv.uuid,
          path: storagePath,
          cloud: false,
          lastServerHash: null
        };
        await apiService.writeEnvironment(defaultEnv, desc, true);
        loadedSettings.environments = [desc];
        loadedSettings.activeEnvironmentUuid = defaultEnv.uuid;
        await apiService.writeSettings(loadedSettings);
        envList.push(defaultEnv);
      }

      if (mounted) {
        setSettings(loadedSettings);
        setEnvironments(envList);
        setActiveEnvironmentUuid(loadedSettings.activeEnvironmentUuid || envList[0]?.uuid || null);
      }
    };

    init();

    // Listen to IPC server events
    const unsub = apiService.onServerEvent((uuid, event, data) => {
      if (event === 'started') {
        setServerStatuses((prev) => ({ ...prev, [uuid]: 'running' }));
      } else if (event === 'stopped') {
        setServerStatuses((prev) => ({ ...prev, [uuid]: 'stopped' }));
      } else if (event === 'error') {
        setServerStatuses((prev) => ({ ...prev, [uuid]: 'error' }));
      } else if (event === 'transaction-complete' && data?.transaction) {
        setServerLogs((prev) => {
          const currentLogs = prev[uuid] || [];
          return {
            ...prev,
            [uuid]: [data.transaction, ...currentLogs].slice(0, 100)
          };
        });
      }
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const activeEnvironment = useMemo(() => {
    return environments.find((e) => e.uuid === activeEnvironmentUuid) || environments[0] || null;
  }, [environments, activeEnvironmentUuid]);

  // Update Settings helper
  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    setSettings((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...partial };
      apiService.writeSettings(next);
      return next;
    });
  }, []);

  const setThemeMode = useCallback((mode: 'light' | 'dark') => {
    setThemeModeState(mode);
    updateSettings({ themeMode: mode });
  }, [updateSettings]);

  const setThemePreset = useCallback((preset: ThemePresetKey) => {
    setThemePresetState(preset);
    updateSettings({ themePreset: preset as any });
  }, [updateSettings]);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    updateSettings({ locale: newLocale });
  }, [updateSettings]);

  const setLayoutDensity = useCallback((density: LayoutDensity) => {
    setLayoutDensityState(density);
    updateSettings({ layoutDensity: density });
  }, [updateSettings]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const setNavTabsOrder = useCallback((order: string[]) => {
    setNavTabsOrderState(order);
    updateSettings({ navTabsOrder: order });
  }, [updateSettings]);

  // Update Environment
  const updateActiveEnvironment = useCallback((updater: (prev: Environment) => Environment) => {
    if (!activeEnvironment) return;

    setEnvironments((prevEnvs) => {
      const idx = prevEnvs.findIndex((e) => e.uuid === activeEnvironment.uuid);
      if (idx === -1) return prevEnvs;

      const updated = updater({ ...prevEnvs[idx] });
      const nextEnvs = [...prevEnvs];
      nextEnvs[idx] = updated;

      // Find descriptor
      if (settings) {
        const desc = settings.environments.find((d) => d.uuid === updated.uuid);
        if (desc) {
          apiService.writeEnvironment(updated, desc, settings.storagePrettyPrint);
        }
      }

      // Hot reload running server
      apiService.updateEnvironments(nextEnvs);

      return nextEnvs;
    });
  }, [activeEnvironment, settings]);

  // Create Environment
  const createEnvironment = useCallback(async () => {
    const newEnv = createDefaultEnvironment(`API Env ${environments.length + 1}`);
    const filePath = await apiService.buildStorageFilePath(newEnv.uuid);
    const desc: EnvironmentDescriptor = {
      uuid: newEnv.uuid,
      path: filePath,
      cloud: false,
      lastServerHash: null
    };

    await apiService.writeEnvironment(newEnv, desc, true);

    const nextEnvs = [...environments, newEnv];
    setEnvironments(nextEnvs);
    setActiveEnvironmentUuid(newEnv.uuid);

    if (settings) {
      const nextSettings: Settings = {
        ...settings,
        environments: [...settings.environments, desc],
        activeEnvironmentUuid: newEnv.uuid
      };
      setSettings(nextSettings);
      await apiService.writeSettings(nextSettings);
    }
  }, [environments, settings]);

  // Import Environment
  const importEnvironment = useCallback(async () => {
    const res = await apiService.showOpenDialog({
      filters: [{ name: 'JSON Environment', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (!res.canceled && res.filePaths?.[0]) {
      const filePath = res.filePaths[0];
      const data = await apiService.readEnvironment(filePath);
      if (data && data.uuid) {
        data.uuid = 'env_' + Math.random().toString(36).substring(2, 10);
        data.name = `${data.name} (Imported)`;
        const newPath = await apiService.buildStorageFilePath(data.uuid);
        const desc: EnvironmentDescriptor = {
          uuid: data.uuid,
          path: newPath,
          cloud: false,
          lastServerHash: null
        };
        await apiService.writeEnvironment(data, desc, true);

        const nextEnvs = [...environments, data];
        setEnvironments(nextEnvs);
        setActiveEnvironmentUuid(data.uuid);

        if (settings) {
          const nextSettings: Settings = {
            ...settings,
            environments: [...settings.environments, desc],
            activeEnvironmentUuid: data.uuid
          };
          setSettings(nextSettings);
          await apiService.writeSettings(nextSettings);
        }
      }
    }
  }, [environments, settings]);

  // Export Environment
  const exportEnvironment = useCallback(async (env: Environment) => {
    const res = await apiService.showSaveDialog({
      title: 'Export Environment JSON',
      defaultPath: `${env.name.toLowerCase().replace(/\s+/g, '-')}-mockpulse.json`,
      filters: [{ name: 'JSON File', extensions: ['json'] }]
    });

    if (!res.canceled && res.filePath) {
      const desc: EnvironmentDescriptor = {
        uuid: env.uuid,
        path: res.filePath,
        cloud: false,
        lastServerHash: null
      };
      await apiService.writeEnvironment(env, desc, true);
    }
  }, []);

  // Duplicate Environment
  const duplicateEnvironment = useCallback(async (uuid: string) => {
    const target = environments.find((e) => e.uuid === uuid);
    if (!target) return;

    const copy: Environment = JSON.parse(JSON.stringify(target));
    copy.uuid = 'env_' + Math.random().toString(36).substring(2, 10);
    copy.name = `${copy.name} (Copy)`;
    copy.port = (copy.port || 3000) + 1;

    const filePath = await apiService.buildStorageFilePath(copy.uuid);
    const desc: EnvironmentDescriptor = {
      uuid: copy.uuid,
      path: filePath,
      cloud: false,
      lastServerHash: null
    };

    await apiService.writeEnvironment(copy, desc, true);

    const nextEnvs = [...environments, copy];
    setEnvironments(nextEnvs);
    setActiveEnvironmentUuid(copy.uuid);

    if (settings) {
      const nextSettings: Settings = {
        ...settings,
        environments: [...settings.environments, desc],
        activeEnvironmentUuid: copy.uuid
      };
      setSettings(nextSettings);
      await apiService.writeSettings(nextSettings);
    }
  }, [environments, settings]);

  // Delete Environment
  const deleteEnvironment = useCallback(async (uuid: string) => {
    if (environments.length <= 1) return;

    if (serverStatuses[uuid] === 'running') {
      await apiService.stopServer(uuid);
    }

    const nextEnvs = environments.filter((e) => e.uuid !== uuid);
    setEnvironments(nextEnvs);

    const nextActive = nextEnvs[0]?.uuid || null;
    setActiveEnvironmentUuid(nextActive);

    if (settings) {
      const nextSettings: Settings = {
        ...settings,
        environments: settings.environments.filter((d) => d.uuid !== uuid),
        activeEnvironmentUuid: nextActive
      };
      setSettings(nextSettings);
      await apiService.writeSettings(nextSettings);
    }
  }, [environments, serverStatuses, settings]);

  // Toggle Server
  const toggleServer = useCallback(async (uuid: string) => {
    const env = environments.find((e) => e.uuid === uuid);
    if (!env || !settings) return;

    const desc = settings.environments.find((d) => d.uuid === uuid);
    const currentStatus = serverStatuses[uuid] || 'stopped';

    if (currentStatus === 'running') {
      setServerStatuses((prev) => ({ ...prev, [uuid]: 'stopped' }));
      await apiService.stopServer(uuid);
    } else {
      setServerStatuses((prev) => ({ ...prev, [uuid]: 'starting' }));
      try {
        await apiService.startServer(env, desc?.path || '');
      } catch (err) {
        setServerStatuses((prev) => ({ ...prev, [uuid]: 'error' }));
      }
    }
  }, [environments, settings, serverStatuses]);

  // Clear Logs
  const clearLogs = useCallback((uuid: string) => {
    setServerLogs((prev) => ({ ...prev, [uuid]: [] }));
  }, []);

  // Add Route
  const addRoute = useCallback(() => {
    if (!activeEnvironment) return;
    const newRoute: Route = {
      uuid: 'route_' + Math.random().toString(36).substring(2, 10),
      type: 'http',
      documentation: '',
      method: 'get',
      endpoint: 'new-endpoint',
      responses: [
        {
          uuid: 'resp_' + Math.random().toString(36).substring(2, 10),
          body: '{\n  "message": "Hello from MockPulse"\n}',
          latency: 0,
          statusCode: 200,
          label: '200 OK',
          headers: [{ key: 'Content-Type', value: 'application/json' }],
          bodyType: 'INLINE',
          filePath: '',
          databucketID: '',
          sendFileAsBody: false,
          rules: [],
          rulesOperator: 'OR',
          disableTemplating: false,
          fallbackTo404: false,
          default: true,
          crudKey: 'id',
          callbacks: []
        }
      ],
      responseMode: null,
      streamingMode: null,
      streamingInterval: 0
    };

    updateActiveEnvironment((env) => ({
      ...env,
      routes: [...env.routes, newRoute]
    }));
    setSelectedRouteUuid(newRoute.uuid);
    setActiveTabKey('routes');
  }, [activeEnvironment, updateActiveEnvironment]);

  // Delete Route
  const deleteRoute = useCallback((routeUuid: string) => {
    if (!activeEnvironment) return;
    updateActiveEnvironment((env) => ({
      ...env,
      routes: env.routes.filter((r) => r.uuid !== routeUuid)
    }));
    if (selectedRouteUuid === routeUuid) {
      const remaining = activeEnvironment.routes.filter((r) => r.uuid !== routeUuid);
      setSelectedRouteUuid(remaining[0]?.uuid || null);
    }
  }, [activeEnvironment, selectedRouteUuid, updateActiveEnvironment]);

  // Auto select first route if none selected
  useEffect(() => {
    if (activeEnvironment && activeEnvironment.routes.length > 0) {
      if (!selectedRouteUuid || !activeEnvironment.routes.some((r) => r.uuid === selectedRouteUuid)) {
        setSelectedRouteUuid(activeEnvironment.routes[0].uuid);
      }
    }
  }, [activeEnvironment?.uuid]);

  return (
    <AppContext.Provider
      value={{
        settings,
        environments,
        activeEnvironmentUuid,
        activeEnvironment,
        serverStatuses,
        serverLogs,
        activeTabKey,
        setActiveTabKey,
        selectedRouteUuid,
        setSelectedRouteUuid,
        addRoute,
        deleteRoute,
        setActiveEnvironmentUuid,
        updateActiveEnvironment,
        createEnvironment,
        importEnvironment,
        exportEnvironment,
        duplicateEnvironment,
        deleteEnvironment,
        toggleServer,
        clearLogs,
        updateSettings,
        themeMode,
        setThemeMode,
        themePreset,
        setThemePreset,
        locale,
        setLocale,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        layoutDensity,
        setLayoutDensity,
        navTabsOrder,
        setNavTabsOrder
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
