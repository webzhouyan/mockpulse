const commonConfig = require('./electron-builder.common');

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = Object.assign({}, commonConfig, {
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['arm64', 'x64']
      },
      {
        target: 'zip',
        arch: ['arm64', 'x64']
      }
    ],
    identity: null,
    type: 'distribution',
    artifactName: 'MockPulse-${version}.${arch}.${ext}'
  },
  dmg: {
    sign: false
  }
});

module.exports = config;
