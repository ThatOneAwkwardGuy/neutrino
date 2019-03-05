import React, { Component } from 'react';
import { Container } from 'reactstrap';
import CaptchaTopbar from '../components/CaptchaTopbar';
const path = require('path');

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
          webpreferences="allowRunningInsecureContent, javascript=yes"
          preload="../../webpack-pack/activityPreload.js"
          // preload={path.normalize(path.resolve(__dirname, '..', '..', 'webpack-pack', 'activityPreload.js'))}
          style={{
            width: '100%',
            height: '100%'
          }}
        />
      </Container>
    );
  }
}

export default Activity;
