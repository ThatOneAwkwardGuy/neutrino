import React, { Component } from 'react';
import { Container, Row, Col, Input, Button } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import { generateUEID } from '../../utils/utils';
import unknownImage from '../../images/unknown-image.svg';
import eveaio from '../../images/eveaio.jpg';
import cybersole from '../../images/cybersole.svg';
import ghostaio from '../../images/ghostaio.jpg';
import hastey from '../../images/hastey.jpg';
import nsb from '../../images/nsb.jpg';
import projectdestroyer from '../../images/projectdestroyer.png';
import soleaio from '../../images/soleaio.jpg';

const { dialog } = require('electron').remote;

const profileConversionOptions = [
  'CyberSole',
  'Project Destroyer',
  'Hastey',
  'EVE AIO',
  'Phantom',
  'Ghost',
  'CSV',
  'NSB',
  'SOLE AIO'
];

const profileConversionOptionsMapping = {
  'EVE AIO': eveaio,
  CyberSole: cybersole,
  Ghost: ghostaio,
  Hastey: hastey,
  NSB: nsb,
  'Project Destroyer': projectdestroyer,
  'SOLE AIO': soleaio,
  CSV: unknownImage,
  Unknown: unknownImage,
  Phantom: unknownImage
};

export default class ProfileTaskEditorConverter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fromBot: 'Unknown',
      toBot: 'Unknown'
    };
  }

  returnOptions = (optionsArray, name) =>
    optionsArray.map(elem => (
      <option key={`option-${name}-${generateUEID()}`}>{elem}</option>
    ));

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleFromBotChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
      toBot: 'Unknown'
    });
  };

  loadFile = () => {
    dialog.showOpenDialog(
      null,
      {
        filters: [
          { name: 'Profiles', extensions: ['csv', 'json', 'txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      },
      filePaths => {
        const filePath = filePaths[0];
        console.log(filePath);
      }
    );
  };

  render() {
    const { fromBot, toBot } = this.state;
    return (
      <Row className="h-100">
        <Col className="h-100">
          <Container fluid className="p-0 h-100 d-flex flex-column">
            <Row className="h-100 overflow-hidden align-items-center justify-content-center">
              <Col xs="3">
                <Container>
                  <Row className="justify-content-center">
                    <Col>
                      <img
                        className="UnknownImage"
                        alt="unknownImage"
                        src={profileConversionOptionsMapping[fromBot]}
                      />
                    </Col>
                  </Row>
                  <Row className="my-5">
                    <Col>
                      <Input
                        name="fromBot"
                        id="fromBot"
                        type="select"
                        onChange={this.handleFromBotChange}
                        value={fromBot}
                      >
                        <option value="Unknown">
                          Select a bot to convert from
                        </option>
                        {this.returnOptions(
                          profileConversionOptions,
                          'fromBot'
                        )}
                      </Input>
                    </Col>
                  </Row>
                </Container>
              </Col>
              <Col xs="3">
                <Container>
                  <Row>
                    <Col>
                      <Button className="py-5" onClick={this.loadFile}>
                        <FontAwesome name="save" size="2x" className="mr-3" />
                        Load File
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </Col>
              <Col xs="3">
                <Container>
                  <Row className="justify-content-center">
                    <Col>
                      <img
                        className="UnknownImage"
                        alt="unknownImage"
                        src={profileConversionOptionsMapping[toBot]}
                      />
                    </Col>
                  </Row>
                  <Row className="my-5">
                    <Col>
                      <Input
                        name="toBot"
                        id="toBot"
                        type="select"
                        onChange={this.handleChange}
                        value={toBot}
                      >
                        <option value="Unknown">
                          Select a bot to convert to
                        </option>
                        {this.returnOptions(
                          profileConversionOptions.filter(
                            option => option !== fromBot
                          ),
                          'toBot'
                        )}
                      </Input>
                    </Col>
                  </Row>
                </Container>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    );
  }
}
