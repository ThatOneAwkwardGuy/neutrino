const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;
let captchaChecker = null;
let authToken;
let oldCookies;

import { Plugin, passChomeTest } from '../utils/stealth';

const plugin = new Plugin();
plugin.mockPluginsAndMimeTypes();
passChomeTest(window);

const checkCaptcha = () => {
  const args = remote.getGlobal('captcaTokenID');
  const tokenID = args.id;

  let captchaResponse;
  let invisibleCaptcha;

  try {
    invisibleCaptcha = document.querySelector('.g-recaptcha').getAttribute('data-size');
    if (invisibleCaptcha === null) {
      throw new Error();
    }
  } catch (e) {
    try {
      captchaResponse = grecaptcha.getResponse();
      if (captchaResponse === '') {
        throw new Error();
      }
    } catch (e) {
      try {
        captchaResponse = document.getElementById('recaptcha-token').value;
      } catch (e) {}
    }
  }

  if (invisibleCaptcha === 'invisible' && invisibleCaptcha !== undefined) {
    grecaptcha.execute().then(() => {
      const captchaResponse3 = grecaptcha.getResponse();
      if (captchaResponse3 !== '') {
        clearInterval(captchaChecker);
        ipcRenderer.send('send-captcha-token', {
          ...args,
          checkoutURL: document.location.href,
          captchaResponse: captchaResponse3,
          id: tokenID,
          authToken,
          cookies: document.cookie,
          oldCookies2: oldCookies
        });
      }
    });
  } else if (captchaResponse !== '' && captchaResponse !== undefined) {
    clearInterval(captchaChecker);
    ipcRenderer.send('send-captcha-token', {
      ...args,
      checkoutURL: document.location.href,
      captchaResponse,
      id: tokenID,
      authToken,
      cookies: document.cookie,
      oldCookies2: oldCookies
    });
  }
};

// if (!document.location.href.includes('google.com') && !document.location.href.includes('youtube.com')) {
//   document.addEventListener('DOMContentLoaded', function() {
//     const bodySiteKey = document.body.innerHTML.match(/.sitekey: "(.*)"/)[1];
//     if (document.location.href.includes('/challenge')) {
//       authToken = document.querySelector('input[name="authenticity_token"]').value;
//     }
//     document.documentElement.innerHTML = `<!DOCTYPE html>
//     <html>
//     <head>
//     <title>Captcha Harvester</title>
//     </head>
//     <body>
//     <script type="text/javascript" src="https://www.recaptcha.net/recaptcha/api.js?render=${bodySiteKey}&hl=en"></script>
//     <script>
//     grecaptcha.render('g-recaptcha', {
//       sitekey: "${bodySiteKey}",
//       size: (window.innerWidth > 320) ? 'normal' : 'compact',
//       callback: 'onCaptchaSuccess',
//     });
//     </script>
//     <div id="g-recaptcha" class="g-recaptcha"></div>
//     </body>
//     </html>`;
//   });
// }

if (!window.location.href.includes('google.com') && !window.location.href.includes('youtube.com')) {
  captchaChecker = setInterval(checkCaptcha, 300);
}

ipcRenderer.on('send-captcha-token', (event, arg) => {
  clearInterval(captchaChecker);
});
