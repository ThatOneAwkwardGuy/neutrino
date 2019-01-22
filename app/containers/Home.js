import React, { Component } from 'react';
import { Container, Row } from 'reactstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { connect } from 'react-redux';
import { updateSettings } from '../actions/settings';
import ProxyCreater from '../components/ProxyCreator';
import ProxyTester from '../components/ProxyTester';
import FrontPage from '../components/FrontPage';
import AccountCreator from '../components/AccountCreator';
import AddressJigger from '../components/AddressJigger';
import ProfileTaskConverter from '../components/ProfileTaskConverter';
import RaffleBot from '../components/RaffleBot';
import Settings from '../components/Settings';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeWindow: 'FrontPage'
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
        return <AccountCreator />;
      case 'AddressJigger':
        return <AddressJigger />;
      case 'ProfileTaskConverter':
        return <ProfileTaskConverter />;
      case 'RaffleBot':
        return <RaffleBot />;
      case 'Settings':
        return <Settings settings={this.props.settings} onUpdateSettings={this.props.onUpdateSettings} />;
    }
  };

  changeActiveComponent = activeComponent => {
    this.setState({ activeWindow: activeComponent });
  };

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
  tasks: state.taskReducer.tasks,
  profiles: state.profileReducer.profiles,
  proxies: state.proxyReducer.proxies,
  settings: state.settingsReducer
});

const mapActionsToProps = dispatch => ({
  onUpdateSettings: content => {
    dispatch(updateSettings(content));
  }
});

export default connect(
  mapStateToProps,
  mapActionsToProps
)(Home);
