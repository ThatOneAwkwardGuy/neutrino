import React, { Component } from 'react';
import { Container, Row } from 'reactstrap';
import CaptchaTopbar from '../components/CaptchaTopbar';
const remote = require('electron').remote;
const windowManager = remote.require('electron-window-manager');

class OneClickTester extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const webview = document.getElementById('googleLoginWebview');
    webview.addEventListener('dom-ready', () => {
      webview.executeJavascipt();
    });
  }

  render() {
    return (
      <Container fluid>
        <CaptchaTopbar />
        <webview
          id="googleLoginWebview"
          src="http://google.com"
          partition={windowManager.getCurrent().name}
          webpreferences="allowRunningInsecureContent, javascript=yes"
          style={{
            width: '100%',
            height: 'calc(100% - 80px)'
          }}
        />
        <Row className="captchaFooter" />
      </Container>
    );
  }
}

export default OneClickTester;
