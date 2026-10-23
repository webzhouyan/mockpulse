import {
  BuildCRUDRoute,
  BuildDemoEnvironment,
  BuildFolder,
  BuildHTTPRoute,
  BuildWebSocketRoute,
  Environment,
  Folder,
  Route,
  Transaction,
  OpenApiConverter
} from '@mockoon/commons';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  EnvironmentDescriptor,
  RecentLocalEnvironment,
  Settings
} from 'src/shared/models/settings.model';
import { SupportedLocale } from '../i18n';
import { apiService } from '../services/api.service';
import { LayoutDensity, ThemePresetKey } from '../theme';

export type ServerStatus = 'stopped' | 'starting' | 'running' | 'error';

export const DEFAULT_NAV_TABS = [
  'routes',
  'dataBuckets',
  'headers',
  'callbacks',
  'logs',
  'proxy',
  'settings'
];

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
  addRoute: (type?: 'http' | 'crud' | 'ws') => void;
  duplicateRoute: (uuid: string) => void;
  deleteRoute: (uuid: string) => void;
  addFolder: (name?: string) => void;
  updateFolder: (folderUuid: string, partial: Partial<Folder>) => void;
  deleteFolder: (folderUuid: string) => void;
  setActiveEnvironmentUuid: (uuid: string) => void;
  updateActiveEnvironment: (
    updater: (prev: Environment) => Environment
  ) => void;
  createEnvironment: () => Promise<void>;
  importEnvironment: () => Promise<void>;
  createEnvironmentFromOpenApi: () => Promise<void>;
  openRecentEnvironment: (path: string) => Promise<void>;
  clearRecentEnvironments: () => Promise<void>;
  recentLocalEnvironments: RecentLocalEnvironment[];
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
  mainMenuSize: number;
  setMainMenuSize: (size: number) => void;
  secondaryMenuSize: number;
  setSecondaryMenuSize: (size: number) => void;
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
  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS'
  },
  {
    key: 'Access-Control-Allow-Headers',
    value:
      'Content-Type, Origin, Accept, Authorization, Content-Length, X-Requested-With'
  }
];

export const sanitizeEnvironment = (env: any): Environment => {
  if (!env) return env;
  const sanitized: Environment = {
    ...env,
    uuid: env.uuid || 'env_' + Math.random().toString(36).substring(2, 10),
    folders: Array.isArray(env.folders)
      ? env.folders.map((f: any) => ({
          ...f,
          uuid:
            f.uuid || 'folder_' + Math.random().toString(36).substring(2, 10),
          children: Array.isArray(f.children)
            ? f.children.filter((c: any) => c && c.uuid)
            : []
        }))
      : [],
    routes: Array.isArray(env.routes)
      ? env.routes.map((r: any) => ({
          ...r,
          uuid:
            r.uuid || 'route_' + Math.random().toString(36).substring(2, 10),
          type: r.type || 'http',
          method: r.method || (r.type === 'crud' ? '' : 'get'),
          responses: Array.isArray(r.responses) ? r.responses : []
        }))
      : [],
    data: Array.isArray(env.data) ? env.data : [],
    callbacks: Array.isArray(env.callbacks) ? env.callbacks : [],
    headers: Array.isArray(env.headers) ? env.headers : [],
    rootChildren: Array.isArray(env.rootChildren)
      ? env.rootChildren.filter((c: any) => c && c.uuid)
      : []
  };

  const accounted = new Set<string>();
  sanitized.rootChildren.forEach((c) => accounted.add(c.uuid));
  sanitized.folders.forEach((f) => {
    accounted.add(f.uuid);
    f.children?.forEach((c) => accounted.add(c.uuid));
  });

  const missingFolders = sanitized.folders.filter(
    (f) => !accounted.has(f.uuid)
  );
  const missingRoutes = sanitized.routes.filter((r) => !accounted.has(r.uuid));

  sanitized.rootChildren = [
    ...sanitized.rootChildren,
    ...missingFolders.map((f) => ({ type: 'folder' as const, uuid: f.uuid })),
    ...missingRoutes.map((r) => ({ type: 'route' as const, uuid: r.uuid }))
  ];

  return sanitized;
};

