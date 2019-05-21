import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Logo from '../img/svg/logo.svg';
var shell = require('electron').shell;
const ipcRenderer = require('electron').ipcRenderer;
import { OPEN_CAPTCHA_WINDOW } from '../utils/constants';

export default class Footer extends Component {
  constructor(props) {
    super(props);
  }

  openCaptchaWindow = () => {
    ipcRenderer.send(OPEN_CAPTCHA_WINDOW, 'open');
  };

  render() {
    return (
      <Row className="footer">
        <Col xs="1">
          <a
            onClick={() => {
              this.openCaptchaWindow();
            }}
          >
            <FontAwesome name="code" className="browserLogoFooter logoFooter" />
          </a>
        </Col>
        <Col xs="2" className="d-flex align-items-center">
          <a
            onClick={() => {
              shell.openExternal('http://Neutrinotools.app/');
            }}
          >
            <FontAwesome name="desktop" className="browserLogoFooter logoFooter" />
          </a>
          <a
            onClick={() => {
              shell.openExternal('https://twitter.com/neutrinotools');
            }}
          >
            <FontAwesome name="twitter" className="twitterLogoFooter logoFooter" />
          </a>
          <a
            onClick={() => {
              shell.openExternal('https://www.instagram.com/neutrinotools/');
            }}
          >
            <FontAwesome name="instagram" className="twitterLogoFooter logoFooter" />
          </a>
        </Col>
        <Col xs="6" className="text-center footerCenterSection">
          Copyright © 2019 Neutrino - All Rights Reserved
        </Col>
        <Col xs="3" className="text-right footerRightSection">
          <img style={{ maxWidth: '100px' }} src={Logo} className="ml-auto" />
        </Col>
      </Row>
    );
  }
}
