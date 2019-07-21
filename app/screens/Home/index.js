import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Modal, ModalHeader } from 'reactstrap';
import { connect } from 'react-redux';
import { BarLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import * as SettingsActions from '../../actions/settings';
import * as AccountActions from '../../actions/accounts';
import * as ActivityActions from '../../actions/activities';
import * as ProfileActions from '../../actions/profile';
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

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarExpand: false,
      updateDownloading: false,
      loading: false,
      loadingText: '',
      loadingModalClosable: false
    };
  }

  componentDidUpdate(prevProps) {
    const { location, checkUserAuth, uid } = this.props;
    if (
      location !== prevProps.location &&
      checkUserAuth &&
      uid !== '' &&
      process.env.NODE_ENV !== 'development'
    ) {
      try {
        checkUserAuth(uid);
      } catch (error) {
        console.log(error);
      }
    }
  }

  toggleSidebarExpand = () => {
    const { sidebarExpand } = this.state;
    this.setState({
      sidebarExpand: !sidebarExpand
    });
  };

  setLoading = (loading, loadingText, loadingModalClosable) => {
    this.setState({
      loading,
      loadingText,
      loadingModalClosable
    });
  };

  toggleLoading = () => {
    this.setState(prevState => ({ loading: !prevState.loading }));
  };

  render() {
    const {
      sidebarExpand,
      updateDownloading,
      loading,
      loadingText,
      loadingModalClosable
    } = this.state;
    const {
      addProxyProviderAccount,
      removeProxyProviderAccount,
      setKeyInSetting,
      settings,
      addCreatedAccount,
      removeCreatedAccount,
      removeAllCreatedAccounts,
      accounts,
      addActivities,
      incrementActivity,
      updateActivity,
      deleteActivity,
      deleteAllActivities,
      activities,
      profile,
      updateProfileAttribute,
      clearProfileAttributes,
      updateProfile
    } = this.props;
    const { setLoading } = this;
    const appRoutes = [
      { path: routes.HOME, component: Homepage, exact: true, props: [] },
      {
        path: routes.PROXY_CREATOR,
        component: ProxyCreator,
        exact: true,
        props: { setLoading, settings }
      },
      {
        path: routes.ACCOUNT_CREATOR,
        component: AccountCreator,
        exact: true,
        props: {
          setLoading,
          addCreatedAccount,
          removeCreatedAccount,
          removeAllCreatedAccounts,
          accounts
        }
      },
      {
        path: routes.PROXY_TESTER,
        component: ProxyTester,
        exact: true,
        props: { setLoading }
      },
      {
        path: routes.ADDRESS_JIGGER,
        component: AddressJigger,
        exact: true,
        props: []
      },
      {
        path: routes.ONECLICK_GENERATOR,
        component: OneClickGenerator,
        exact: true,
        props: {
          settings,
          addActivities,
          incrementActivity,
          updateActivity,
          deleteActivity,
          deleteAllActivities,
          activities
        }
      },
      {
        path: routes.ONECLICK_TESTER,
        component: OneClickTester,
        exact: true,
        props: []
      },
      {
        path: routes.PROFILE_CREATOR,
        component: ProfileCreator,
        exact: true,
        props: {
          profile,
          updateProfileAttribute,
          clearProfileAttributes,
          updateProfile
        }
      },
      {
        path: routes.PROFILE_TASK_EDITOR_CONVERTER,
        component: ProfileTaskEditorConverter,
        exact: true,
        props: []
      },
      { path: routes.RAFFLE_BOT, component: RaffleBot, exact: true, props: [] },
      {
        path: routes.SETTINGS,
        component: Settings,
        exact: true,
        props: {
          addProxyProviderAccount,
          removeProxyProviderAccount,
          setKeyInSetting,
          settings
        }
      }
    ];
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
                  <FontAwesome name="envelope" />
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
              {appRoutes.map(route => (
                <Route
                  key={route.path}
                  path={route.path}
                  exact={route.exact}
                  render={() => <route.component {...route.props} />}
                />
              ))}
            </Switch>
          </Col>
        </Row>
        <Footer
          sidebarExpand={sidebarExpand}
          toggleSidebarExpand={this.toggleSidebarExpand}
          updateDownloading={updateDownloading}
        />
        <Modal
          id="loadingModal"
          isOpen={loading}
          size="sm"
          centered
          className="text-center"
          toggle={loadingModalClosable ? this.toggleLoading : null}
        >
          {loadingModalClosable ? (
            <ModalHeader
              style={{ border: 'none' }}
              toggle={this.toggleLoading}
            />
          ) : null}
          <BarLoader width={100} widthUnit="%" color="#2745fb" />
          {loadingText ? <p className="p-3">{loadingText}</p> : null}
        </Modal>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  settings: state.settings,
  accounts: state.accounts,
  activities: state.activities,
  profile: state.profile
});

// const mapDispatchToProps = dispatch => {
//   console.log({ ...SettingsActions, ...AccountActions });
//   bindActionCreators({ ...SettingsActions, ...AccountActions }, dispatch);
// };

const mapDispatchToProps = {
  ...SettingsActions,
  ...AccountActions,
  ...ActivityActions,
  ...ProfileActions
};

Home.propTypes = {
  addProxyProviderAccount: PropTypes.func.isRequired,
  removeProxyProviderAccount: PropTypes.func.isRequired,
  setKeyInSetting: PropTypes.func.isRequired,
  settings: PropTypes.objectOf(PropTypes.any).isRequired,
  addCreatedAccount: PropTypes.func.isRequired,
  removeCreatedAccount: PropTypes.func.isRequired,
  removeAllCreatedAccounts: PropTypes.func.isRequired,
  location: PropTypes.objectOf(PropTypes.any).isRequired,
  checkUserAuth: PropTypes.func.isRequired,
  uid: PropTypes.string.isRequired,
  accounts: PropTypes.shape({
    accounts: PropTypes.array
  }).isRequired,
  addActivities: PropTypes.func.isRequired,
  updateActivity: PropTypes.func.isRequired,
  incrementActivity: PropTypes.func.isRequired,
  deleteActivity: PropTypes.func.isRequired,
  deleteAllActivities: PropTypes.func.isRequired,
  activities: PropTypes.shape({
    accounts: PropTypes.array
  }).isRequired,
  profile: PropTypes.objectOf(PropTypes.any).isRequired,
  updateProfileAttribute: PropTypes.func.isRequired,
  clearProfileAttributes: PropTypes.func.isRequired,
  updateProfile: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
