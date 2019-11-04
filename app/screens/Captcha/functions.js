import { ipcRenderer } from 'electron';
import { AntiCaptcha } from 'anticaptcha';
import {
  SEND_CAPTCHA_TOKEN_FROM_RENDERER,
  SEND_CAPTCHA_TOKEN_FROM_CAPTCHA_TO_RENDERER,
  OPEN_CAPTCHA_WINDOW
} from '../../constants/ipcConstants';
import { sleep } from '../../components/RaffleBot/functions';

const rp = require('request-promise').defaults({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
  }
});

export const openCaptchaWindow = () => {
  ipcRenderer.send(OPEN_CAPTCHA_WINDOW, 'open');
};

export const getAntiCaptchaResponse = async captchaJob => {
  const AntiCaptchaAPI = new AntiCaptcha(captchaJob.settings.AntiCaptchaAPIKey);
  const taskId = await AntiCaptchaAPI.createTask(
    captchaJob.url,
    captchaJob.siteKey
  );
  const response = await AntiCaptchaAPI.getTaskResult(taskId);
  if (response.status === 'ready') {
    return { captchaToken: response.solution.gRecaptchaResponse };
  }
  throw new Error('Unable To Get Captcha From AntiCaptcha');
};

export const get2CaptchaResponse = async captchaJob => {
  const requestUrl = `http://2captcha.com/in.php?key=${
    captchaJob.settings['2CaptchaAPIKey']
  }&method=userrecaptcha&googlekey=${captchaJob.siteKey}&pageurl=${
    captchaJob.url
  }=&proxy=${captchaJob.proxy}&proxytype=${
    captchaJob.proxy !== '' ? 'HTTP' : ''
  }`;
  const response = await rp.get(requestUrl);
  const [status, id] = response.split('|');
  
  if (status === 'OK') {
    for (let index = 0; index < 20; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      const checkResponse = await rp.get(
        `http://2captcha.com/res.php?key=${
          captchaJob.settings['2CaptchaAPIKey']
        }&action=get&id=${id}`
      );
      const [captchaStatus, captchaCode] = checkResponse.split('|');
      
      if (captchaStatus === 'OK') {
        return { captchaToken: captchaCode };
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(5000);
    }
    throw new Error('No Captcha Response After 100 seconds');
  } else {
    throw new Error('Problem Creating 2CaptchaResponse Job');
  }
};

export const getImageTypersResponse = captchaJob => captchaJob;

export const getCaptchaResponse = captchaJob => {
  
  switch (captchaJob.settings.CaptchaAPI) {
    case 'AntiCaptcha':
      return getAntiCaptchaResponse(captchaJob);
    case '2Captcha':
      return get2CaptchaResponse(captchaJob);
    case 'ImageTypers':
      return getImageTypersResponse(captchaJob);
    default:
      openCaptchaWindow();
      return new Promise(resolve => {
        ipcRenderer.send(SEND_CAPTCHA_TOKEN_FROM_RENDERER, captchaJob);
        ipcRenderer.on(
          SEND_CAPTCHA_TOKEN_FROM_CAPTCHA_TO_RENDERER,
          (event, arg) => {
            if (arg.id === captchaJob.id) {
              resolve(arg);
            }
          }
        );
      });
  }
};

export const bs = '';
