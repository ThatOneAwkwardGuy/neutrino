import React, { Component } from 'react';
import { Container } from 'reactstrap';
import CaptchaTopbar from '../components/CaptchaTopbar';
import CaptchaFooter from '../components/CaptchaFooter';
import Waiting from '../components/Waiting';
import { remote, ipcRenderer, session } from 'electron';
import {
  SET_GLOBAL_ID_VARIABLE,
  CAPTCHA_RECEIVE_COOKIES_AND_CAPTCHA_PAGE,
  RECEIVE_CAPTCHA_TOKEN,
  FINISH_SENDING_CAPTCHA_TOKEN,
  MAIN_PROCESS_CLEAR_RECEIVE_CAPTCHA_TOKEN_LISTENERS
} from '../utils/constants';
var os = require('os');

class Activity extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container fluid>
        <CaptchaTopbar />
        <Waiting visible={this.state.waiting} />
        <webview
          id="activityWebview"
          src="http://google.com"
          webpreferences="allowRunningInsecureContent, javascript=yes"
          preload="../app/utils/activityPreload.js"
          style={{
            width: '100%',
            height: this.state.waiting ? '0px' : 'calc(100% - 90px)'
          }}
        />
        <CaptchaFooter clearCookies={this.clearCookies} goToGoogleLogin={this.goToGoogleLogin} goToYoutube={this.goToYoutube} />
      </Container>
    );
  }
}

export default Activity;
