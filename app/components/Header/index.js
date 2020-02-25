import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { remote } from 'electron';
import PropTypes from 'prop-types';
import minimiseIcon from '../../images/minimise.svg';
import minimiseIconRed from '../../images/minimise_red.svg';
import closeIcon from '../../images/close.svg';
import closeIconRed from '../../images/close_red.svg';

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
  '#/home/settings': 'Settings',
  '#/home/browser': 'Browser'
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
    if (process.platform !== 'darwin') {
      remote.getCurrentWindow().close();
    } else {
      remote.app.hide();
    }
  };

  render() {
    const { showPageTitle, closable, settings } = this.props;
    return (
      <Row
        id="header"
        className="justify-content-end align-items-center text-right"
      >
        <Col className="text-left draggable h-100">
          {showPageTitle ? (
            <span className="font-weight-bold">
              {hashToName[window.location.hash] || ''}
            </span>
          ) : null}
        </Col>
        <Col className="col-0_5 col">
          <span role="button" tabIndex="0" onClick={this.minimiseWindow}>
            <img
              draggable="false"
              alt="Minimise Window"
              className="headerIcon"
              src={
                settings.theme === 'Neutrino' ? minimiseIcon : minimiseIconRed
              }
            />
          </span>
        </Col>
        {closable ? (
          <Col className="col-0_5 col">
            <span role="button" tabIndex="0" onClick={this.closeWindow}>
              <img
                draggable="false"
                alt="Close Window"
                className="headerIcon"
                src={settings.theme === 'Neutrino' ? closeIcon : closeIconRed}
              />
            </span>
          </Col>
        ) : null}
      </Row>
    );
  }
}

Header.propTypes = {
  showPageTitle: PropTypes.bool,
  closable: PropTypes.bool,
  settings: PropTypes.objectOf(PropTypes.any)
};

Header.defaultProps = {
  showPageTitle: true,
  closable: true,
  settings: { theme: 'Neutrino' }
};
