import { ipcRenderer } from 'electron';
import {
  SEND_CAPTCHA_TOKEN_FROM_RENDERER,
  SEND_CAPTCHA_TOKEN_FROM_CAPTCHA_TO_RENDERER,
  OPEN_CAPTCHA_WINDOW
} from '../../constants/ipcConstants';

export const openCaptchaWindow = () => {
  ipcRenderer.send(OPEN_CAPTCHA_WINDOW, 'open');
};

export const getCaptchaResponse = captchaJob => {
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
};

export const bs = '';
