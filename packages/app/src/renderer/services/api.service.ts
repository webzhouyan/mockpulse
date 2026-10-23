import { Environment, Environments, Transaction } from '@mockoon/commons';
import { Settings, EnvironmentDescriptor } from 'src/shared/models/settings.model';

declare global {
  interface Window {
    api?: {
      send: (channel: string, ...data: any[]) => void;
      invoke: (channel: string, ...data: any[]) => Promise<any>;
      receive: (channel: string, callback: (...args: any[]) => any) => void;
    };
  }
}

export type ServerEventCallback = (
  environmentUuid: string,
  event: 'started' | 'stopped' | 'entering-request' | 'transaction-complete' | 'error',
  data?: any
) => void;

class ApiService {
  private hasElectron = typeof window !== 'undefined' && !!window.api;
  private serverEventListeners: ServerEventCallback[] = [];
  private menuEventListeners: ((action: string) => void)[] = [];

  constructor() {
    if (this.hasElectron && window.api?.receive) {
      window.api.receive('APP_SERVER_EVENT', (uuid: string, event: any, data: any) => {
        this.serverEventListeners.forEach((cb) => cb(uuid, event, data));
      });
      window.api.receive('APP_MENU', (action: string) => {
        this.menuEventListeners.forEach((cb) => cb(action));
      });
    }
  }

  public onServerEvent(callback: ServerEventCallback) {
    this.serverEventListeners.push(callback);
    return () => {
      this.serverEventListeners = this.serverEventListeners.filter((cb) => cb !== callback);
    };
  }

  public onMenuEvent(callback: (action: string) => void) {
    this.menuEventListeners.push(callback);
    return () => {
      this.menuEventListeners = this.menuEventListeners.filter((cb) => cb !== callback);
    };
  }

  public updateMenuState(state: {
    environmentsCount: number;
    hasActiveEnvironment: boolean;
    activeEnvironmentRoutesCount: number;
    isActiveEnvironmentEditable: boolean;
  }) {
    if (this.hasElectron && window.api?.send) {
      window.api.send('APP_UPDATE_MENU_STATE', state);
    }
  }

  // --- Settings ---
  public async readSettings(): Promise<Settings | null> {
    if (this.hasElectron) {
      try {
        return await window.api!.invoke('APP_READ_SETTINGS_DATA');
      } catch (e) {
        console.error('Failed to read settings from electron:', e);
      }
    }
    const local = localStorage.getItem('mockpulse_settings');
    return local ? JSON.parse(local) : null;
  }

  public async writeSettings(settings: Settings): Promise<void> {
    if (this.hasElectron) {
      try {
        await window.api!.invoke('APP_WRITE_SETTINGS_DATA', settings, settings.storagePrettyPrint);
        return;
      } catch (e) {
        console.error('Failed to write settings to electron:', e);
      }
    }
    localStorage.setItem('mockpulse_settings', JSON.stringify(settings));
  }

  // --- Environment Data ---
  public async fetchUrl(url: string): Promise<string> {
    if (this.hasElectron) {
      return await window.api!.invoke('APP_FETCH_URL', url);
    }
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.text();
  }

  public async readFile(filePath: string): Promise<string | null> {
    if (this.hasElectron) {
      try {
        return await window.api!.invoke('APP_READ_FILE', filePath);
      } catch (e) {
        console.error(`Failed to read file from ${filePath}:`, e);
      }
    }
    return null;
  }

  public async readEnvironment(path: string): Promise<Environment | null> {
    if (this.hasElectron) {
      try {
        return await window.api!.invoke('APP_READ_ENVIRONMENT_DATA', path);
      } catch (e) {
        console.error(`Failed to read environment from ${path}:`, e);
      }
    }
    const saved = localStorage.getItem(`mockpulse_env_${path}`);
    return saved ? JSON.parse(saved) : null;
  }

  public async writeEnvironment(
    environment: Environment,
    descriptor: EnvironmentDescriptor,
    storagePrettyPrint = true
  ): Promise<void> {
    if (this.hasElectron) {
      try {
        await window.api!.invoke('APP_WRITE_ENVIRONMENT_DATA', environment, descriptor, storagePrettyPrint);
        return;
      } catch (e) {
        console.error('Failed to write environment to electron:', e);
      }
    }
    localStorage.setItem(`mockpulse_env_${descriptor.path}`, JSON.stringify(environment));
  }

  public async buildStorageFilePath(name: string): Promise<string> {
    if (this.hasElectron) {
      try {
        return await window.api!.invoke('APP_BUILD_STORAGE_FILEPATH', name);
      } catch (e) {
        console.error('Failed to build storage path:', e);
      }
    }
    return `storage_${name}_${Date.now()}.json`;
  }

  // --- Server lifecycle ---
  public async startServer(environment: Environment, environmentPath: string): Promise<void> {
    if (this.hasElectron) {
      await window.api!.invoke('APP_START_SERVER', environment, environmentPath);
    } else {
      setTimeout(() => {
        this.serverEventListeners.forEach((cb) => cb(environment.uuid, 'started', { adminApiAuthToken: 'mock-token' }));
      }, 300);
    }
  }

  public async stopServer(environmentUuid: string): Promise<void> {
    if (this.hasElectron) {
      await window.api!.invoke('APP_STOP_SERVER', environmentUuid);
    } else {
      setTimeout(() => {
        this.serverEventListeners.forEach((cb) => cb(environmentUuid, 'stopped'));
      }, 300);
    }
  }

  public updateEnvironments(environments: Environments): void {
    if (this.hasElectron) {
      window.api!.send('APP_UPDATE_ENVIRONMENTS', environments);
    }
  }

  public updateDisabledRoutes(disabledRoutes: Record<string, string[]>): void {
    if (this.hasElectron && window.api?.send) {
      window.api.send('APP_UPDATE_DISABLED_ROUTES', disabledRoutes);
    }
  }

  // --- Dialogs ---
  public async showOpenDialog(options: any): Promise<{ canceled: boolean; filePaths: string[] }> {
    if (this.hasElectron) {
      return await window.api!.invoke('APP_SHOW_OPEN_DIALOG', options);
    }
    return { canceled: true, filePaths: [] };
  }

  public async showSaveDialog(options: any): Promise<{ canceled: boolean; filePath?: string }> {
    if (this.hasElectron) {
      return await window.api!.invoke('APP_SHOW_SAVE_DIALOG', options);
    }
    return { canceled: true };
  }

  // --- System Utilities ---
  public writeClipboard(text: string): void {
    if (this.hasElectron) {
      window.api!.send('APP_WRITE_CLIPBOARD', text);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }

  public showFolder(name: 'storage' | 'logs'): void {
    if (this.hasElectron) {
      window.api!.send('APP_SHOW_FOLDER', name);
    }
  }

  public showFile(filePath: string): void {
    if (this.hasElectron) {
      window.api!.send('APP_SHOW_FILE', filePath);
    }
  }
}

export const apiService = new ApiService();

