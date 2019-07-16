const { remote } = require('electron');
const { BrowserWindow } = require('electron').remote;
const uuidv4 = require('uuid/v4');

export const testAccount = (index, account, setAccountStatus) => {
  if (setAccountStatus) {
    setAccountStatus(index, 'Logging In');
  }
  const tokenID = uuidv4();
  const win = new BrowserWindow({
    width: 500,
    height: 650,
    show: true,
    frame: true,
    resizable: true,
    focusable: true,
    minimizable: true,
    closable: true,
    allowRunningInsecureContent: true,
    webPreferences: {
      webviewTag: true,
      allowRunningInsecureContent: true,
      nodeIntegration: true,
      webSecurity: false,
      session: remote.session.fromPartition(`account-${tokenID}`)
    }
  });
  win.webContents.once('close', () => {
    setAccountStatus(index, 'Not Started');
  });
  win.loadURL('https://google.com');
  win.webContents.once('did-finish-load', () => {
    win.webContents.executeJavaScript(
      'document.querySelector(\'a[target="_top"]\').click();'
    );
    win.webContents.once('did-finish-load', () => {
      win.webContents.executeJavaScript(`
                  document.getElementById("Email").value = "${account.email}";
                  document.getElementById("next").click();
                  `);
      win.webContents.once('did-navigate-in-page', () => {
        win.webContents.executeJavaScript(`
                    var passwdObserver = new MutationObserver(function(mutations, me) {
                      var canvas = document.getElementById("Passwd");
                      if (canvas) {
                        canvas.value = "${account.pass}";
                        document.getElementById("signIn").click();
                        me.disconnect();
                        return;
                      }
                    });
                    passwdObserver.observe(document, {
                        childList: true,
                        attributes:true,
                        subtree: true,
                        characterData: true
                    })
                    `);
        win.webContents.once('did-finish-load', () => {
          win.webContents.executeJavaScript(
            'window.location',
            false,
            windowLocation1 => {
              if (windowLocation1.pathname === '/') {
                win.webContents.session.cookies.get({}, () => {
                  win.loadURL('https://neutrinotools.app/captcha');
                  win.webContents.once('dom-ready', () => {
                    win.webContents.executeJavaScript(
                      'grecaptcha.execute()',
                      false,
                      () => {}
                    );
                    win.webContents.once('did-navigate-in-page', () => {
                      win.webContents.executeJavaScript(
                        'window.location.hash',
                        false,
                        windowLocation2 => {
                          if (windowLocation2 === '#success') {
                            if (setAccountStatus) {
                              setAccountStatus(index, 'One Click Success');
                            }
                          } else if (setAccountStatus) {
                            setAccountStatus(index, 'One Click Fail');
                          }
                          win.webContents.removeAllListeners('close', () => {});
                          win.close();
                        }
                      );
                    });
                  });
                });
              } else if (setAccountStatus) {
                setAccountStatus(index, 'Stuck In Login');
              }
            }
          );
        });
      });
    });
  });
  return win;
};

export const bs = '';