import React, { Component } from 'react';
import { Container, Row } from 'reactstrap';
import CaptchaTopbar from '../components/CaptchaTopbar';
const remote = require('electron').remote;
const windowManager = remote.require('electron-window-manager');

class Activity extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container fluid>
        <CaptchaTopbar />
        <webview
          id="activityWebview"
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

export default Activity;
