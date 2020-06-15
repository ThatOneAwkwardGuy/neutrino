import React, { Component } from 'react';
import { Container, Row, Col, Input, Button } from 'reactstrap';
import { withToastManager } from 'react-toast-notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

import { generateUEID } from '../../utils/utils';
import { convertToBase } from './functions';
import { convertFromBase } from '../ProfileCreator/functions';
import unknownImage from '../../images/unknown-image.svg';
import eveaio from '../../images/eveaio.jpg';
import cybersole from '../../images/cybersole.svg';
import ghostaio from '../../images/ghostaio.png';
import hastey from '../../images/hastey.jpg';
import nsb from '../../images/nsb.jpg';
import projectdestroyer from '../../images/projectdestroyer.png';
import soleaio from '../../images/soleaio.jpg';
import phantom from '../../images/phantom.png';
import csvLogo from '../../images/csv.png';
import balko from '../../images/balko.jpg';
import dashe from '../../images/dashe.jpg';
import kodai from '../../images/kodai.jpg';
import tks from '../../images/tks.jpg';
import neutrino from '../../images/icon.png';
import adept from '../../images/adept.jpg';

const { dialog } = require('electron').remote;
const fsPromises = require('fs').promises;
const csv = require('csvtojson');
const fs = require('fs');
const xml2js = require('xml2js');

const profileConversionOptions = [
  'CyberSole',
  'Project Destroyer',
  'Hastey',
  'EVE AIO',
  'Phantom',
  'Ghost',
  'CSV',
  'NSB',
  'SOLE AIO',
  'Balko',
  'Dashe',
  'Kodai',
  'TKS',
  'Neutrino',
  'Adept'
];

const profileConversionOptionsMapping = {
  'EVE AIO': eveaio,
  CyberSole: cybersole,
  Ghost: ghostaio,
  Hastey: hastey,
  NSB: nsb,
  'Project Destroyer': projectdestroyer,
  'SOLE AIO': soleaio,
  Phantom: phantom,
  CSV: csvLogo,
  Balko: balko,
  Dashe: dashe,
  Kodai: kodai,
  TKS: tks,
  Neutrino: neutrino,
  Adept: adept,
  Unknown: unknownImage
};

