import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import BarLoader from 'react-spinners/BarLoader';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import * as SettingsActions from '../../actions/settings';
import * as AccountActions from '../../actions/accounts';
import * as ActivityActions from '../../actions/activities';
import * as ProfileActions from '../../actions/profile';
import * as HomeActions from '../../actions/home';
import * as ProxiesActions from '../../actions/proxies';
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
import Browser from '../../components/Browser';
import Settings from '../../components/Settings';
import {
  SET_DISCORD_RPC_STATE,
  UPDATE_AVAILABLE,
  NO_UPDATE_AVAILABLE,
  UPDATE_DOWNLOADED,
  CHECK_FOR_UPDATES
} from '../../constants/ipcConstants';
import { cardTypes } from '../../constants/constants';
import { changeTheme } from '../../reducers/settings';

const { getGlobal } = require('electron').remote;

const trackScreenview = getGlobal('trackScreenview');

library.add(fab);
library.add(fas);

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingText: '',
      sidebarExpand: false,
      installModal: false,
      updateDownloading: false,
      loading: false,
      loadingModalClosable: false,
      raffleInfo: null,
      infoModalShowing: false,
      infoModalHeader: '',
      infoModalBody: '',
      infoModalFunction: false,
      infoModalButtonText: '',
      cards: []
    };
  }

  componentDidMount() {
    const { settings } = this.props;
    this.watchForUpdates();
    if (settings.theme === 'SSX') {
      changeTheme('SSX');
    } else if (settings.theme === 'SoleSociety') {
      changeTheme('SoleSociety');
    } else if (settings.theme === 'Noctua') {
      changeTheme('Noctua');
    } else {
      changeTheme('Neutrino');
    }
  }

  componentDidUpdate(prevProps) {
    const { location, checkUserAuth, uid } = this.props;
    if (location !== prevProps.location && checkUserAuth && uid !== '') {
      try {
        checkUserAuth(uid);
        this.setDiscordRichPresence(location.pathname);
      } catch (error) {
        console.error(error);
      }
    }
  }

  setInfoModal = infoModalDetails => {
    this.setState({ ...infoModalDetails });
  };

  setDownloading = boolean => {
    this.setState({
      updateDownloading: boolean
    });
  };

  setRaffleInfo = raffleInfo => {
    this.setState({ raffleInfo });
  };

  addCards = cardsInput => {
    const { cards } = this.state;
    const cardsArray = [];
    const splitCardsArray = cardsInput.split(/\n/);
    splitCardsArray.forEach(card => {
      const cardArray = card.split(':');
      if (
        cardArray.length === 5 &&
        cardTypes.includes(cardArray[1].toLowerCase())
      ) {
        cardsArray.push({
          cardNumber: cardArray[0],
          cardType: cardArray[1],
          expMonth: cardArray[2],
          expYear: cardArray[3],
          cvv: cardArray[4]
        });
      }
    });
    this.setState({
      cards: [...cards, ...cardsArray]
    });
  };

  clearCards = () => {
    this.setState({ cards: [] });
  };

  currentWindowToText = currentWindow => {
    switch (currentWindow) {
      case '/home/proxy-creator':
        return 'Proxy Creator';
      case '/home':
        return 'Home';
      case '/home/proxy-tester':
        return 'Proxy Tester';
      case '/home/account-creator':
        return 'Account Creator';
      case '/home/address-jigger':
        return 'Address Jigger';
      case '/home/oneclick-generator':
        return 'One Click Generator';
      case '/home/oneclick-tester':
        return 'One Click Tester';
      case '/home/profile-creator':
        return 'Profile Creator';
      case '/home/profile-task-editor-converter':
        return 'Profile Converter';
      case '/home/raffle-bot':
        return 'Raffle Bot';
      case '/home/settings':
        return 'Settings';
      case '/home/browser':
        return 'Browser';
      default:
        return '';
    }
  };

  setDiscordRichPresence = currentWindow => {
    const state = this.currentWindowToText(currentWindow);
    ipcRenderer.send(SET_DISCORD_RPC_STATE, { state });
    trackScreenview(this.currentWindowToText(currentWindow));
  };

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

  toggleUpdateModal = () => {
    this.setState(prevProps => ({
      installModal: !prevProps.installModal
    }));
  };

  toggleInfoModal = () => {
    this.setState(prevProps => ({
      infoModalShowing: !prevProps.infoModalShowing
    }));
  };

  watchForUpdates = () => {
    const { updateUpdateStatus } = this.props;
    const eventNames = ipcRenderer.eventNames();
    if (!eventNames.includes(UPDATE_AVAILABLE)) {
      ipcRenderer.on(UPDATE_AVAILABLE, (event, arg) => {
        const update = {};
        update.status = 'Y';
        update.releaseDate = arg.releaseDate;
        update.lastChecked = new Date().getTime();
        update.changelog = arg.releaseNotes;
        update.version = arg.version;
        updateUpdateStatus(update);
        this.setLoading(false, '', false);
        this.toggleUpdateModal();
      });
    }
    if (!eventNames.includes(NO_UPDATE_AVAILABLE)) {
      ipcRenderer.on(NO_UPDATE_AVAILABLE, (event, arg) => {
        const update = {};
        update.status = 'N';
        update.releaseDate = arg.releaseDate;
        update.lastChecked = new Date().getTime();
        update.changelog = arg.releaseNotes;
        update.version = arg.version;
        updateUpdateStatus(update);
        this.setLoading(false, '', false);
      });
    }
    if (!eventNames.includes(UPDATE_DOWNLOADED)) {
      ipcRenderer.on(UPDATE_DOWNLOADED, () => {
        this.setState({
          updateDownloading: false
        });
      });
    }
    ipcRenderer.send(CHECK_FOR_UPDATES);
  };

  render() {
    const {
      sidebarExpand,
      updateDownloading,
      loading,
      loadingText,
      loadingModalClosable,
      raffleInfo,
      infoModalShowing,
      infoModalHeader,
      infoModalBody,
      infoModalFunction,
      infoModalButtonText,
      cards
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
      updateProfile,
      home,
      incrementAccounts,
      incrementProxies,
      incrementRaffles,
      proxies,
      addProxy,
      clearProxies,
      history,
      raffleBot
    } = this.props;
    const {
      setLoading,
      setRaffleInfo,
      setInfoModal,
      setDownloading,
      addCards,
      clearCards
    } = this;
    const appRoutes = [
      {
        path: routes.HOME,
        component: Homepage,
        exact: true,
        props: {
          settings,
          setLoading,
          setRaffleInfo,
          history,
          home,
          setDownloading,
          updateDownloading
        }
      },
      {
        path: routes.PROXY_CREATOR,
        component: ProxyCreator,
        exact: true,
        props: {
          setLoading,
          settings,
          incrementProxies,
          proxies,
          addProxy,
          clearProxies,
          setInfoModal
        }
      },
      {
        path: routes.ACCOUNT_CREATOR,
        component: AccountCreator,
        exact: true,
        props: {
          settings,
          profile,
          setLoading,
          addCreatedAccount,
          removeCreatedAccount,
          removeAllCreatedAccounts,
          accounts,
          incrementAccounts,
          setInfoModal,
          cards
        }
      },
      {
        path: routes.PROXY_TESTER,
        component: ProxyTester,
        exact: true,
        props: { setLoading, settings }
      },
      {
        path: routes.ADDRESS_JIGGER,
        component: AddressJigger,
        exact: true,
        props: {}
      },
      {
        path: routes.ONECLICK_GENERATOR,
        component: OneClickGenerator,
        exact: true,
        props: {
          settings,
          showAcitivtyWindows: settings.showAcitivtyWindows,
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
        props: {}
      },
      {
        path: routes.PROFILE_CREATOR,
        component: ProfileCreator,
        exact: true,
        props: {
          profile,
          updateProfileAttribute,
          clearProfileAttributes,
          updateProfile,
          cards,
          addCards,
          clearCards
        }
      },
      {
        path: routes.PROFILE_TASK_EDITOR_CONVERTER,
        component: ProfileTaskEditorConverter,
        exact: true,
        props: {}
      },
      {
        path: routes.BROWSER,
        component: Browser,
        exact: true,
        props: {
          settings,
          setLoading,
          setInfoModal
        }
      },
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
    if (raffleBot) {
      appRoutes.push({
        path: routes.RAFFLE_BOT,
        component: RaffleBot,
        exact: true,
        props: {
          settings,
          setLoading,
          raffleInfo,
          setRaffleInfo,
          setInfoModal,
          incrementRaffles
        }
      });
    }
    return (
      <Container fluid className="d-flex flex-column h-100">
        <Header settings={settings} />
        <Row className="flex-fill overflow-y-scroll">
          <Col
            id="sidebar"
            className={`${
              sidebarExpand ? 'text-left col-2' : 'text-center col-0_5'
            }`}
          >
            <div>
              <Link to={routes.HOME} alt="Home" title="Home">
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.HOME}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon="home" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Home</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link
                to={routes.PROXY_CREATOR}
                alt="Proxy Creator"
                title="Proxy Creator"
              >
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.PROXY_CREATOR}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon="database" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Proxy Creator</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link
                to={routes.PROXY_TESTER}
                alt="Proxy Tester"
                title="Proxy Tester"
              >
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.PROXY_TESTER}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon="heartbeat" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Proxy Tester</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link
                to={routes.ACCOUNT_CREATOR}
                alt="Account Creator"
                title="Account Creator"
              >
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.ACCOUNT_CREATOR}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon="users" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Account Creator</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link
                to={routes.ADDRESS_JIGGER}
                alt="Address Jigger"
                title="Address Jigger"
              >
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.ADDRESS_JIGGER}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon="envelope" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Address Jigger</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link
                to={routes.ONECLICK_GENERATOR}
                alt="OneClick Generator"
                title="OneClick Generator"
              >
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.ONECLICK_GENERATOR}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon={['fab', 'google']} />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">
                      One Click Generator
                    </span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link
                to={routes.ONECLICK_TESTER}
                alt="OneClick Tester"
                title="OneClick Tester"
              >
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.ONECLICK_TESTER}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon="check-square" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">One Click Tester</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link
                to={routes.PROFILE_CREATOR}
                alt="Profile Creator"
                title="Profile Creator"
              >
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.PROFILE_CREATOR}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon="user" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Profile Creator</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link
                to={routes.PROFILE_TASK_EDITOR_CONVERTER}
                alt="Profile Converter"
                title="Profile Converter"
              >
                <div
                  className={`sidebarIcon ${
                    window.location.hash ===
                    `#${routes.PROFILE_TASK_EDITOR_CONVERTER}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon="sync" />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Profile Converter</span>
                  ) : null}
                </div>
              </Link>
            </div>
            {raffleBot ? (
              <div>
                <Link
                  to={routes.RAFFLE_BOT}
                  alt="Raffle Bot"
                  title="Raffle Bot"
                >
                  <div
                    className={`sidebarIcon ${
                      window.location.hash === `#${routes.RAFFLE_BOT}`
                        ? 'sidebarIconActive'
                        : ''
                    }`}
                  >
                    <FontAwesomeIcon icon="ticket-alt" />
                    {sidebarExpand ? (
                      <span className="sidebarIconLabel">Raffle Bot</span>
                    ) : null}
                  </div>
                </Link>
              </div>
            ) : null}
            <div>
              <Link to={routes.BROWSER} alt="Browser" title="Browser">
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.BROWSER}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon={['fab', 'chrome']} />
                  {sidebarExpand ? (
                    <span className="sidebarIconLabel">Browser</span>
                  ) : null}
                </div>
              </Link>
            </div>
            <div>
              <Link to={routes.SETTINGS} alt="Settings" title="Settings">
                <div
                  className={`sidebarIcon ${
                    window.location.hash === `#${routes.SETTINGS}`
                      ? 'sidebarIconActive'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon="cogs" />
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
        <Modal
          id="infoModal"
          isOpen={infoModalShowing}
          size="lg"
          centered
          toggle={this.toggleInfoModal}
        >
          <ModalHeader toggle={this.toggleInfoModal}>
            {infoModalHeader}
          </ModalHeader>
          <ModalBody>{infoModalBody}</ModalBody>
          <ModalFooter>
            <Button onClick={this.toggleInfoModal}>Close</Button>
            {typeof infoModalFunction === 'function' ? (
              <Button onClick={infoModalFunction}>{infoModalButtonText}</Button>
            ) : null}
          </ModalFooter>
        </Modal>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  settings: state.settings,
  accounts: state.accounts,
  activities: state.activities,
  profile: state.profile,
  home: state.home,
  proxies: state.proxies
});

const mapDispatchToProps = {
  ...SettingsActions,
  ...AccountActions,
  ...ActivityActions,
  ...ProfileActions,
  ...HomeActions,
  ...ProxiesActions
};

Home.propTypes = {
  addProxyProviderAccount: PropTypes.func.isRequired,
  removeProxyProviderAccount: PropTypes.func.isRequired,
  setKeyInSetting: PropTypes.func.isRequired,
  updateUpdateStatus: PropTypes.func.isRequired,
  settings: PropTypes.objectOf(PropTypes.any).isRequired,
  addCreatedAccount: PropTypes.func.isRequired,
  removeCreatedAccount: PropTypes.func.isRequired,
  raffleBot: PropTypes.bool.isRequired,
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
  updateProfile: PropTypes.func.isRequired,
  home: PropTypes.shape({
    rafflesEntered: PropTypes.number.isRequired,
    proxiesCreates: PropTypes.number.isRequired,
    accountsCreated: PropTypes.number.isRequired
  }).isRequired,
  incrementAccounts: PropTypes.func.isRequired,
  incrementProxies: PropTypes.func.isRequired,
  incrementRaffles: PropTypes.func.isRequired,
  proxies: PropTypes.shape({
    proxies: PropTypes.arrayOf(PropTypes.any)
  }).isRequired,
  addProxy: PropTypes.func.isRequired,
  clearProxies: PropTypes.func.isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
