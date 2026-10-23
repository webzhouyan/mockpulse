/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.mockpulse.desktop',
  productName: 'MockPulse',
  extraMetadata: { name: 'mockpulse' },
  directories: {
    output: 'packages',
    buildResources: 'build-res'
  },
  files: [
    'package.json',
    'dist/**/*',
    'node_modules',
    'build-res/icon.ico',
    'build-res/icon_512x512x32.png'
  ],
  protocols: [
    {
      name: 'MockPulse',
      schemes: ['mockpulse'],
      role: 'Editor'
    }
  ]
};

module.exports = config;
