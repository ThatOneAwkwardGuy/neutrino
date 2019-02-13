import React, { Component } from 'react';
import { Container } from 'reactstrap';
const path = require('path');

class Activity extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container fluid>
        <webview
          id="activityWebview"
          src="http://google.com"
          webpreferences="allowRunningInsecureContent, javascript=yes"
          preload={path.normalize(path.resolve(__dirname, '..', '..', 'webpack-pack', 'activityPreload.js'))}
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
