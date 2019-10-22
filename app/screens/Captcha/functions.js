import { ipcRenderer } from 'electron';
import { AntiCaptcha } from 'anticaptcha';
import {
  SEND_CAPTCHA_TOKEN_FROM_RENDERER,
  SEND_CAPTCHA_TOKEN_FROM_CAPTCHA_TO_RENDERER,
  OPEN_CAPTCHA_WINDOW
} from '../../constants/ipcConstants';

export const openCaptchaWindow = () => {
  ipcRenderer.send(OPEN_CAPTCHA_WINDOW, 'open');
};

export const getAntiCaptchaResponse = async captchaJob => {
  const AntiCaptchaAPI = new AntiCaptcha(captchaJob.settings.AntiCaptchaAPIKey);
  const taskId = await AntiCaptchaAPI.createTask(
    'http://www.some-site.com',
    '7Lfh6tkSBBBBBBGN68s8fAVds_Fl-HP0xQGNq1DK'
  );
  const response = await AntiCaptchaAPI.getTaskResult(taskId);
  return response;
};

export const get2CaptchaResponse = captchaJob => captchaJob;
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

export const get2CaptchaToken = () => {};

export const getAntiCaptchaToken = () => {};

export const getImageTypersToken = () => {};

export const bs = '';
