import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { remote } from 'electron';
import minimiseIcon from '../../images/minimise.svg';
import closeIcon from '../../images/close.svg';

const hashToName = {
  '#/home/proxy-creator': 'Proxy Creator',
  '#/home': 'Home',
  '#/home/proxy-tester': 'Proxy Tester',
  '#/home/account-creator': 'Account Creator',
  '#/home/address-jigger': 'Address Jigger',
  '#/home/oneclick-generator': 'One Click Generator',
  '#/home/oneclick-tester': 'One Click Tester',
  '#/home/profile-creator': 'Profile Creator',
  '#/home/profile-task-editor-converter': 'Profile Converter',
  '#/home/raffle-bot': 'Raffle Bot',
  '#/home/settings': 'Settings'
};

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  minimiseWindow = () => {
    remote.getCurrentWindow().minimize();
  };

  closeWindow = () => {
    remote.getCurrentWindow().close();
  };

  render() {
    return (
      <Row
        id="header"
        className="justify-content-end align-items-center text-right"
      >
        <Col className="text-left">
          {
            <span className="font-weight-bold">
              {hashToName[window.location.hash] || ''}
            </span>
          }
        </Col>
        <Col className="col-0_5 col">
          <span role="button" tabIndex="0" onClick={this.minimiseWindow}>
            <img
              draggable="false"
              alt="Minimise Window"
              className="headerIcon"
              src={minimiseIcon}
            />
          </span>
        </Col>
        <Col className="col-0_5 col">
          <span role="button" tabIndex="0" onClick={this.closeWindow}>
            <img
              draggable="false"
              alt="Close Window"
              className="headerIcon"
              src={closeIcon}
            />
          </span>
        </Col>
      </Row>
    );
  }
}
