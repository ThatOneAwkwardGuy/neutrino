import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { remote } from 'electron';
import minimiseIcon from '../../images/minimise.svg';
import closeIcon from '../../images/close.svg';

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  minimiseWindow = () => {
    remote.getCurrentWindow().minimize();
  };

  closeWindow = () => {
    remote.getCurrentWindow().close();
  };

  render() {
    return (
      <Row
        id="header"
        className="justify-content-end align-items-center text-right"
      >
        <Col className="col-0_5 col">
          <span role="button" tabIndex="0" onClick={this.minimiseWindow}>
            <img
              draggable="false"
              alt="Minimise Window"
              className="headerIcon"
              src={minimiseIcon}
            />
          </span>
        </Col>
        <Col className="col-0_5 col">
          <span role="button" tabIndex="0" onClick={this.closeWindow}>
            <img
              draggable="false"
              alt="Close Window"
              className="headerIcon"
              src={closeIcon}
            />
          </span>
        </Col>
      </Row>
    );
  }
}
