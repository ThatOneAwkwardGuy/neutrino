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

export const generateRandomNLengthString = length => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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

  return win;
};

export const setProxyForSession = (proxy, win, session) => {
  const proxyArray = proxy.includes('http://')
    ? proxy.split('http://')[1].split(/@|:/)
    : proxy.split(/@|:/);

  if (proxyArray.length === 4) {
    win.webContents.on('login', (event, request, authInfo, callback) => {
      event.preventDefault();
      callback(proxyArray[0], proxyArray[1]);
    });
  }
  const proxyIpAndPort = proxyArray.slice(-2);
  return session.setProxy({
    proxyRules: `${proxyIpAndPort[0]}:${proxyIpAndPort[1]},direct://`
  });
};

export const setProxyForWindow = (proxy, win) => {
  const proxyArray = proxy.includes('http://')
    ? proxy.split('http://')[1].split(/@|:/)
    : proxy.split(/@|:/);

  if (proxyArray.length === 4) {
    win.webContents.on('login', (event, request, authInfo, callback) => {
      event.preventDefault();

      callback(proxyArray[0], proxyArray[1]);
    });
  }
  const proxyIpAndPort = proxyArray.slice(-2);

  return win.webContents.session.setProxy({
    proxyRules: `${proxyIpAndPort[0]}:${proxyIpAndPort[1]},direct://`
  });
};
