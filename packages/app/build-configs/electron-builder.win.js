const commonConfig = require('./electron-builder.common');

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = Object.assign({}, commonConfig, {
  win: {
    target: [
      { target: 'nsis', arch: ['x64'] },
      { target: 'portable', arch: ['x64'] }
    ],
    icon: 'build-res/icon.ico'
  },
  nsis: {
    artifactName: 'MockPulse-${version}.${ext}',
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  portable: {
    artifactName: 'MockPulse-portable-${version}.${ext}'
  }
});

module.exports = config;