const createDefaultEnvironment = (name?: string): Environment => {
  const demoEnv = BuildDemoEnvironment();
  const envUuid = 'env_' + Math.random().toString(36).substring(2, 10);

  // Deep clone and regenerate UUIDs
  const cloned = JSON.parse(JSON.stringify(demoEnv));
  cloned.uuid = envUuid;
  cloned.name = name || 'Demo API';
  cloned.hostname = 'localhost';

  const uuidMap = new Map<string, string>();
  if (Array.isArray(cloned.data)) {
    cloned.data.forEach((d: any) => {
      const oldId = d.id;
      const newId = Math.random().toString(36).substring(2, 6);
      d.uuid = 'bucket_' + Math.random().toString(36).substring(2, 10);
      d.id = newId;
      uuidMap.set(oldId, newId);
    });
  }

  if (Array.isArray(cloned.routes)) {
    cloned.routes.forEach((r: any) => {
      const oldRouteUuid = r.uuid;
      const newRouteUuid =
        'route_' + Math.random().toString(36).substring(2, 10);
      r.uuid = newRouteUuid;
      if (oldRouteUuid) uuidMap.set(oldRouteUuid, newRouteUuid);

      if (Array.isArray(r.responses)) {
        r.responses.forEach((resp: any) => {
          resp.uuid = 'resp_' + Math.random().toString(36).substring(2, 10);
          if (resp.databucketID && uuidMap.has(resp.databucketID)) {
            resp.databucketID = uuidMap.get(resp.databucketID);
          }
        });
      }
    });
  }

  if (Array.isArray(cloned.folders)) {
    cloned.folders.forEach((f: any) => {
      const oldFolderUuid = f.uuid;
      const newFolderUuid =
        'folder_' + Math.random().toString(36).substring(2, 10);
      f.uuid = newFolderUuid;
      if (oldFolderUuid) uuidMap.set(oldFolderUuid, newFolderUuid);
      if (Array.isArray(f.children)) {
        f.children.forEach((c: any) => {
          if (uuidMap.has(c.uuid)) {
            c.uuid = uuidMap.get(c.uuid);
          }
        });
      }
    });
  }

  if (Array.isArray(cloned.rootChildren)) {
    cloned.rootChildren.forEach((c: any) => {
      if (uuidMap.has(c.uuid)) {
        c.uuid = uuidMap.get(c.uuid);
      }
    });
  }

  return sanitizeEnvironment(cloned);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvironmentUuid, setActiveEnvironmentUuid] = useState<
    string | null
  >(null);
  const [serverStatuses, setServerStatuses] = useState<
    Record<string, ServerStatus>
  >({});
  const [serverLogs, setServerLogs] = useState<Record<string, Transaction[]>>(
    {}
  );
  const [activeTabKey, setActiveTabKey] = useState<string>('routes');
  const [selectedRouteUuid, setSelectedRouteUuid] = useState<string | null>(
    null
  );
  const [navTabsOrder, setNavTabsOrderState] =
    useState<string[]>(DEFAULT_NAV_TABS);

  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>('dark');
  const [themePreset, setThemePresetState] =
    useState<ThemePresetKey>('modern-indigo');
  const [locale, setLocaleState] = useState<SupportedLocale>('zh-CN');
  const [layoutDensity, setLayoutDensityState] =
    useState<LayoutDensity>('compact');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mainMenuSize, setMainMenuSizeState] = useState<number>(220);
  const [secondaryMenuSize, setSecondaryMenuSizeState] = useState<number>(290);

  // Load initial settings and environments
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      let loadedSettings = await apiService.readSettings();
      if (!loadedSettings) {
        loadedSettings = DEFAULT_SETTINGS;
      }

      if (
        loadedSettings.themeMode === 'light' ||
        loadedSettings.themeMode === 'dark'
      ) {
        setThemeModeState(loadedSettings.themeMode);
      }
      if (
        loadedSettings.themePreset &&
        loadedSettings.themePreset !== 'custom'
      ) {
        setThemePresetState(loadedSettings.themePreset as ThemePresetKey);
      }
      if (
        loadedSettings.locale &&
        (loadedSettings.locale === 'zh-CN' || loadedSettings.locale === 'en')
      ) {
        setLocaleState(loadedSettings.locale as SupportedLocale);
      }
      if (loadedSettings.layoutDensity) {
        setLayoutDensityState(loadedSettings.layoutDensity);
      }
      if (loadedSettings.mainMenuSize) {
        setMainMenuSizeState(Math.max(180, loadedSettings.mainMenuSize));
      }
      if (loadedSettings.secondaryMenuSize) {
        setSecondaryMenuSizeState(Math.max(260, loadedSettings.secondaryMenuSize));
      }
      if (
        Array.isArray(loadedSettings.navTabsOrder) &&
        loadedSettings.navTabsOrder.length > 0
      ) {
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
            envList.push(sanitizeEnvironment(envData));
          }
        }
      }

      // If no environment exists, create a default one
      if (envList.length === 0) {
        const defaultEnv = createDefaultEnvironment('MockPulse Demo');
        const storagePath = await apiService.buildStorageFilePath(
          defaultEnv.uuid
        );
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
        setActiveEnvironmentUuid(
          loadedSettings.activeEnvironmentUuid || envList[0]?.uuid || null
        );
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
    return (
      environments.find((e) => e.uuid === activeEnvironmentUuid) ||
      environments[0] ||
      null
    );
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

  const setThemeMode = useCallback(
    (mode: 'light' | 'dark') => {
      setThemeModeState(mode);
      updateSettings({ themeMode: mode });
    },
    [updateSettings]
  );

  const setThemePreset = useCallback(
    (preset: ThemePresetKey) => {
      setThemePresetState(preset);
      updateSettings({ themePreset: preset as any });
    },
    [updateSettings]
  );

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      setLocaleState(newLocale);
      updateSettings({ locale: newLocale });
    },
    [updateSettings]
  );

  const setLayoutDensity = useCallback(
    (density: LayoutDensity) => {
      setLayoutDensityState(density);
      updateSettings({ layoutDensity: density });
    },
    [updateSettings]
  );

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const setNavTabsOrder = useCallback(
    (order: string[]) => {
      setNavTabsOrderState(order);
      updateSettings({ navTabsOrder: order });
    },
    [updateSettings]
  );

  const setMainMenuSize = useCallback(
    (size: number) => {
      const clamped = Math.max(160, Math.min(450, Math.round(size)));
      setMainMenuSizeState(clamped);
      updateSettings({ mainMenuSize: clamped });
    },
    [updateSettings]
  );

  const setSecondaryMenuSize = useCallback(
    (size: number) => {
      const clamped = Math.max(240, Math.min(600, Math.round(size)));
      setSecondaryMenuSizeState(clamped);
      updateSettings({ secondaryMenuSize: clamped });
    },
    [updateSettings]
  );

  // Update Environment
  const updateActiveEnvironment = useCallback(
    (updater: (prev: Environment) => Environment) => {
      if (!activeEnvironment) return;

      setEnvironments((prevEnvs) => {
        const idx = prevEnvs.findIndex(
          (e) => e.uuid === activeEnvironment.uuid
        );
        if (idx === -1) return prevEnvs;

        const updated = updater({ ...prevEnvs[idx] });
        const nextEnvs = [...prevEnvs];
        nextEnvs[idx] = updated;

        // Find descriptor
        if (settings) {
          const desc = settings.environments.find(
            (d) => d.uuid === updated.uuid
          );
          if (desc) {
            apiService.writeEnvironment(
              updated,
              desc,
              settings.storagePrettyPrint
            );
          }
        }

        // Hot reload running server
        apiService.updateEnvironments(nextEnvs);

        return nextEnvs;
      });
    },
    [activeEnvironment, settings]
  );

  // Create Environment
  const createEnvironment = useCallback(async () => {
    const maxPort = environments.reduce(
      (max, env) => Math.max(max, env.port || 3000),
      2999
    );
    const newPort = maxPort + 1;
    const newEnv = createDefaultEnvironment(
      `API Env ${environments.length + 1}`
    );
    newEnv.port = newPort;
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
      const recent: RecentLocalEnvironment = {
        name: newEnv.name,
        path: filePath
      };
      const recentList = [
        recent,
        ...(settings.recentLocalEnvironments || []).filter((r) => r.path !== filePath)
      ].slice(0, 10);

      const nextSettings: Settings = {
        ...settings,
        environments: [...settings.environments, desc],
        activeEnvironmentUuid: newEnv.uuid,
        recentLocalEnvironments: recentList
      };
      setSettings(nextSettings);
      await apiService.writeSettings(nextSettings);
    }
  }, [environments, settings]);

  // Open Local Environment
  const importEnvironment = useCallback(async () => {
    const res = await apiService.showOpenDialog({
      title: 'Open Local Environment JSON',
      filters: [{ name: 'Mockoon / MockPulse JSON Environment', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (!res.canceled && res.filePaths?.[0]) {
      const filePath = res.filePaths[0];

      // Check if already open by file path
      const existingDesc = settings?.environments.find((d) => d.path === filePath);
      if (existingDesc) {
        const existingEnv = environments.find((e) => e.uuid === existingDesc.uuid);
        if (existingEnv) {
          setActiveEnvironmentUuid(existingEnv.uuid);
          return;
        }
      }

      const data = await apiService.readEnvironment(filePath);
      if (data) {
        const cleanData = sanitizeEnvironment(data);
        const desc: EnvironmentDescriptor = {
          uuid: cleanData.uuid,
          path: filePath,
          cloud: false,
          lastServerHash: null
        };
        await apiService.writeEnvironment(cleanData, desc, true);

        const nextEnvs = [...environments.filter((e) => e.uuid !== cleanData.uuid), cleanData];
        setEnvironments(nextEnvs);
        setActiveEnvironmentUuid(cleanData.uuid);

        if (settings) {
          const recent: RecentLocalEnvironment = {
            name: cleanData.name,
            path: filePath
          };
          const recentList = [
            recent,
            ...(settings.recentLocalEnvironments || []).filter((r) => r.path !== filePath)
          ].slice(0, 10);

          const nextSettings: Settings = {
            ...settings,
            environments: [...settings.environments.filter((d) => d.uuid !== cleanData.uuid), desc],
            activeEnvironmentUuid: cleanData.uuid,
            recentLocalEnvironments: recentList
          };
          setSettings(nextSettings);
          await apiService.writeSettings(nextSettings);
        }
      }
    }
  }, [environments, settings]);

  // New Environment from OpenAPI/Swagger
  const createEnvironmentFromOpenApi = useCallback(async () => {
    const res = await apiService.showOpenDialog({
      title: 'Open OpenAPI / Swagger Specification',
      filters: [
        { name: 'OpenAPI / Swagger File', extensions: ['json', 'yaml', 'yml'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!res.canceled && res.filePaths?.[0]) {
      const filePath = res.filePaths[0];
      const content = await apiService.readFile(filePath);
      if (content) {
        try {
          const converter = new OpenApiConverter();
          const maxPort = environments.reduce(
            (max, env) => Math.max(max, env.port || 3000),
            2999
          );
          const newPort = maxPort + 1;
          const converted = await converter.convertFromOpenAPI(content, newPort);
          if (converted) {
            const cleanData = sanitizeEnvironment(converted);
            cleanData.uuid = 'env_' + Math.random().toString(36).substring(2, 10);
            const storagePath = await apiService.buildStorageFilePath(cleanData.uuid);
            const desc: EnvironmentDescriptor = {
              uuid: cleanData.uuid,
              path: storagePath,
              cloud: false,
              lastServerHash: null
            };
            await apiService.writeEnvironment(cleanData, desc, true);

            const nextEnvs = [...environments, cleanData];
            setEnvironments(nextEnvs);
            setActiveEnvironmentUuid(cleanData.uuid);

            if (settings) {
              const recent: RecentLocalEnvironment = {
                name: cleanData.name,
                path: storagePath
              };
              const recentList = [
                recent,
                ...(settings.recentLocalEnvironments || []).filter((r) => r.path !== storagePath)
              ].slice(0, 10);

              const nextSettings: Settings = {
                ...settings,
                environments: [...settings.environments, desc],
                activeEnvironmentUuid: cleanData.uuid,
                recentLocalEnvironments: recentList
              };
              setSettings(nextSettings);
              await apiService.writeSettings(nextSettings);
            }
          }
        } catch (err: any) {
          console.error('Failed to import OpenAPI/Swagger:', err);
          alert(err?.message || 'Failed to parse OpenAPI/Swagger specification file.');
        }
      }
    }
  }, [environments, settings]);

  // Open Recent Environment
  const openRecentEnvironment = useCallback(
    async (path: string) => {
      // 1. Check if already open
      const existingDesc = settings?.environments.find((desc) => desc.path === path);
      if (existingDesc) {
        const existingEnv = environments.find((e) => e.uuid === existingDesc.uuid);
        if (existingEnv) {
          setActiveEnvironmentUuid(existingEnv.uuid);
          return;
        }
      }

      // 2. Load from disk
      const envData = await apiService.readEnvironment(path);
      if (envData) {
        const cleanData = sanitizeEnvironment(envData);
        const desc: EnvironmentDescriptor = {
          uuid: cleanData.uuid,
          path,
          cloud: false,
          lastServerHash: null
        };
        await apiService.writeEnvironment(cleanData, desc, true);

        const nextEnvs = [...environments.filter((e) => e.uuid !== cleanData.uuid), cleanData];
        setEnvironments(nextEnvs);
        setActiveEnvironmentUuid(cleanData.uuid);

        if (settings) {
          const existingDescs = settings.environments.filter((d) => d.uuid !== cleanData.uuid && d.path !== path);
          const recent: RecentLocalEnvironment = {
            name: cleanData.name,
            path
          };
          const recentList = [
            recent,
            ...(settings.recentLocalEnvironments || []).filter((r) => r.path !== path)
          ].slice(0, 10);

          const nextSettings: Settings = {
            ...settings,
            environments: [...existingDescs, desc],
            activeEnvironmentUuid: cleanData.uuid,
            recentLocalEnvironments: recentList
          };
          setSettings(nextSettings);
          await apiService.writeSettings(nextSettings);
        }
      } else {
        alert(`无法读取文件或文件已不存在:\n${path}`);
      }
    },
    [environments, settings]
  );

  // Clear Recent Environments
  const clearRecentEnvironments = useCallback(async () => {
    if (settings) {
      const nextSettings: Settings = {
        ...settings,
        recentLocalEnvironments: []
      };
      setSettings(nextSettings);
      await apiService.writeSettings(nextSettings);
    }
  }, [settings]);

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
  const duplicateEnvironment = useCallback(
    async (uuid: string) => {
      const target = environments.find((e) => e.uuid === uuid);
      if (!target) return;

      const copy: Environment = sanitizeEnvironment(
        JSON.parse(JSON.stringify(target))
      );
      const maxPort = environments.reduce(
        (max, env) => Math.max(max, env.port || 3000),
        2999
      );
      copy.uuid = 'env_' + Math.random().toString(36).substring(2, 10);
      copy.name = `${copy.name} (Copy)`;
      copy.port = maxPort + 1;

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
    },
    [environments, settings]
  );

  // Delete Environment
  const deleteEnvironment = useCallback(
    async (uuid: string) => {
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
    },
    [environments, serverStatuses, settings]
  );

  // Toggle Server
  const toggleServer = useCallback(
    async (uuid: string) => {
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
    },
    [environments, settings, serverStatuses]
  );

  // Clear Logs
  const clearLogs = useCallback((uuid: string) => {
    setServerLogs((prev) => ({ ...prev, [uuid]: [] }));
  }, []);

  // Add Route (HTTP, CRUD, WS)
  const addRoute = useCallback(
    (type: 'http' | 'crud' | 'ws' = 'http') => {
      if (!activeEnvironment) return;
      let newRoute: Route;
      if (type === 'crud') {
        const firstBucketId = activeEnvironment.data?.[0]?.id || '';
        newRoute = {
          ...BuildCRUDRoute(true, {
            endpoint: 'new-crud',
            databucketID: firstBucketId
          }),
          endpoint: 'new-crud',
          documentation: 'CRUD Route'
        };
      } else if (type === 'ws') {
        newRoute = {
          ...BuildWebSocketRoute(true, {
            endpoint: 'ws',
            body: '{\n  "message": "WS Hello"\n}'
          }),
          endpoint: 'ws',
          documentation: 'WebSocket Route'
        };
      } else {
        newRoute = {
          ...BuildHTTPRoute(true, {
            endpoint: 'new-endpoint',
            body: '{\n  "message": "Hello from MockPulse"\n}'
          }),
          endpoint: 'new-endpoint',
          documentation: ''
        };
      }

      updateActiveEnvironment((env) => ({
        ...env,
        routes: [...env.routes, newRoute],
        rootChildren: [
          ...(env.rootChildren || []),
          { type: 'route', uuid: newRoute.uuid }
        ]
      }));
      setSelectedRouteUuid(newRoute.uuid);
      setActiveTabKey('routes');
    },
    [activeEnvironment, updateActiveEnvironment]
  );

  // Duplicate Route
  const duplicateRoute = useCallback(
    (routeUuid: string) => {
      if (!activeEnvironment) return;
      const targetIdx = activeEnvironment.routes.findIndex(
        (r) => r.uuid === routeUuid
      );
      if (targetIdx === -1) return;
      const source = activeEnvironment.routes[targetIdx];

      const duplicated: Route = {
        ...JSON.parse(JSON.stringify(source)),
        uuid: 'route_' + Math.random().toString(36).substring(2, 10),
        endpoint: `${source.endpoint}-copy`,
        documentation: source.documentation
          ? `${source.documentation} (Copy)`
          : 'Copy',
        responses: (source.responses || []).map((resp: any) => ({
          ...resp,
          uuid: 'resp_' + Math.random().toString(36).substring(2, 10)
        }))
      };

      const nextRoutes = [...activeEnvironment.routes];
      nextRoutes.splice(targetIdx + 1, 0, duplicated);

      // Also insert into rootChildren or container folder
      let nextRootChildren = [...(activeEnvironment.rootChildren || [])];
      const rootIdx = nextRootChildren.findIndex((c) => c.uuid === routeUuid);
      if (rootIdx !== -1) {
        nextRootChildren.splice(rootIdx + 1, 0, {
          type: 'route',
          uuid: duplicated.uuid
        });
      } else {
        nextRootChildren.push({ type: 'route', uuid: duplicated.uuid });
      }

      updateActiveEnvironment((env) => ({
        ...env,
        routes: nextRoutes,
        rootChildren: nextRootChildren
      }));
      setSelectedRouteUuid(duplicated.uuid);
      setActiveTabKey('routes');
    },
    [activeEnvironment, updateActiveEnvironment]
  );

  // Add Folder
  const addFolder = useCallback(
    (name = 'New folder') => {
      if (!activeEnvironment) return;
      const newFolder = BuildFolder();
      newFolder.name = name;
      updateActiveEnvironment((env) => ({
        ...env,
        folders: [...(env.folders || []), newFolder],
        rootChildren: [
          ...(env.rootChildren || []),
          { type: 'folder', uuid: newFolder.uuid }
        ]
      }));
    },
    [activeEnvironment, updateActiveEnvironment]
  );

  // Update Folder
  const updateFolder = useCallback(
    (folderUuid: string, partial: Partial<Folder>) => {
      if (!activeEnvironment) return;
      updateActiveEnvironment((env) => ({
        ...env,
        folders: (env.folders || []).map((f) =>
          f.uuid === folderUuid ? { ...f, ...partial } : f
        )
      }));
    },
    [activeEnvironment, updateActiveEnvironment]
  );

  // Delete Folder
  const deleteFolder = useCallback(
    (folderUuid: string) => {
      if (!activeEnvironment) return;
      const targetFolder = (activeEnvironment.folders || []).find(
        (f) => f.uuid === folderUuid
      );
      const childRoutes =
        targetFolder?.children.filter((c) => c.type === 'route') || [];

      updateActiveEnvironment((env) => ({
        ...env,
        folders: (env.folders || []).filter((f) => f.uuid !== folderUuid),
        rootChildren: [
          ...(env.rootChildren || []).filter((c) => c.uuid !== folderUuid),
          ...childRoutes
        ]
      }));
    },
    [activeEnvironment, updateActiveEnvironment]
  );

  // Delete Route
  const deleteRoute = useCallback(
    (routeUuid: string) => {
      if (!activeEnvironment) return;
      updateActiveEnvironment((env) => ({
        ...env,
        routes: env.routes.filter((r) => r.uuid !== routeUuid),
        rootChildren: (env.rootChildren || []).filter(
          (c) => c.uuid !== routeUuid
        ),
        folders: (env.folders || []).map((f) => ({
          ...f,
          children: f.children.filter((c) => c.uuid !== routeUuid)
        }))
      }));
      if (selectedRouteUuid === routeUuid) {
        const remaining = activeEnvironment.routes.filter(
          (r) => r.uuid !== routeUuid
        );
        setSelectedRouteUuid(remaining[0]?.uuid || null);
      }
    },
    [activeEnvironment, selectedRouteUuid, updateActiveEnvironment]
  );

  // Auto select first route if none selected
  useEffect(() => {
    if (activeEnvironment && activeEnvironment.routes.length > 0) {
      if (
        !selectedRouteUuid ||
        !activeEnvironment.routes.some((r) => r.uuid === selectedRouteUuid)
      ) {
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
        duplicateRoute,
        deleteRoute,
        addFolder,
        updateFolder,
        deleteFolder,
        setActiveEnvironmentUuid,
        updateActiveEnvironment,
        createEnvironment,
        importEnvironment,
        createEnvironmentFromOpenApi,
        openRecentEnvironment,
        clearRecentEnvironments,
        recentLocalEnvironments: settings?.recentLocalEnvironments || [],
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
        setNavTabsOrder,
        mainMenuSize,
        setMainMenuSize,
        secondaryMenuSize,
        setSecondaryMenuSize
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
