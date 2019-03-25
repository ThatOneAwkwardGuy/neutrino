import React, { Component } from 'react';
import { Container } from 'reactstrap';
import CaptchaTopbar from '../components/CaptchaTopbar';
const path = require('path');

class Activity extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(__dirname);
    console.log(path.resolve(process.resourcesPath, 'webpack-pack', 'activityPreload.js'));
    return (
      <Container fluid>
        <CaptchaTopbar />
        <webview
          id="activityWebview"
          src="http://google.com"
          webpreferences="allowRunningInsecureContent, javascript=yes"
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
