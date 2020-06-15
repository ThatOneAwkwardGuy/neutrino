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

// const setWindowCookiesInWindow = (webContents, windowCookies) =>
//   Promise.all(
//     windowCookies.map(windowCookie =>
//       webContents.session.cookies.set(windowCookie).catch(e => e)
//     )
//   );

if (process.env.NODE_ENV === 'development') {
  focusedWebContents.openDevTools();
}

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
    window.validateReCaptchaAuth = () => {};
  } catch (error) {
    // console.log(error);
  }
  try {
    const captchaJobs = remote.getGlobal('captchaQueue');
    const captchaJob = captchaJobs[focusedWebContents.id];
    let authToken = '';
    try {
      authToken = document.querySelector('input[name="authenticity_token"]')
        .value;
    } catch (error) {
      // console.error(error);
    }
    if (captchaJob) {
      try {
        const tokenID = captchaJob.id;
        let captchaToken = '';
        let captchaWidget = null;
        const { grecaptcha } = window;
        try {
          await grecaptcha.execute();
        } catch (error) {
          // console.error(error);
        }
        try {
          captchaWidget = document.querySelector('#recaptcha-token');
          if (captchaWidget !== null) {
            captchaToken = captchaWidget.value;
          }
        } catch (error) {
          // console.error(error);
        }
        if (captchaWidget === null) {
          captchaToken = grecaptcha.getResponse();
        }
        if (captchaToken !== '') {
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
        // console.error(error);
      }
    }
  } catch (error) {
    // console.error(error);
  }
};

ipcRenderer.on(
  `captcha-details-${focusedWebContents.id}`,
  async (event, args) => {
    console.log(JSON.stringify(args));
    await setCookiesInWindow(focusedWebContents, args.cookiesObject);
    // if (args.windowCookies) {
    //   await setWindowCookiesInWindow(focusedWebContents, args.windowCookies);
    // }
    ipcRenderer.send('store-captcha-job', focusedWebContents.id, args);
    // document.referrer = args.url;
    window.location.href = args.url;
  }
);

if (window.location.href.split('/').slice(-1)[0] !== 'waiting.html') {
  if (
    window.location.href.includes('doverstreetmarket') ||
    window.location.href.includes('bstn') ||
    window.location.href.includes('hollywood.se') ||
    // window.location.href.includes('nakedcph.com') ||
    window.location.href.includes('mailchi.mp') ||
    window.location.href.includes('ymeuniverse')
  ) {
    window.addEventListener('DOMContentLoaded', () => {
      if (!window.location.href.includes('bstn')) {
        document.querySelector('form').id = 'blahhhhh';
      }
      if (!document.documentElement.innerHTML.includes('Bot Or Not')) {
        document.querySelector('form').action = 'http://google.com';
      }
      window.validateReCaptchaAuth = () => {};
      window.submitRuleOptin = () => {};
    });
  }
  if (
    !window.location.href.includes('youtube.') &&
    !window.location.href.includes('google.') &&
    !window.location.href.includes('naked') &&
    !window.location.href.includes('bstn.')
  ) {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('body > :not(.g-recaptcha)').forEach(box => {
        // eslint-disable-next-line no-param-reassign
        box.style.display = 'none';
      });
      document.body.appendChild(document.querySelector('div.g-recaptcha'));
    });
  }
  if (!window.location.href.includes('nakedcph.com')) {
    captchaChecker = setInterval(checkCaptcha, 300);
  }
}
