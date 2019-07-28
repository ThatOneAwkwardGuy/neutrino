require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  const appName = context.packager.appInfo.productFilename;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const notarised = await notarize({
    appBundleId: 'com.neutrino.bot',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS
  });

  return notarised;
};
