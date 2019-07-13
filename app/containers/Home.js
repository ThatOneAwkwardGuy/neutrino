import React, { Component } from 'react';
import { Container, Row, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { connect } from 'react-redux';
import { updateSettings } from '../actions/settings';
import { createAccount, removeAccount, removeAllAccounts } from '../actions/accounts';
import { createActivity, removeActivity, removeAllActivities, updateActivity } from '../actions/activity';
import { addProfile, removeProfile } from '../actions/profile';
import ProxyCreater from '../components/ProxyCreator';
import ProxyTester from '../components/ProxyTester';
import FrontPage from '../components/FrontPage';
import AccountCreator from '../components/AccountCreator';
import ActivityGenerator from '../components/ActivityGenerator';
import AddressJigger from '../components/AddressJigger';
import ProfileTaskConverter from '../components/ProfileTaskConverter';
import ProfileGenerator from '../components/ProfileGenerator';
import OneClickTester from '../components/OneClickTester';
import RaffleBot from '../components/RaffleBot';
import Settings from '../components/Settings';
import { firestore, auth } from '../api/firebase/firebase';
import { BarLoader } from 'react-spinners';
import {
  SET_DISCORD_RPC_STATE,
  UPDATE_AVAILABLE,
  NO_UPDATE_AVAILABLE,
  CHECK_FOR_UPDATES,
  START_UPDATE,
  UPDATE_DOWNLOADED,
  START_INSTALL
} from '../utils/constants';
import { stat } from 'fs';
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;
const windowManager = remote.require('electron-window-manager');
const parse = require('html-react-parser');
const log = require('electron-log');

class Home extends Component {
  constructor(props) {
    super(props);
    this.activityWindows = {};
    this.state = {
      loading: false,
      loadingModalClosable: false,
      loadingMessage: '',
      activeWindow: 'FrontPage',
      activityGeneratorAccountsClases: [],
      infoModal: false,
      updateModal: false,
      installModal: false,
      infoModalHeader: '',
      infoModalBody: '',
      infoModalFooter: '',
      updateDownloading: false
    };
  }

  changeLoading = (text, bool, closable) => {
    this.setState({
      loadingMessage: text,
      loading: bool,
      loadingModalClosable: closable
    });
  };

  changeInfoModal = (infoModal, infoModalHeader, infoModalBody, infoModalFooter) => {
    this.setState({
      infoModal,
      infoModalHeader,
      infoModalBody,
      infoModalFooter
    });
  };

  toggleInfoModal = () => {
    this.setState({
      infoModal: !this.state.infoModal
    });
  };

  toggleUpdateModal = () => {
    this.setState({
      updateModal: !this.state.updateModal
    });
  };

  toggleInstallModal = () => {
    this.setState({
      installModal: !this.state.installModal
    });
  };

  toggleLoading = () => {
    this.setState({
      loading: !this.state.loading
    });
  };

  currentWindowToText = currentWindow => {
    switch (currentWindow) {
      case 'FrontPage':
        return 'On The Homepage';
      case 'ProxyCreator':
        return 'Creating Proxies';
      case 'ProxyTester':
        return 'Testing Proxies';
      case 'AccountCreator':
        return 'Creating Accounts';
      case 'AddressJigger':
        return 'Jigging Addresses';
      case 'ProfileTaskConverter':
        return 'Converting Profiles';
      case 'ActivityGenerator':
        return 'Generating One Clicks';
      case 'RaffleBot':
        return 'Entering Raffles';
      case 'ProfileGenerator':
        return 'Generating Bot Profiles';
      case 'OneClickTester':
        return 'One-click Tester';
      case 'Settings':
        return 'Changing Settings';
    }
  };

  setAllAcitivities = status => {
    this.props.activities.activities.forEach((activity, index) => {
      if (activity.status !== status) {
        activity.status = status;
        this.props.onUpdateActivity(index, activity);
      }
    });
  };

  setDiscordRichPresence = currentWindow => {
    const state = this.currentWindowToText(currentWindow);
    ipcRenderer.send(SET_DISCORD_RPC_STATE, { state });
  };

  returnActiveComponent = activeComponent => {
    this.watchForActiveStatus();
    this.setDiscordRichPresence(activeComponent);
    switch (activeComponent) {
      case 'FrontPage':
        return <FrontPage />;
      case 'ProxyCreator':
        return <ProxyCreater settings={this.props.settings} setLoading={this.changeLoading} changeInfoModal={this.changeInfoModal} />;
      case 'ProxyTester':
        return <ProxyTester setLoading={this.changeLoading} changeInfoModal={this.changeInfoModal} />;
      case 'AccountCreator':
        return (
          <AccountCreator
            onCreateAccount={this.props.onCreateAccount}
            onRemoveAccount={this.props.onRemoveAccount}
            onRemoveAllAccounts={this.props.onRemoveAllAccounts}
            accounts={this.props.accounts}
            setLoading={this.changeLoading}
            changeInfoModal={this.changeInfoModal}
          />
        );
      case 'AddressJigger':
        return <AddressJigger changeInfoModal={this.changeInfoModal} />;
      case 'ProfileTaskConverter':
        return <ProfileTaskConverter changeInfoModal={this.changeInfoModal} />;
      case 'ActivityGenerator':
        return (
          <ActivityGenerator
            onCreateActivity={this.props.onCreateActivity}
            onRemoveActivity={this.props.onRemoveActivity}
            onRemoveAllActivities={this.props.onRemoveAllActivities}
            onUpdateActivity={this.props.onUpdateActivity}
            activities={this.props.activities.activities}
            setActivityWindow={this.setActivityWindow}
            activityWindows={this.activityWindows}
            settings={this.props.settings}
            setLoading={this.changeLoading}
            changeInfoModal={this.changeInfoModal}
          />
        );
      case 'RaffleBot':
        return <RaffleBot setLoading={this.changeLoading} changeInfoModal={this.changeInfoModal} />;
      case 'ProfileGenerator':
        return <ProfileGenerator profiles={this.props.profiles} onAddProfile={this.props.onAddProfile} changeInfoModal={this.changeInfoModal} />;
      case 'OneClickTester':
        return <OneClickTester />;
      case 'Settings':
        return (
          <Settings
            setLoading={this.changeLoading}
            history={this.props.history}
            settings={this.props.settings}
            onUpdateSettings={this.props.onUpdateSettings}
            changeInfoModal={this.changeInfoModal}
          />
        );
    }
  };

  setActivityWindow = (token, activityWindow) => {
    this.activityWindows[token] = activityWindow;
  };

  changeActiveComponent = async activeComponent => {
    this.setState({ activeWindow: activeComponent });
  };

  triggerDownload = () => {
    this.setState({
      updateDownloading: true
    });
    ipcRenderer.send(START_UPDATE);
    this.toggleUpdateModal();
  };

  triggerInstall = () => {
    ipcRenderer.send(START_INSTALL);
    this.toggleInstallModal();
  };

  watchForActiveStatus = async () => {
    await auth.onAuthStateChanged(async user => {
      if (user !== null) {
        firestore
          .collection('users')
          .doc(user.uid)
          .onSnapshot(snapshot => {
            const data = snapshot.data();
            if (data.status !== 'active') {
              auth.signOut();
              this.props.history.push('/');
            }
          });
      }
    });
  };

  watchForUpdates = () => {
    ipcRenderer.on(UPDATE_AVAILABLE, (event, arg) => {
      const settings = { ...this.props.settings };
      settings.update = { ...settings.update };
      settings.update.status = 'Y';
      settings.update.releaseDate = arg.releaseDate;
      settings.update.lastChecked = new Date().getTime();
      settings.update.changelog = arg.releaseNotes;
      settings.update.version = arg.version;
      this.props.onUpdateSettings(settings);
      this.changeLoading('', false);
      this.toggleUpdateModal();
    });
    ipcRenderer.on(NO_UPDATE_AVAILABLE, (event, arg) => {
      const settings = { ...this.props.settings };
      settings.update = { ...settings.update };
      settings.update.status = 'N';
      settings.update.releaseDate = arg.releaseDate;
      settings.update.lastChecked = new Date().getTime();
      settings.update.changelog = arg.releaseNotes;
      settings.update.version = arg.version;
      this.props.onUpdateSettings(settings);
      this.changeLoading('', false);
    });
    ipcRenderer.on(UPDATE_DOWNLOADED, (event, arg) => {
      console.log(arg);
      this.setState({
        updateDownloading: false
      });
      this.toggleInstallModal();
    });
    ipcRenderer.send(CHECK_FOR_UPDATES);
  };

  componentDidMount() {
    // if (process.env.NODE_ENV !== 'development') {
    this.watchForActiveStatus();
    // }
    this.watchForUpdates();
    windowManager.closeAll();
    this.setAllAcitivities('Not Started');
  }

  componentDidCatch(error, info) {
    log.error(error);
    log.error(info);
  }

  render() {
    return (
      <Container fluid className="d-flex flex-column">
        <Header changeActiveComponent={this.changeActiveComponent} activeWindow={this.state.activeWindow} />
        <Row className="homeContainer">{this.returnActiveComponent(this.state.activeWindow)}</Row>
        <Footer type="homepage" updateDownloading={this.state.updateDownloading} />
        <Modal isOpen={this.state.loading} size="sm" centered className="text-center">
          {this.state.loadingModalClosable ? <ModalHeader style={{ border: 'none' }} toggle={this.toggleLoading} /> : null}
          <BarLoader width={100} widthUnit="%" color="#2745fb" />
          {this.state.loadingMessage ? <p className="p-3">{this.state.loadingMessage}</p> : null}
        </Modal>
        <Modal isOpen={this.state.infoModal} size="md" centered toggle={this.toggleInfoModal}>
          <ModalHeader style={{ border: 'none' }}>{this.state.infoModalHeader}</ModalHeader>
          <ModalBody>{this.state.infoModalBody}</ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={this.toggleInfoModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.updateModal} size="md" centered toggle={this.toggleUpdateModal}>
          <ModalHeader style={{ border: 'none' }} toggle={this.toggleUpdateModal}>
            Update Available
          </ModalHeader>
          <ModalBody>
            <p>Neutrino version {this.props.settings.update.version} is now available</p>
            <p className="updateChangelog">{parse(this.props.settings.update.changelog)}</p>
            <small>The update will download in the background and alert you when you can install it.</small>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={this.toggleUpdateModal}>
              Close
            </Button>
            <Button className="nButton" onClick={this.triggerDownload}>
              Download
            </Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.installModal} size="md" centered toggle={this.toggleInstallModal}>
          <ModalHeader style={{ border: 'none' }} toggle={this.toggleInstallModal}>
            Update Ready
          </ModalHeader>
          <ModalBody className="text-center">
            <p>The update is now ready to be installed.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={this.toggleInstallModal}>
              Close
            </Button>
            <Button className="nButton" onClick={this.triggerInstall}>
              Install
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    settings: state.neutrinoSettingsReducer,
    accounts: state.neutrinoAccountsReducer,
    activities: state.neutrinoActivityReducer,
    profiles: state.neutrinoProfileReducer
  };
};

const mapActionsToProps = dispatch => ({
  onUpdateSettings: content => {
    dispatch(updateSettings(content));
  },
  onCreateAccount: content => {
    dispatch(createAccount(content));
  },
  onRemoveAccount: content => {
    dispatch(removeAccount(content));
  },
  onRemoveAllAccounts: content => {
    dispatch(removeAllAccounts(content));
  },
  onCreateActivity: content => {
    dispatch(createActivity(content));
  },
  onRemoveActivity: content => {
    dispatch(removeActivity(content));
  },
  onRemoveAllActivities: content => {
    dispatch(removeAllActivities(content));
  },
  onUpdateActivity: content => {
    dispatch(updateActivity(content));
  },
  onAddProfile: content => {
    dispatch(addProfile(content));
  },
  onRemoveProfile: content => {
    dispatch(removeProfile(content));
  }
});

export default connect(
  mapStateToProps,
  mapActionsToProps
)(Home);
