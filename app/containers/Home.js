import React, { Component } from 'react';
import { Alert, Container, Row, Col } from 'reactstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { auth } from '../api/firebase';
import ProxyCreater from '../components/ProxyCreator';
import ProxyTester from '../components/ProxyTester';
import FrontPage from '../components/FrontPage';
import AccountCreator from '../components/AccountCreator';
import AddressJigger from '../components/AddressJigger';
import ProfileTaskConverter from '../components/ProfileTaskConverter';
import RaffleBot from '../components/RaffleBot';

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
        return <ProxyCreater />;
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

export default Home;
