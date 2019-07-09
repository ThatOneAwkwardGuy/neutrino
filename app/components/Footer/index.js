import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import PropTypes from 'prop-types';

const { shell } = require('electron');

export default class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

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
            <FontAwesome name="chevron-left" onClick={toggleSidebarExpand} />
          ) : (
            <FontAwesome name="chevron-right" onClick={toggleSidebarExpand} />
          )}
        </Col>
        <Col className="col-0_5 text-center">
          <span
            className="footerIcon noselect"
            tabIndex="0"
            role="button"
            onClick={this.openCaptchaWindow}
          >
            <FontAwesome name="window-maximize" />
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
            <FontAwesome name="desktop" />
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
            <FontAwesome name="twitter" />
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
            <FontAwesome name="instagram" />
          </span>
        </Col>
        <Col xs="2" className="footerText">
          {updateDownloading ? 'Downloading Update' : ''}
        </Col>
        <Col
          xs="3"
          className="text-center font-weight-bold footerText noselect"
        >
          Copyright © 2019 Neutrino - All Rights Reserved
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