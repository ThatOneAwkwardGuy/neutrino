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
      resolve(
        Promise.all(
          Object.keys(cookies).map(async cookieSite => {
            const cookiesCookieSite = cookies[cookieSite]['/'];
            return Promise.all(
              Object.keys(cookiesCookieSite).map(async actualCookie => {
                const formattedCookie = {
                  url: `https://${cookieSite}`,
                  value: cookiesCookieSite[actualCookie].value,
                  domain: cookiesCookieSite[actualCookie].domain,
                  path: cookiesCookieSite[actualCookie].path,
                  name: actualCookie
                };
                return webContents.session.cookies
                  .set(formattedCookie)
                  .catch(e => e);
              })
            ).catch(e => e);
          })
        )
      );
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
      // console.log(error);
    }
    if (captchaJob) {
      try {
        const tokenID = captchaJob.id;
        const { grecaptcha } = window;
        try {
          await grecaptcha.execute();
        } catch (error) {
          // console.log(error);
        }
        const captchaToken = grecaptcha.getResponse();
        if (captchaToken !== '') {
          // console.log(tokenID);
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
        // console.log(error);
      }
    }
  } catch (error) {
    // console.log(error);
  }
};

ipcRenderer.on(
  `captcha-details-${focusedWebContents.id}`,
  async (event, args) => {
    console.log(JSON.stringify(args));
    const cookiesSet = await setCookiesInWindow(
      focusedWebContents,
      args.cookiesObject
    );
    console.log(cookiesSet);
    ipcRenderer.send('store-captcha-job', focusedWebContents.id, args);
    window.location.href = args.url;
  }
);

if (window.location.href.split('/').slice(-1)[0] !== 'waiting.html') {
  if (window.location.href.includes('doverstreetmarket')) {
    window.addEventListener('DOMContentLoaded', () => {
      document.querySelector('form').id = 'blahhhhh';
      document.querySelector('form').action = 'http://google.com';
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('body > :not(.g-recaptcha)').forEach(box => {
      // eslint-disable-next-line no-param-reassign
      box.style.display = 'none';
    });
    document.body.appendChild(document.querySelector('div.g-recaptcha'));
  });
  captchaChecker = setInterval(checkCaptcha, 300);
}

// if (process.env.NODE_ENV === 'development') {
//   focusedWebContents.openDevTools();
// }
