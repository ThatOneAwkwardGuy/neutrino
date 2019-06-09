const remote = require('electron').remote;
const { BrowserWindow } = require('electron').remote;

export const createNewWindow = (tokenID, proxy) => {
  let win = new BrowserWindow({
    width: 500,
    height: 650,
    show: true,
    frame: true,
    resizable: true,
    focusable: true,
    minimizable: true,
    closable: true,
    webPreferences: {
      webviewTag: true,
      allowRunningInsecureContent: true,
      nodeIntegration: true,
      webSecurity: false,
      session: remote.session.fromPartition(`activity-${tokenID}`)
    }
  });
  if (proxy !== '' && proxy !== undefined) {
    this.setProxyForWindow(proxy, win);
  }
  return win;
};

export const setProxyForWindow = async (proxy, win) => {
  return await new Promise((resolve, reject) => {
    const proxyArray = proxy.split(/@|:/);
    if (proxyArray.length === 4) {
      win.webContents.session.on('login', (event, webContents, request, authInfo, callback) => {
        callback(proxyArray[0], proxyArray[1]);
      });
    }
    const proxyIpAndPort = proxyArray.slice(-2);
    win.webContents.session.setProxy({ proxyRules: `${proxyIpAndPort[0]}:${proxyIpAndPort[1]},direct://` }, () => {
      resolve();
    });
  });
};
