const { remote, ipcRenderer } = require('electron');

const focusedWebContents = remote.getCurrentWebContents();

let captchaChecker = null;
/* eslint-disable */
document.addEventListener('DOMNodeInserted', () => {
  if (!!window && !!!window.$) {
    window.$ = window.jQuery = require('jquery');
  }
});
/* eslint-enable */

const setCookiesInWindow = (webContents, cookies) =>
  new Promise(resolve => {
    if (cookies) {
      Object.keys(cookies).forEach(cookieSite => {
        const cookiesCookieSite = cookies[cookieSite]['/'];
        Object.keys(cookiesCookieSite).forEach(actualCookie => {
          const formattedCookie = {
            url: `https://${cookieSite}`,
            value: cookiesCookieSite[actualCookie].value,
            domain: cookiesCookieSite[actualCookie].domain,
            path: cookiesCookieSite[actualCookie].path,
            name: actualCookie
          };
          webContents.session.cookies.set(formattedCookie, error => {
            if (error !== null) {
              console.log(formattedCookie);
            }
          });
        });
      });
    }
    resolve();
  });

const checkCaptcha = async () => {
  try {
    const captchaJobs = remote.getGlobal('captchaQueue');
    const captchaJob = captchaJobs[focusedWebContents.id];
    let authToken = '';
    try {
      authToken = document.querySelector('input[name="authenticity_token"]')
        .value;
    } catch (error) {
      console.log(error);
    }
    if (captchaJob) {
      try {
        const tokenID = captchaJob.id;
        const { grecaptcha } = window;
        try {
          await grecaptcha.execute();
        } catch (error) {
          console.log(error);
        }
        const captchaToken = grecaptcha.getResponse();
        if (captchaToken !== '') {
          console.log(tokenID);
          ipcRenderer.send('send-captcha-token-from-preload-to-captcha', {
            ...captchaJob,
            url: document.location.href,
            captchaToken,
            authToken,
            id: tokenID,
            cookies: document.cookie
          });
          clearInterval(captchaChecker);
        }
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

ipcRenderer.on(
  `captcha-details-${focusedWebContents.id}`,
  async (event, args) => {
    await setCookiesInWindow(focusedWebContents, args.cookiesObject);
    ipcRenderer.send('store-captcha-job', focusedWebContents.id, args);
    window.location.href = args.url;
  }
);

if (window.location.href.split('/').slice(-1)[0] !== 'waiting.html') {
  captchaChecker = setInterval(checkCaptcha, 300);
}

// if (process.env.NODE_ENV === 'development') {
//   focusedWebContents.openDevTools();
// }
