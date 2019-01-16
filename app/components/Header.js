import React, { Component } from 'react';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Minimize from '../img/svg/minimise.svg';
import Close from '../img/svg/close.svg';
import { remote } from 'electron';
import { CSSTransition } from 'react-transition-group';

const componentToNameMapping = {
  FrontPage: 'home',
  ProxyCreator: 'proxy creator',
  ProxyTester: 'proxy tester',
  AccountCreator: 'account creator',
  AddressJigger: 'address jigger',
  ProfileTaskConverter: 'profile/task converter',
  // RaffleBot: 'raffles',
  Settings: 'settings'
};

const nameToSymbolMapping = {
  FrontPage: <FontAwesome name="home" />,
  ProxyCreator: <FontAwesome name="database" />,
  ProxyTester: <FontAwesome name="heartbeat" />,
  AccountCreator: <FontAwesome name="plus" />,
  AddressJigger: <FontAwesome name="cog" />,
  ProfileTaskConverter: <FontAwesome name="retweet" />,
  RaffleBot: <FontAwesome name="ticket" />,
  Settings: <FontAwesome name="cogs" />
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
    const dropDownNames = Object.keys(componentToNameMapping).filter(elem => elem !== this.props.activeWindow);
    return dropDownNames.map((elem, index) => (
      <DropdownItem
        key={`dropdown-${index}`}
        onClick={() => {
          this.props.changeActiveComponent(elem);
        }}
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
      <Row className="topbar">
        <Col xs="6" className="topBarLogoCol text-center d-flex align-items-center">
          <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
            <Dropdown isOpen={this.state.dropdown} toggle={this.toggleDropdown}>
              <DropdownToggle id="menuDropDownToggle">{this.returnCurrentPageSymbol()}</DropdownToggle>
              <DropdownMenu id="menuDropDown">{this.returnDropDownOptions()}</DropdownMenu>
            </Dropdown>
          </CSSTransition>
        </Col>
        <Col xs="4" className="topbarMiddle" />
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
