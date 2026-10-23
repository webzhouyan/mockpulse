import { FakerAvailableLocales } from '@mockoon/commons';

export enum DeployRegions {
  US = 'us',
  CA = 'ca',
  EU = 'eu',
  ASIA = 'asia',
  AU = 'au',
  SA = 'sa'
}

export type EnvironmentDescriptor = {
  uuid: string;
  path: string;
  // is it a cloud environment?
  cloud: boolean;
  // last hash seen on the server
  lastServerHash: string | null;
};

export enum FileWatcherOptions {
  DISABLED = 'disabled',
  PROMPT = 'prompt',
  AUTO = 'auto'
}

export type EnvironmentsCategories = 'cloud' | 'local';

export type RecentLocalEnvironment = {
  name: string;
  path: string;
};

export type Settings = {
  welcomeShown: boolean;
  apiUrl: string;
  maxLogsPerEnvironment: number;
  truncateRouteName: boolean;
  mainMenuSize: number;
  secondaryMenuSize: number;
  fakerLocale: FakerAvailableLocales;
  fakerSeed: number;
  lastChangelog: string;
  environments: EnvironmentDescriptor[];
  disabledRoutes: Record<string, string[]>;
  collapsedFolders: Record<string, string[]>;
  storagePrettyPrint: boolean;
  fileWatcherEnabled: FileWatcherOptions;
  dialogWorkingDir: string;
  startEnvironmentsOnLoad: boolean;
  logTransactions: boolean;
  environmentsCategoriesOrder: EnvironmentsCategories[];
  environmentsCategoriesCollapsed: Record<EnvironmentsCategories, boolean>;
  envVarsPrefix: string;
  activeEnvironmentUuid: string | null;
  enableRandomLatency: boolean;
  recentLocalEnvironments: RecentLocalEnvironment[];
  displayLogsIsoTimestamp: boolean;
  deployPreferredRegion: DeployRegions;
  commandPaletteRecentCommands: string[];
  themeMode?: 'system' | 'light' | 'dark';
  themePreset?: 'deep-navy' | 'charcoal' | 'cyberpunk' | 'moonlight' | 'warm-sand' | 'custom';
  customPrimaryColor?: string;
  locale?: 'system' | 'zh-CN' | 'en';
  layoutDensity?: 'compact' | 'comfortable';
  navTabsOrder?: string[];
};
