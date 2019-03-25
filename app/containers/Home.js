import React, { Component } from 'react';
import { Container, Row } from 'reactstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { connect } from 'react-redux';
import { updateSettings } from '../actions/settings';
import { createAccount, removeAccount, removeAllAccounts } from '../actions/accounts';
import { createActivity, removeActivity, removeAllActivities, updateActivity } from '../actions/activity';
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
const remote = require('electron').remote;
const windowManager = remote.require('electron-window-manager');

class Home extends Component {
  constructor(props) {
    super(props);
    this.activityWindows = {};
    this.state = {
      activeWindow: 'FrontPage',
      activityGeneratorAccountsClases: []
    };
  }

  returnActiveComponent = activeComponent => {
    switch (activeComponent) {
      case 'FrontPage':
        return <FrontPage />;
      case 'ProxyCreator':
        return <ProxyCreater settings={this.props.settings} />;
      case 'ProxyTester':
        return <ProxyTester />;
      case 'AccountCreator':
        return (
          <AccountCreator
            onCreateAccount={this.props.onCreateAccount}
            onRemoveAccount={this.props.onRemoveAccount}
            onRemoveAllAccounts={this.props.onRemoveAllAccounts}
            accounts={this.props.accounts}
          />
        );
      case 'AddressJigger':
        return <AddressJigger />;
      case 'ProfileTaskConverter':
        return <ProfileTaskConverter />;
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
          />
        );
      case 'RaffleBot':
        return <RaffleBot />;
      case 'ProfileGenerator':
        return <ProfileGenerator />;
      case 'Settings':
        return <Settings settings={this.props.settings} onUpdateSettings={this.props.onUpdateSettings} />;
    }
  };

  setActivityWindow = (token, activityWindow) => {
    this.activityWindows[token] = activityWindow;
  };

  changeActiveComponent = activeComponent => {
    this.setState({ activeWindow: activeComponent });
  };

  // componentDidMount() {
  //   console.log(windowManager.windows);
  //   for (const window in windowManager.windows) {
  //     windowManager.windows[window].close();
  //   }
  // }

  render() {
    return (
      <Container fluid className="d-flex flex-column">
        <Header changeActiveComponent={this.changeActiveComponent} activeWindow={this.state.activeWindow} />
        <Row className="homeContainer">{this.returnActiveComponent(this.state.activeWindow)}</Row>
        <Footer type="homepage" />
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  settings: state.neutrinoSettingsReducer,
  accounts: state.neutrinoAccountsReducer,
  activities: state.neutrinoActivityReducer
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
  }
});

export default connect(
  mapStateToProps,
  mapActionsToProps
)(Home);
