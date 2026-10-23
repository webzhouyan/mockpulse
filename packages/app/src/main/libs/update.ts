import { BrowserWindow } from 'electron';

/**
 * Pure local offline mode: no external update check
 */
export const checkForUpdate = async (_mainWindow: BrowserWindow) => {
  // Offline: do not check external releases
};

export const applyUpdate = () => {
  // Offline: noop
};
