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
import RaffleBot from '../components/RaffleBot';
import Settings from '../components/Settings';
import { firestore, auth } from '../api/firebase/firebase';
import { BarLoader } from 'react-spinners';
import { SET_DISCORD_RPC_STATE } from '../utils/constants';
const ipcRenderer = require('electron').ipcRenderer;

class Home extends Component {
  constructor(props) {
    super(props);
    this.activityWindows = {};
    this.state = {
      loading: false,
      loadingMessage: '',
      activeWindow: 'FrontPage',
      activityGeneratorAccountsClases: [],
      infoModal: false,
      infoModalHeader: '',
      infoModalBody: '',
      infoModalFooter: ''
    };
  }

  changeLoading = (text, bool) => {
    this.setState({
      loadingMessage: text,
      loading: bool
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
        return 'Converting Profiles/Tasks';
      case 'ActivityGenerator':
        return 'Generating One Clicks';
      case 'RaffleBot':
        return 'Entering Raffles';
      case 'ProfileGenerator':
        return 'Generating Bot Profiles';
      case 'Settings':
        return 'Changing Settings';
    }
  };

  setDiscordRichPresence = currentWindow => {
    const state = this.currentWindowToText(currentWindow);
    ipcRenderer.send(SET_DISCORD_RPC_STATE, { state });
  };

  returnActiveComponent = activeComponent => {
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
        return <RaffleBot />;
      case 'ProfileGenerator':
        return <ProfileGenerator profiles={this.props.profiles} onAddProfile={this.props.onAddProfile} changeInfoModal={this.changeInfoModal} />;
      case 'Settings':
        return (
          <Settings
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

  watchForActiveStatus = () => {
    const user = auth.currentUser;
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
  };

  componentDidMount() {
    if (process.env.NODE_ENV !== 'development') {
      this.watchForActiveStatus();
    }
  }

  render() {
    return (
      <Container fluid className="d-flex flex-column">
        <Header changeActiveComponent={this.changeActiveComponent} activeWindow={this.state.activeWindow} />
        <Row className="homeContainer">{this.returnActiveComponent(this.state.activeWindow)}</Row>
        <Footer type="homepage" />
        <Modal isOpen={this.state.loading} size="sm" centered className="text-center">
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
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  settings: state.neutrinoSettingsReducer,
  accounts: state.neutrinoAccountsReducer,
  activities: state.neutrinoActivityReducer,
  profiles: state.neutrinoProfileReducer
});

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
