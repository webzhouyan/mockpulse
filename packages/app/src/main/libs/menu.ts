import {
  app,
  BrowserWindow,
  dialog,
  Menu,
  MenuItemConstructorOptions,
  shell
} from 'electron';
import { Config } from 'src/main/config';
import { showFolderInExplorer } from 'src/main/libs/paths';
import {
  handleZoomIn,
  handleZoomOut,
  handleZoomReset
} from 'src/main/libs/zoom';
import { MenuStateUpdatePayload } from 'src/shared/models/ipc.model';

export const createMenu = (mainWindow: BrowserWindow): Menu => {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    // 1. Application Menu (macOS only)
    ...(isMac
      ? [
          {
            label: 'MockPulse',
            submenu: [
              {
                id: 'MENU_ABOUT',
                label: '关于 MockPulse (About)',
                click: () => {
                  dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'About MockPulse',
                    message: 'MockPulse',
                    detail: `版本 (Version): ${Config.appVersion}\n一款现代化、轻量高效的本地模拟接口调试工具。\nA modern, lightweight, high-performance mock API server for local development.`,
                    buttons: ['确定 (OK)']
                  });
                }
              },
              { type: 'separator' as const },
              {
                id: 'MENU_OPEN_SETTINGS',
                label: '偏好设置... (Settings)',
                accelerator: 'CmdOrCtrl+,',
                click: () => {
                  mainWindow.webContents.send('APP_MENU', 'OPEN_SETTINGS');
                }
              },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const, label: '隐藏 MockPulse (Hide)' },
              { role: 'hideOthers' as const, label: '隐藏其他 (Hide Others)' },
              { role: 'unhide' as const, label: '全部显示 (Show All)' },
              { type: 'separator' as const },
              { role: 'quit' as const, label: '退出 MockPulse (Quit)' }
            ]
          }
        ]
      : []),

    // 2. File Menu
    {
      label: 'File',
      submenu: [
        {
          id: 'MENU_NEW_ENVIRONMENT',
          label: '新建环境 (New Environment)',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('APP_MENU', 'NEW_ENVIRONMENT');
          }
        },
        {
          id: 'MENU_OPEN_ENVIRONMENT',
          label: '导入环境 JSON (Import Environment)...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('APP_MENU', 'OPEN_ENVIRONMENT');
          }
        },
        {
          id: 'MENU_DUPLICATE_ENVIRONMENT',
          label: '复制当前环境 (Duplicate Environment)',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('APP_MENU', 'DUPLICATE_ENVIRONMENT');
          }
        },
        { type: 'separator' as const },
        {
          id: 'MENU_PREVIOUS_ENVIRONMENT',
          label: '切换至上一个环境 (Previous Environment)',
          accelerator: 'CmdOrCtrl+Up',
          click: () => {
            mainWindow.webContents.send('APP_MENU', 'PREVIOUS_ENVIRONMENT');
          }
        },
        {
          id: 'MENU_NEXT_ENVIRONMENT',
          label: '切换至下一个环境 (Next Environment)',
          accelerator: 'CmdOrCtrl+Down',
          click: () => {
            mainWindow.webContents.send('APP_MENU', 'NEXT_ENVIRONMENT');
          }
        },
        { type: 'separator' as const },
        {
          id: 'MENU_CLOSE_ENVIRONMENT',
          label: '关闭/删除当前环境 (Close Active Environment)',
          accelerator: isMac ? 'CmdOrCtrl+W' : 'CmdOrCtrl+F4',
          click: () => {
            mainWindow.webContents.send('APP_MENU', 'CLOSE_ENVIRONMENT');
          }
        },
        ...(!isMac
          ? [
              { type: 'separator' as const },
              {
                id: 'MENU_OPEN_SETTINGS',
                label: '系统设置 (Settings)',
                accelerator: 'CmdOrCtrl+,',
                click: () => {
                  mainWindow.webContents.send('APP_MENU', 'OPEN_SETTINGS');
                }
              },
              { type: 'separator' as const },
              { role: 'quit' as const, label: '退出 (Exit)' }
            ]
          : [])
      ]
    },

    // 3. Edit Menu (Crucial for clipboard and copy-paste)
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const, label: '撤销 (Undo)' },
        { role: 'redo' as const, label: '重做 (Redo)' },
        { type: 'separator' as const },
        { role: 'cut' as const, label: '剪切 (Cut)' },
        { role: 'copy' as const, label: '复制 (Copy)' },
        { role: 'paste' as const, label: '粘贴 (Paste)' },
        { role: 'selectAll' as const, label: '全选 (Select All)' }
      ]
    },

    // 4. Routes Menu
    {
      label: 'Routes',
      submenu: [
        {
          id: 'MENU_NEW_ROUTE',
          label: '新建接口路由 (New Route)',
          accelerator: 'Shift+CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('APP_MENU', 'NEW_ROUTE');
          }
        },
        {
          id: 'MENU_DUPLICATE_ROUTE',
          label: '复制当前路由 (Duplicate Route)',
          accelerator: 'Shift+CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('APP_MENU', 'DUPLICATE_ROUTE');
          }
        },
        { type: 'separator' as const },
        {
          id: 'MENU_DELETE_ROUTE',
          label: '删除当前路由 (Delete Route)',
          accelerator: 'Alt+Shift+CmdOrCtrl+U',
          click: () => {
            mainWindow.webContents.send('APP_MENU', 'DELETE_ROUTE');
          }
        }
      ]
    },

    // 5. Run Menu
    {
      label: 'Run',
      submenu: [
        {
          id: 'MENU_START_ENVIRONMENT',
          label: '启动 / 停止当前服务 (Start/Stop Active Server)',
          accelerator: 'Shift+CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('APP_MENU', 'START_ENVIRONMENT');
          }
        },
        {
          id: 'MENU_START_ALL_ENVIRONMENTS',
          label: '启动 / 停止所有服务 (Start/Stop All Servers)',
          accelerator: 'Shift+CmdOrCtrl+A',
          click: () => {
            mainWindow.webContents.send('APP_MENU', 'START_ALL_ENVIRONMENTS');
          }
        }
      ]
    },

    // 6. View Menu
    {
      label: 'View',
      submenu: [
        {
          id: 'MENU_ZOOM_IN',
          label: '放大视图 (Zoom In)',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            handleZoomIn(mainWindow);
          }
        },
        {
          label: 'Zoom In (Key =)',
          accelerator: 'CmdOrCtrl+=',
          visible: false,
          click: () => {
            handleZoomIn(mainWindow);
          }
        },
        {
          id: 'MENU_ZOOM_OUT',
          label: '缩小视图 (Zoom Out)',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            handleZoomOut(mainWindow);
          }
        },
        {
          id: 'MENU_ZOOM_RESET',
          label: '重置缩放 (Reset Zoom)',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            handleZoomReset(mainWindow);
          }
        },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const, label: '切换全屏 (Toggle Full Screen)' },
        { role: 'toggleDevTools' as const, label: '开发者工具 (Developer Tools)' }
      ]
    },

    // 7. Tools Menu (Only practical local tools)
    {
      label: 'Tools',
      submenu: [
        {
          label: '打开本地数据存储目录 (Open Data Directory)',
          click: () => {
            showFolderInExplorer('userData');
          }
        },
        {
          label: '打开运行日志目录 (Open Logs Directory)',
          click: () => {
            showFolderInExplorer('logs');
          }
        }
      ]
    },

    // 8. Help Menu (Cleaned: removed external Mockoon dead links, points to GitHub repo)
    {
      label: 'Help',
      submenu: [
        {
          label: 'GitHub 项目主页 (GitHub Repository)',
          click: () => {
            shell.openExternal('https://github.com/webzhouyan/mockpulse');
          }
        },
        {
          label: '提交问题与建议 (Report an Issue)',
          click: () => {
            shell.openExternal('https://github.com/webzhouyan/mockpulse/issues');
          }
        },
        { type: 'separator' as const },
        {
          label: `MockPulse v${Config.appVersion}`,
          enabled: false
        }
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
};

const toggleMenuItems = (items: string[], enabled: boolean) => {
  const menu = Menu.getApplicationMenu();

  items.forEach((id) => {
    const menuItem = menu?.getMenuItemById(id);

    if (menuItem) {
      menuItem.enabled = enabled;
    }
  });
};

export const updateMenuState = (state: MenuStateUpdatePayload) => {
  toggleMenuItems(
    [
      'MENU_DUPLICATE_ENVIRONMENT',
      'MENU_START_ENVIRONMENT',
      'MENU_START_ALL_ENVIRONMENTS',
      'MENU_PREVIOUS_ENVIRONMENT',
      'MENU_NEXT_ENVIRONMENT'
    ],
    state.environmentsCount > 0
  );
  toggleMenuItems(['MENU_CLOSE_ENVIRONMENT'], state.hasActiveEnvironment);
  toggleMenuItems(
    ['MENU_NEW_ROUTE'],
    state.hasActiveEnvironment && state.isActiveEnvironmentEditable
  );
  toggleMenuItems(
    ['MENU_DUPLICATE_ROUTE', 'MENU_DELETE_ROUTE'],
    state.hasActiveEnvironment &&
      state.activeEnvironmentRoutesCount > 0 &&
      state.isActiveEnvironmentEditable
  );
};
