import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { ipcRenderer } from 'electron';
import Header from '../../components/Header';
import { SEND_CAPTCHA_TOKEN_FROM_MAIN } from '../../constants/ipcConstants';

const TabGroup = require('electron-tabs');

export default class Captcha extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.tabGroup = null;
    this.tabStatus = { 0: { active: false, jobID: '' } };
    this.captchaQueue = [];
  }

  componentDidMount() {
    this.tabGroup = new TabGroup({
      newTab: {
        title: 'Captcha Solver',
        src: `file://${__dirname}/waiting.html`,
        visible: true,
        active: true,
        webviewAttributes: {
          preload: './screens/Captcha/preload.js',
          nodeintegration: true
        }
      }
    });
    this.tabGroup.addTab({
      title: 'Captcha Solver',
      src: `file://${__dirname}/waiting.html`,
      visible: true,
      active: true,
      closable: false,
      webviewAttributes: {
        preload: './screens/Captcha/preload.js',
        nodeintegration: true
      }
    });
    this.setListeners();
  }

  setListeners = () => {
    this.tabGroup.on('tab-added', tab => {
      this.tabStatus[tab.id] = { active: false, jobID: '' };
    });
    this.tabGroup.on('tab-removed', tab => {
      delete this.tabStatus[tab.id];
    });
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
  };

  handleCaptchaJob = captchaJob => {
    const tabs = this.tabGroup.getTabs();
    const captchaJobOperation = Object.keys(this.tabStatus).some(tabKey => {
      if (!this.tabStatus[tabKey].active) {
        const webContents = tabs[tabKey].webview.getWebContents();
        webContents.send(`captcha-details-${webContents.id}`, captchaJob);
        this.tabStatus[tabKey] = { active: true, jobID: captchaJob.id };
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
        tabs[tabKey].webview.loadURL(`file://${__dirname}/waiting.html`);
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

  render() {
    return (
      <Container id="captchaWindow" fluid className="d-flex flex-column h-100">
        <Header />
        <Row className="flex-fill overflow-hidden">
          <div className="etabs-tabgroup">
            <div className="etabs-tabs" />
            <div className="etabs-buttons" />
          </div>
          <div className="etabs-views" />
        </Row>
        <Row className="py-5" style={{ height: '60px' }}>
          <Col>
            <Button>Clear Cookies</Button>
          </Col>
          <Col>
            <Button onClick={this.goToYoutube}>Youtube</Button>
          </Col>
          <Col>
            <Button onClick={this.goToGoogleLogin}>Google Login</Button>
          </Col>
        </Row>
      </Container>
    );
  }
}
