import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import routes from '../../constants/routes';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Homepage from '../../components/Homepage';
import ProxyCreator from '../../components/ProxyCreator';
import ProxyTester from '../../components/ProxyTester';
import AccountCreator from '../../components/AccountCreator';
import AddressJigger from '../../components/AddressJigger';
import OneClickGenerator from '../../components/OneClickGenerator';
import OneClickTester from '../../components/OneClickTester';
import ProfileCreator from '../../components/ProfileCreator';
import ProfileTaskEditorConverter from '../../components/ProfileTaskEditorConverter';
import RaffleBot from '../../components/RaffleBot';
import Settings from '../../components/Settings';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarExpand: false,
      updateDownloading: false
    };
  }

  toggleSidebarExpand = () => {
    const { sidebarExpand } = this.state;
    this.setState({
      sidebarExpand: !sidebarExpand
    });
  };

  render() {
    const { sidebarExpand, updateDownloading } = this.state;
    return (
      <Container fluid className="d-flex flex-column h-100">
        <Header />
        <Row className="flex-fill">
          <Col
            id="sidebar"
            className={`${
              sidebarExpand ? 'text-left col-2' : 'text-center col-0_5'
            }`}
          >
            <div>
              <Link to={routes.HOME}>
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.HOME}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesome name="home" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Home</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link to={routes.PROXY_CREATOR}>
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.PROXY_CREATOR}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesome name="database" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Proxy Creator</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link to={routes.PROXY_TESTER}>
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.PROXY_TESTER}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesome name="heartbeat" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Proxy Tester</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link to={routes.ACCOUNT_CREATOR}>
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.ACCOUNT_CREATOR}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesome name="users" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Account Creator</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link to={routes.ADDRESS_JIGGER}>
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.ADDRESS_JIGGER}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesome name="address-card" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Address Jigger</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link to={routes.ONECLICK_GENERATOR}>
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.ONECLICK_GENERATOR}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesome name="google" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">
                      One Click Generator
                    </span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link to={routes.ONECLICK_TESTER}>
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.ONECLICK_TESTER}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesome name="check-square" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">One Click Tester</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link to={routes.PROFILE_CREATOR}>
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.PROFILE_CREATOR}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesome name="user" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Profile Creator</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link to={routes.PROFILE_TASK_EDITOR_CONVERTER}>
                <div
                  className={`sidebarIcon ${
                    window.location.hash ===
                    `#${routes.PROFILE_TASK_EDITOR_CONVERTER}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesome name="sync" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Profile Converter</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link to={routes.RAFFLE_BOT}>
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.RAFFLE_BOT}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesome name="ticket" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Raffle Bot</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link to={routes.SETTINGS}>
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.SETTINGS}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesome name="cogs" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Settings</span>
                  ) : null}
                </div>
              </Link>
            </div>
          </Col>
          <Col id="content">
            <Switch>
              <Route exact path={routes.HOME} component={Homepage} />
              <Route
                exact
                path={routes.PROXY_CREATOR}
                component={ProxyCreator}
              />
              <Route
                exact
                path={routes.ACCOUNT_CREATOR}
                component={AccountCreator}
              />
              <Route exact path={routes.PROXY_TESTER} component={ProxyTester} />
              <Route
                exact
                path={routes.ADDRESS_JIGGER}
                component={AddressJigger}
              />
              <Route
                exact
                path={routes.ONECLICK_GENERATOR}
                component={OneClickGenerator}
              />
              <Route
                exact
                path={routes.ONECLICK_TESTER}
                component={OneClickTester}
              />
              <Route
                exact
                path={routes.PROFILE_CREATOR}
                component={ProfileCreator}
              />
              <Route
                exact
                path={routes.PROFILE_TASK_EDITOR_CONVERTER}
                component={ProfileTaskEditorConverter}
              />
              <Route exact path={routes.RAFFLE_BOT} component={RaffleBot} />
              <Route exact path={routes.SETTINGS} component={Settings} />
            </Switch>
          </Col>
        </Row>
        <Footer
          sidebarExpand={sidebarExpand}
          toggleSidebarExpand={this.toggleSidebarExpand}
          updateDownloading={updateDownloading}
        />
      </Container>
    );
  }
}
