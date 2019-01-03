import React, { Component } from 'react';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';

export default class RaffleBot extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Col className="activeWindow">
          <h1>Raffle Bot Page</h1>
        </Col>
      </CSSTransition>
    );
  }
}
