import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Logo from '../img/svg/logo.svg';
var shell = require('electron').shell;

export default class Footer extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Row className="footer">
        <Col xs="2" className="d-flex align-items-center">
          <a
            onClick={() => {
              shell.openExternal('http://Neutrino.app/');
            }}
          >
            <FontAwesome name="desktop" className="browserLogoFooter logoFooter" />
          </a>
          <a
            onClick={() => {
              shell.openExternal('https://twitter.com/Neutrino');
            }}
          >
            <FontAwesome name="twitter" className="twitterLogoFooter logoFooter" />
          </a>
        </Col>
        <Col xs="8" className="text-center footerCenterSection">
          Copyright © 2018 Neutrino - All Rights Reserved
        </Col>
        <Col xs="2" className="text-right footerRightSection">
          <img style={{ maxWidth: '100px' }} src={Logo} />
        </Col>
      </Row>
    );
  }
}
