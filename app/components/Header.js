import React, { Component } from 'react';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Minimize from '../img/svg/minimise.svg';
import Close from '../img/svg/close.svg';
import { remote } from 'electron';
import { CSSTransition } from 'react-transition-group';

const componentToNameMapping = {
  FrontPage: 'Home',
  ProxyCreator: 'Proxy Creator',
  ProxyTester: 'Proxy Tester',
  AccountCreator: 'Account Creator',
  AddressJigger: 'Address Jigger',
  ProfileGenerator: 'Profile Generator',
  // ProfileTaskConverter: 'Profile/Task Converter',
  ActivityGenerator: 'Activity Generator',
  // RaffleBot: 'raffles',
  OneClickTester: 'One-click Tester',
  Settings: 'Settings'
};

const nameToSymbolMapping = {
  FrontPage: <FontAwesome name="home" />,
  ProxyCreator: <FontAwesome name="database" />,
  ProxyTester: <FontAwesome name="heartbeat" />,
  AccountCreator: <FontAwesome name="plus" />,
  AddressJigger: <FontAwesome name="cog" />,
  ProfileTaskConverter: <FontAwesome name="retweet" />,
  RaffleBot: <FontAwesome name="ticket" />,
  Settings: <FontAwesome name="cogs" />,
  ActivityGenerator: <FontAwesome name="google" />,
  ProfileGenerator: <FontAwesome name="id-card" />,
  OneClickTester: <FontAwesome name="check" />
};

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdown: false
    };
  }

  minimiseWindow = () => {
    remote.getCurrentWindow().minimize();
  };

  closeWindow = () => {
    remote.getCurrentWindow().close();
  };

  toggleDropdown = () => {
    this.setState({ dropdown: !this.state.dropdown });
  };

  returnDropDownOptions = () => {
    const dropDownNames = Object.keys(componentToNameMapping);
    return dropDownNames.map((elem, index) => (
      <DropdownItem
        key={`dropdown-${index}`}
        onClick={() => {
          this.props.changeActiveComponent(elem);
        }}
        className={`headerDropdown ${this.props.activeWindow === elem ? 'activeDropdown' : ''}`}
      >
        {nameToSymbolMapping[elem]}
        {componentToNameMapping[elem]}
      </DropdownItem>
    ));
  };

  returnCurrentPageSymbol = () => {
    return (
      <div>
        {nameToSymbolMapping[this.props.activeWindow]}
        {componentToNameMapping[this.props.activeWindow]}
      </div>
    );
  };

  render() {
    return (
      <Row className="topbar" style={this.props.headerType !== 'Login' ? { borderLeft: 'solid 5px #2745fb' } : {}}>
        <Col xs="3" className="topBarLogoCol text-center d-flex align-items-center">
          {this.props.headerType !== 'Login' ? (
            <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
              <Dropdown isOpen={this.state.dropdown} toggle={this.toggleDropdown} style={{ position: 'absolute', zIndex: '100' }}>
                <DropdownToggle id="menuDropDownToggle">{this.returnCurrentPageSymbol()}</DropdownToggle>
                <DropdownMenu id="menuDropDown">{this.returnDropDownOptions()}</DropdownMenu>
              </Dropdown>
            </CSSTransition>
          ) : (
            ''
          )}
        </Col>
        <Col xs="7" className="topbarMiddle" />
        <Col xs="1" className="text-right topbarOptionsCol">
          <a
            className="windowButton"
            onClick={() => {
              this.minimiseWindow();
            }}
          >
            <img src={Minimize} />
          </a>
        </Col>
        <Col xs="1" className="text-left topbarOptionsCol">
          <a
            className="windowButton"
            onClick={() => {
              this.closeWindow();
            }}
          >
            <img src={Close} />
          </a>
        </Col>
      </Row>
    );
  }
}
