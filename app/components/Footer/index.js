import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PropTypes from 'prop-types';
import { shell, ipcRenderer } from 'electron';
import { OPEN_CAPTCHA_WINDOW } from '../../constants/ipcConstants';
import textLogo from '../../images/textLogo.png';

const { remote } = require('electron');

export default class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  openCaptchaWindow = () => {
    ipcRenderer.send(OPEN_CAPTCHA_WINDOW, 'open');
  };

  render() {
    const {
      sidebarExpand,
      toggleSidebarExpand,
      updateDownloading
    } = this.props;
    return (
      <Row id="footer" className="align-items-center">
        <Col className="col-0_5 text-center">
          {sidebarExpand ? (
            <FontAwesomeIcon
              icon="chevron-left"
              onClick={toggleSidebarExpand}
            />
          ) : (
            <FontAwesomeIcon
              icon="chevron-right"
              onClick={toggleSidebarExpand}
            />
          )}
        </Col>
        <Col className="col-0_5 text-center">
          <span
            className="footerIcon noselect"
            tabIndex="0"
            role="button"
            onClick={this.openCaptchaWindow}
          >
            <FontAwesomeIcon icon="window-maximize" />
          </span>
        </Col>
        <Col className="col-0_5 text-center ml-4">
          <span
            className="footerIcon noselect"
            tabIndex="0"
            role="button"
            onClick={() => {
              shell.openExternal('http://Neutrinotools.app/');
            }}
          >
            <FontAwesomeIcon icon="desktop" />
          </span>
        </Col>
        <Col className="col-0_5 text-center">
          <span
            className="footerIcon noselect"
            tabIndex="0"
            role="button"
            onClick={() => {
              shell.openExternal('https://twitter.com/neutrinotools');
            }}
          >
            <FontAwesomeIcon icon={['fab', 'twitter']} />
          </span>
        </Col>
        <Col className="col-0_5 text-center">
          <span
            role="button"
            className="footerIcon noselect"
            tabIndex="0"
            onClick={() => {
              shell.openExternal('https://www.instagram.com/neutrinotools/');
            }}
          >
            <FontAwesomeIcon icon={['fab', 'instagram']} />
          </span>
        </Col>
        {updateDownloading ? (
          <Col xs="2" className="footerText blinking">
            <FontAwesomeIcon icon="download" className="mr-2" />
            Downloading Update
          </Col>
        ) : (
          ''
        )}
        <Col className="text-center font-weight-bold footerText noselect">
          Copyright ©2020 Neutrino - All Rights Reserved
        </Col>
        <Col xs="1">v{remote.app.getVersion()}</Col>
        <Col xs="2" className="text-right ml-auto">
          <img
            style={{ width: '50%' }}
            alt="textLogo"
            className="h-100"
            src={textLogo}
          />
        </Col>
      </Row>
    );
  }
}

Footer.propTypes = {
  sidebarExpand: PropTypes.bool.isRequired,
  updateDownloading: PropTypes.bool.isRequired,
  toggleSidebarExpand: PropTypes.func.isRequired
};
