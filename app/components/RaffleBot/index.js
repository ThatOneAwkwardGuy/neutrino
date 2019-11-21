import React, { Component } from 'react';
import { Row, Col, Container, Label, Button, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { sleep, loadRaffleInfo } from './functions';
import { generateUEID } from '../../utils/utils';
import { convertCSVToBase } from '../ProfileTaskEditorConverter/functions';
import { convertBaseToNeutrino } from '../ProfileCreator/functions';

import Table from '../Table/index';
import bodega from '../../images/bodega.jpg';
import extrabutter from '../../images/extrabutter.jpg';
// import footpatrol from '../../images/footpatrol.png';
import nakedcph from '../../images/nakedcph.jpg';
import renarts from '../../images/renarts.jpg';
import dsm from '../../images/dsm.png';
import dsmny from '../../images/dsmny.png';
import cityblue from '../../images/cityblue.jpg';
import lapstoneandhammer from '../../images/lapstoneandhammer.jpg';
import stress95 from '../../images/stress95.png';
import fearofgod from '../../images/fearofgod.png';
import footdistrict from '../../images/footdistrict.png';
// import footshop from '../../images/footshop.png';
// import woodwood from '../../images/woodwood.jpg';
// import oneblockdown from '../../images/oneblockdown.jpeg';
import voostore from '../../images/voostore.png';
// import supplystore from '../../images/supplystore.png';
// import kickz from '../../images/kickz.png';
// import bstn from '../../images/bstn.png';

// import Footpatrol from './Raffle/Footpatrol';
import NakedCPH from './Raffle/NakedCPH';
import ExtraButter from './Raffle/ExtraButter';
import Bodega from './Raffle/Bodega';
import CityBlue from './Raffle/CityBlue';
import LapstoneAndHammer from './Raffle/LapstoneAndHammer';
import Renarts from './Raffle/Renarts';
import DSM from './Raffle/DSM';
import DSMNY from './Raffle/DSMNY';
import Stress95 from './Raffle/Stress95';
import FearOfGod from './Raffle/FearOfGod';
import FootDistrict from './Raffle/FootDistrict';
// import END from './Raffle/END';
import VooStore from './Raffle/VooStore';
// import FootShop from './Raffle/FootShop';
// import SupplyStore from './Raffle/SupplyStore';
// import OneBlockDown from './Raffle/OneBlockDown';
// import BSTN from './Raffle/BSTN';

const { dialog } = require('electron').remote;
const fs = require('fs');
const csv = require('csvtojson');
const chunk = require('lodash/chunk');

const sites = [
  // {
  //   name: 'Footpatrol',
  //   img: footpatrol
  // },
  { name: 'NakedCPH', img: nakedcph },
  { name: 'ExtraButter', img: extrabutter },
  { name: 'Bodega', img: bodega },
  { name: 'CityBlue', img: cityblue },
  { name: 'Lapstone And Hammer', img: lapstoneandhammer },
  { name: 'Renarts', img: renarts },
  { name: 'DSM', img: dsm },
  { name: 'DSMNY', img: dsmny },
  { name: 'Stress95', img: stress95 },
  { name: 'Fear Of God', img: fearofgod },
  { name: 'FootDistrict', img: footdistrict },
  // { name: 'BSTN', img: bstn }
  // { name: 'Kickz', img: kickz }
  // { name: 'WoodWood', img: woodwood }
  // { name: 'FootShop', img: footshop }
  // { name: 'SupplyStore', img: supplystore }
  // { name: 'OneBlockDown', img: oneblockdown }
  { name: 'VooStore', img: voostore }
];

const Classes = {
  NakedCPH,
  ExtraButter,
  Bodega,
  CityBlue,
  'Lapstone And Hammer': LapstoneAndHammer,
  Renarts,
  DSM,
  DSMNY,
  Stress95,
  'Fear Of God': FearOfGod,
  FootDistrict,
  VooStore
};

export default class RaffleBot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      site: '',
      link: '',
      loadedRaffle: false,
      proxiesInput: '',
      style: '',
      size: '',
      sizes: [],
      styles: [],
      profiles: [],
      styleInput: true,
      sizeInput: true,
      entries: [],
      proxies: [],
      raffleDetails: {}
    };
  }

  componentDidMount() {
    const { raffleInfo, setRaffleInfo } = this.props;
    if (raffleInfo !== null) {
      this.setState({ site: raffleInfo.store, link: raffleInfo.link }, () => {
        this.loadRaffle();
      });
    }
    setRaffleInfo(null);
  }

  handleRaffleSiteChange = site => {
    this.setState({
      site
    });
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  goBack = () => {
    this.setState({
      site: '',
      link: '',
      loadedRaffle: false,
      proxiesInput: '',
      style: '',
      size: '',
      sizes: [],
      styles: [],
      profiles: [],
      styleInput: true,
      sizeInput: true,
      entries: [],
      raffleDetails: {}
    });
  };

  returnOptions = (name, array) => {
    const options = array.map(elem => (
      <option value={elem.id} key={generateUEID()}>
        {elem.name}
      </option>
    ));
    options.unshift(
      <option value="" key={generateUEID()}>
        Select
      </option>
    );
    return options;
  };

  getRandomProxy = () => {
    const { proxies } = this.state;
    const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
    const splitRandomProxy =
      randomProxy !== undefined ? randomProxy.split(':') : undefined;
    if (splitRandomProxy.length === 2) {
      return `http://${splitRandomProxy[0]}:${splitRandomProxy[1]}`;
    }
    if (splitRandomProxy.length === 4) {
      return `http://${splitRandomProxy[2]}:${splitRandomProxy[3]}@${
        splitRandomProxy[0]
      }:${splitRandomProxy[1]}`;
    }
    return '';
  };

  loadRaffle = async () => {
    const { site, link } = this.state;
    const { setLoading, setInfoModal } = this.props;
    try {
      setLoading(true, 'Loading Raffle Info', false);
      const raffleInfo = await loadRaffleInfo(site, link);

      if (raffleInfo) {
        this.setState({ loadedRaffle: true, ...raffleInfo });
      }
    } catch (error) {
      setInfoModal({
        infoModalShowing: true,
        infoModalHeader: `Errors`,
        infoModalBody: <div>{JSON.stringify(error.message)}</div>,
        infoModalFunction: '',
        infoModalButtonText: ''
      });
      console.error(error);
    } finally {
      setLoading(false, 'Loading Raffle Info', false);
    }
  };

  importProfiles = () => {
    dialog.showOpenDialog(
      {
        filters: [{ name: 'Neutrino Profiles', extensions: ['json', 'csv'] }]
      },
      async fileNames => {
        if (fileNames !== undefined) {
          try {
            const extension = fileNames[0]
              .split('.')
              .slice(-1)[0]
              .toLowerCase();
            let jsonContent;
            if (extension === 'csv') {
              const convertedCSV = await csv().fromFile(fileNames[0]);
              jsonContent = convertedCSV.map((profile, index) => {
                const baseProfile = convertCSVToBase(profile);
                return convertBaseToNeutrino(
                  index,
                  baseProfile,
                  baseProfile.card,
                  '',
                  ''
                );
              });
            } else {
              const contents = fs.readFileSync(fileNames[0]);
              jsonContent = JSON.parse(contents);
            }

            this.setState({
              profiles: Object.values(jsonContent)
            });
          } catch (error) {
            console.error(error);
          }
        }
      }
    );
  };

  loadEntries = () => {
    const {
      profiles,
      site,
      link,
      size,
      style,
      sizes,
      styles,
      raffleDetails,
      entries,
      proxiesInput
    } = this.state;
    const { incrementRaffles, settings } = this.props;
    const newEntries = [];
    this.setState(
      {
        proxies: proxiesInput.split('\n')
      },
      () => {
        profiles.forEach(profile => {
          let entry = false;
          const sizeObject = sizes.find(
            sizeOption => String(sizeOption.id) === size
          );
          const styleObject = styles.find(
            styleOption => String(styleOption.id) === style
          );
          entry = new Classes[site](
            link,
            profile,
            site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            raffleDetails,
            this.triggerRender,
            incrementRaffles,
            settings
          );
          if (entry) {
            newEntries.push(entry);
          }
        });
        this.setState({ entries: [...entries, ...newEntries] });
      }
    );
  };

  triggerRender = () => {
    this.forceUpdate();
  };

  deleteEntry = row => {
    const { entries } = this.state;
    const newEntries = entries.filter(
      (entry, index) => index !== row.row.index
    );
    this.setState({ entries: newEntries });
  };

  startAll = async () => {
    const { entries } = this.state;
    const { settings } = this.props;
    const chunkedEntries = chunk(
      entries,
      parseInt(settings.parallelRaffleEntries, 10)
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const chunkedEntryGroup of chunkedEntries) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        chunkedEntryGroup.map(entry => {
          // eslint-disable-next-line no-param-reassign
          entry.run = true;
          return entry.start();
        })
      );
      // eslint-disable-next-line no-await-in-loop
      await sleep(parseInt(settings.raffleEntryDelay, 10));
    }
  };

  stopAll = () => {
    const { entries } = this.state;
    entries.forEach(entry => entry.stop());
  };

  clearAll = () => {
    this.setState({
      entries: []
    });
  };

  render() {
    const {
      site,
      link,
      loadedRaffle,
      styles,
      sizes,
      style,
      size,
      proxiesInput,
      styleInput,
      sizeInput,
      entries
    } = this.state;
    const columns = [
      {
        Header: '#',
        Cell: row => <div>{row.row.index + 1}</div>,
        width: 20
      },
      {
        Header: 'Email',
        accessor: 'profile.email'
      },
      {
        Header: 'Site',
        accessor: 'site'
      },
      {
        Header: 'Style',
        accessor: 'style.name'
      },
      {
        Header: 'Size',
        accessor: 'size.name'
      },
      {
        Header: 'Status',
        accessor: 'status'
      },
      {
        Header: 'Actions',
        Cell: row => (
          <div>
            <FontAwesomeIcon
              className="mx-3"
              icon="play"
              onClick={() => {
                entries[row.row.index].run = true;
                entries[row.row.index].start();
              }}
            />
            <FontAwesomeIcon
              className="mx-3"
              icon="stop"
              onClick={() => {
                entries[row.row.index].stop();
              }}
            />
            <FontAwesomeIcon
              className="mx-3"
              icon="trash"
              onClick={() => {
                this.deleteEntry(row);
              }}
            />
          </div>
        )
      }
    ];
    return (
      <Row className="h-100 p-0">
        <Col className="h-100" xs="12">
          <Container fluid className="p-0 h-100 d-flex flex-column">
            <Row className="flex-1 overflow-hidden panel-middle">
              <Col id="TableContainer" className="h-100">
                <Table
                  data={entries}
                  columns={columns}
                  // {...{

                  //   loading: false,
                  //   infinite: true,
                  //   manualSorting: false,
                  //   manualFilters: false,
                  //   manualPagination: false,
                  //   disableMultiSort: true,
                  //   disableGrouping: true,
                  //   debug: false
                  // }}
                />
              </Col>
            </Row>
            {loadedRaffle ? (
              <Row className="py-3">
                <Col xs="4">
                  <Container>
                    <Row className="py-3">
                      {styleInput ? (
                        <Col>
                          <Label>Style</Label>
                          <Input
                            onChange={this.handleChange}
                            type="select"
                            name="style"
                            value={style}
                          >
                            {this.returnOptions('style', styles)}
                          </Input>
                        </Col>
                      ) : null}
                      {sizeInput ? (
                        <Col>
                          <Label>Size</Label>
                          <Input
                            onChange={this.handleChange}
                            type="select"
                            name="size"
                            value={size}
                          >
                            {this.returnOptions('size', sizes)}
                          </Input>
                        </Col>
                      ) : null}
                    </Row>
                    <Row className="py-3">
                      <Col>
                        <Button onClick={this.importProfiles}>
                          Load Profiles
                        </Button>
                      </Col>
                      <Col>
                        <Button onClick={this.goBack}>Back</Button>
                      </Col>
                    </Row>
                  </Container>
                </Col>
                <Col xs="4">
                  <Container>
                    <Row className="py-3">
                      <Label>Proxies</Label>
                      <Input
                        onChange={this.handleChange}
                        name="proxiesInput"
                        value={proxiesInput}
                        type="textarea"
                        rows="5"
                        placeholder="ip:port or ip:port:user:pass"
                      />
                    </Row>
                  </Container>
                </Col>
                <Col xs="2" className="align-self-center">
                  <Button className="my-3" onClick={this.loadEntries}>
                    Load
                  </Button>
                  <Button className="my-3" onClick={this.stopAll}>
                    Stop
                  </Button>
                </Col>
                <Col xs="2" className="align-self-center">
                  <Button className="my-3" onClick={this.startAll}>
                    Start
                  </Button>
                  <Button
                    color="danger"
                    className="my-3"
                    onClick={this.clearAll}
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
            ) : (
              <Row className="py-3 align-items-end noselect">
                <Col xs="6">
                  <Label>Select a site*</Label>
                  <Container>
                    <Row
                      className="display-scrollbar"
                      style={{ maxHeight: '150px', overflowY: 'scroll' }}
                    >
                      {sites.map(raffleSite => (
                        <Col
                          xs="2"
                          className="my-2 text-center"
                          onClick={() => {
                            this.handleRaffleSiteChange(raffleSite.name);
                          }}
                        >
                          <img
                            alt={raffleSite.name}
                            name="raffleSite"
                            value={raffleSite.name}
                            className={`w-100 ${
                              site === raffleSite.name ? 'highlightedImage' : ''
                            }`}
                            src={raffleSite.img}
                          />
                          <p style={{ fontSize: '10px' }}>{raffleSite.name}</p>
                        </Col>
                      ))}
                    </Row>
                  </Container>
                </Col>
                <Col xs="4">
                  <Label>Raffle Link*</Label>
                  <Input
                    name="link"
                    type="text"
                    value={link}
                    onChange={this.handleChange}
                  />
                </Col>
                <Col xs="2">
                  <Button onClick={this.loadRaffle}>Load</Button>
                </Col>
              </Row>
            )}
          </Container>
        </Col>
      </Row>
    );
  }
}

RaffleBot.propTypes = {
  settings: PropTypes.objectOf(PropTypes.any).isRequired,
  setLoading: PropTypes.func.isRequired,
  setInfoModal: PropTypes.func.isRequired,
  raffleInfo: PropTypes.shape({
    store: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired
  }).isRequired,
  setRaffleInfo: PropTypes.func.isRequired,
  incrementRaffles: PropTypes.func.isRequired
};
