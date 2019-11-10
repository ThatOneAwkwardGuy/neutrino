import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { remote, ipcRenderer } from 'electron';
import Header from '../../components/Header';
import {
  SEND_CAPTCHA_TOKEN_FROM_MAIN,
  STOP_CAPTCHA_JOB
} from '../../constants/ipcConstants';

const TabGroup = require('electron-tabs');

const appPath = remote.app.getAppPath();

const waitingURL =
  process.env.NODE_ENV === 'development'
    ? `file://${appPath}/waiting.html`
    : `file://${appPath}/app/waiting.html`;

const preloadPath =
  process.env.NODE_ENV === 'development'
    ? `${appPath}/screens/Captcha/preload.js`
    : `${appPath}/app/screens/Captcha/preload.js`;

export default class Captcha extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.tabGroup = null;
    this.tabStatus = { 0: { active: false, jobID: '' } };
    this.captchaQueue = [];
  }

  componentDidMount() {
    try {
      this.tabGroup = new TabGroup({
        newTab: {
          title: 'Captcha Solver',
          src: waitingURL,
          visible: true,
          active: true,
          webviewAttributes: {
            preload: preloadPath,
            nodeintegration: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            javascript: true
          }
        }
      });
      this.tabGroup.addTab({
        title: 'Captcha Solver',
        src: waitingURL,
        visible: true,
        active: true,
        closable: true,
        webviewAttributes: {
          preload: preloadPath,
          nodeintegration: true,
          webSecurity: false,
          allowRunningInsecureContent: true,
          javascript: true,
          useragent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
        }
      });
      this.setListeners();
    } catch (error) {
      console.error(error);
    }
  }

  setListeners = () => {
    ipcRenderer.on(SEND_CAPTCHA_TOKEN_FROM_MAIN, (event, arg) => {
      this.handleCaptchaJob(arg);
    });
    ipcRenderer.on(
      'send-captcha-token-from-preload-to-captcha',
      (event, arg) => {
        ipcRenderer.send('send-captcha-token-from-captcha-to-renderer', arg);
        this.freeTabForCaptcha(arg.id);
      }
    );
    ipcRenderer.on(STOP_CAPTCHA_JOB, (event, arg) => {
      this.freeTabForCaptcha(arg);
    });
    this.tabGroup.on('tab-added', tab => {
      this.tabStatus[tab.id] = { active: false, jobID: '' };
      // if (this.captchaQueue.length >= 1) {
      //   this.handleCaptchaJob(this.captchaQueue.pop());
      // }
    });
    this.tabGroup.on('tab-removed', tab => {
      delete this.tabStatus[tab.id];
    });
  };

  handleCaptchaJob = captchaJob => {
    const tabs = this.tabGroup.getTabs();
    const captchaJobOperation = Object.keys(this.tabStatus).some(tabKey => {
      if (!this.tabStatus[tabKey].active) {
        this.tabStatus[tabKey] = { active: true, jobID: captchaJob.id };
        const webContents = tabs[tabKey].webview.getWebContents();
        webContents.session.clearCache();
        webContents.send(`captcha-details-${webContents.id}`, captchaJob);
        return true;
      }
      return false;
    });

    if (!captchaJobOperation) {
      this.captchaQueue.push(captchaJob);
    }
  };

  freeTabForCaptcha = id => {
    Object.keys(this.tabStatus).forEach(tabKey => {
      if (this.tabStatus[tabKey].jobID === id) {
        this.tabStatus[tabKey].active = false;
        const tabs = this.tabGroup.getTabs();
        tabs[tabKey].webview.loadURL(waitingURL);
        return true;
      }
    });

    if (this.captchaQueue.length >= 1) {
      this.handleCaptchaJob(this.captchaQueue.pop());
    }
  };

  goToYoutube = () => {
    const tab = this.tabGroup.getActiveTab();
    tab.webview.loadURL('https://youtube.com');
  };

  goToGoogleLogin = () => {
    const tab = this.tabGroup.getActiveTab();
    tab.webview.loadURL('https://accounts.google.com/login');
  };

  gotToWaiting = () => {
    const tab = this.tabGroup.getActiveTab();
    const webContents = tab.webview.getWebContents();
    webContents.session.clearStorageData({
      storages: ['cookies']
    });
    tab.webview.loadURL(waitingURL);
  };

  render() {
    return (
      <Container id="captchaWindow" fluid className="d-flex flex-column h-100">
        <Header closable={false} />
        <Row className="flex-fill overflow-hidden">
          <div className="etabs-tabgroup">
            <div className="etabs-tabs" />
            <div className="etabs-buttons" />
          </div>
          <div className="etabs-views" />
        </Row>
        <Row className="py-3" style={{ height: '60px' }}>
          <Col onClick={this.gotToWaiting}>
            <Button>Reset</Button>
          </Col>
          <Col>
            <Button onClick={this.goToYoutube}>Youtube</Button>
          </Col>
          <Col>
            <Button onClick={this.goToGoogleLogin}>Google</Button>
          </Col>
        </Row>
      </Container>
    );
  }
}