class ProfileTaskEditorConverter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fromBot: 'Unknown',
      toBot: 'Unknown',
      profiles: []
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
    const { toBot } = this.state;
    this.setState({
      [e.target.name]: e.target.value,
      toBot: e.target.value === toBot ? 'Unknown' : toBot
    });
  };

  loadFile = async () => {
    const { fromBot } = this.state;
    const { toastManager } = this.props;
    const filePaths = await dialog.showOpenDialog(null, {
      filters: [
        { name: 'Profiles', extensions: ['csv', 'xml', 'json', 'txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    const filePath = filePaths.filePaths[0];
    if (!filePaths.canceled) {
      try {
        const file = await fsPromises.readFile(filePath, { encoding: 'utf-8' });
        let processedFile = null;
        if (filePath.split('.').slice(-1)[0] === 'csv') {
          const csvToJSON = await csv().fromString(file);
          processedFile = csvToJSON;
        } else if (filePath.split('.').slice(-1)[0] === 'xml') {
          const xmlFile = await xml2js.parseStringPromise(file, {
            trim: true,
            childkey: 'Profile',
            explicitArray: false
          });
          processedFile =
            xmlFile.ArrayOfProfile.Profile.length === undefined
              ? [xmlFile.ArrayOfProfile.Profile]
              : xmlFile.ArrayOfProfile.Profile;
        } else if (
          [
            'Project Destroyer',
            'Hastey',
            'EVE AIO',
            'Phantom',
            'NSB',
            'SOLE AIO'
          ].includes(fromBot)
        ) {
          processedFile = JSON.parse(file);
        } else if (fromBot === 'Adept') {
          const parsedFile = JSON.parse(file);
          if (parsedFile.length === undefined) {
            processedFile = [parsedFile];
          } else {
            processedFile = parsedFile;
          }
        } else if (fromBot === 'TKS') {
          processedFile = JSON.parse(file).Profiles;
        } else {
          processedFile = Object.values(JSON.parse(file));
        }
        this.setState({
          profiles: processedFile.filter(
            profile =>
              profile !== undefined &&
              profile !== null &&
              typeof profile === 'object'
          )
        });
      } catch (error) {
        toastManager.add(error.message, {
          appearance: 'error',
          autoDismiss: true,
          pauseOnHover: true
        });
      }
    }
  };

  convertToXML = profiles => {
    const builder = new xml2js.Builder({ explicitArray: true });
    const xml = builder.buildObject({
      ArrayOfProfile: {
        $: {
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema'
        },
        Profile: profiles
      }
    });
    return xml;
  };

  exportFile = async () => {
    const { profiles, fromBot, toBot } = this.state;
    const { toastManager } = this.props;
    try {
      let filteredProfiles = [...profiles];
      if (fromBot === 'NSB') {
        filteredProfiles = filteredProfiles.filter(profile => {
          const keys = Object.keys(profile);
          return keys.includes('shipping') && keys.includes('billing');
        });
      }
      const baseProfiles = filteredProfiles.map(profile =>
        convertToBase(fromBot, profile)
      );
      const convertedProfiles = baseProfiles.map((profile, index) =>
        convertFromBase(index, toBot, profile)
      );
      let extension = 'json';
      let file = null;
      if (toBot === 'Kodai') {
        extension = 'txt';
        file = JSON.stringify(convertedProfiles);
      } else if (toBot === 'CSV') {
        extension = 'csv';
        file = this.convertToCSVString(convertedProfiles);
      } else if (toBot === 'EVE AIO') {
        extension = 'xml';

        file = this.convertToXML(convertedProfiles);
      } else {
        file = JSON.stringify(convertedProfiles);
      }
      const filePaths = await dialog.showSaveDialog({
        title: 'name',
        defaultPath: `~/${toBot} Profiles (Converted From ${fromBot}).${extension}`,
        filters: [
          {
            name: `${toBot} Profiles (Converted From ${fromBot})`,
            extensions: [extension]
          }
        ]
      });
      if (!filePaths.canceled) {
        fs.writeFile(filePaths.filePath, file, err => {
          if (err) console.error(err);
        });
        toastManager.add(
          `Successfully converted ${fromBot} profiles to ${toBot} profiles`,
          {
            appearance: 'success',
            autoDismiss: true,
            pauseOnHover: true
          }
        );
      }
    } catch (error) {
      console.log(error);
      toastManager.add(error.message, {
        appearance: 'error',
        autoDismiss: true,
        pauseOnHover: true
      });
    }
  };

  convertToCSVString = profiles =>
    `${Object.keys(profiles[0]).join(',')}\n${profiles
      .map(profile => Object.values(profile).join(','))
      .join('\n')}`;

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
                          profileConversionOptions.sort(),
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
                      <Button
                        className="py-5"
                        onClick={this.loadFile}
                        disabled={fromBot === 'Unknown'}
                      >
                        <FontAwesomeIcon
                          icon="save"
                          size="2x"
                          className="mr-3"
                        />
                        Load Profiles
                      </Button>
                    </Col>
                  </Row>
                  <Row className="my-5">
                    <Col>
                      <Button
                        className="py-5"
                        onClick={this.exportFile}
                        disabled={fromBot === 'Unknown' || toBot === 'Unknown'}
                      >
                        <FontAwesomeIcon
                          icon="download"
                          size="2x"
                          className="mr-3"
                        />
                        Export Profiles
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
                          profileConversionOptions
                            .filter(option => option !== fromBot)
                            .sort(),
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

ProfileTaskEditorConverter.propTypes = {
  toastManager: PropTypes.shape({
    add: PropTypes.func,
    remove: PropTypes.func,
    toasts: PropTypes.array
  }).isRequired
};

export default withToastManager(ProfileTaskEditorConverter);
