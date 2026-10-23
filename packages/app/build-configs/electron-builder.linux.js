const commonConfig = require('./electron-builder.common');

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = Object.assign({}, commonConfig, {
  linux: {
    executableName: 'mockpulse',
    syncDesktopName: true,
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      },
      {
        target: 'rpm',
        arch: ['x64']
      }
    ],
    category: 'Development',
    icon: 'build-res',
    artifactName: 'MockPulse-${version}.${arch}.${ext}',
    desktop: {
      entry: {
        Name: 'MockPulse',
        Type: 'Application',
        Categories: 'Development'
      }
    }
  },
  rpm: {
    fpm: ['--rpm-rpmbuild-define', '_build_id_links none']
  }
});

module.exports = config;
