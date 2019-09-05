import { remote } from 'electron';

export const upperCaseFirst = string =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const generateUEID = () => {
  let first = Math.random() * 46656;
  let second = Math.random() * 46656;
  first = `000${first.toString(36)}`.slice(-3);
  second = `000${second.toString(36)}`.slice(-3);
  return first + second;
};

export const createNewWindow = async (tokenID, proxy) => {
  const { BrowserWindow } = remote;
  const win = new BrowserWindow({
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
    await setProxyForWindow(proxy, win);
  }
  console.log(win);
  return win;
};

export const setProxyForWindow = (proxy, win) =>
  new Promise((resolve, reject) => {
    try {
      const proxyArray = proxy.includes('http://')
        ? proxy.split('http://')[1].split(/@|:/)
        : proxy.split(/@|:/);
      console.log(proxyArray);
      if (proxyArray.length === 4) {
        win.webContents.on('login', (event, request, authInfo, callback) => {
          console.log(authInfo);
          event.preventDefault();
          console.log('logging in');
          console.log(proxyArray[0], proxyArray[1]);
          callback(proxyArray[0], proxyArray[1]);
        });
      }
      const proxyIpAndPort = proxyArray.slice(-2);
      console.log(proxyIpAndPort);
      win.webContents.session.setProxy(
        { proxyRules: `${proxyIpAndPort[0]}:${proxyIpAndPort[1]},direct://` },
        () => {
          resolve();
        }
      );
    } catch (error) {
      reject(error);
    }
  });
