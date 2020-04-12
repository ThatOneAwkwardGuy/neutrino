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
import nakedcph from '../../images/nakedcph.jpg';
import renarts from '../../images/renarts.jpg';
import dsm from '../../images/dsm.png';
import dsmny from '../../images/dsmny.png';
import dsmla from '../../images/dsmla.jpg';
import cityblue from '../../images/cityblue.jpg';
import lapstoneandhammer from '../../images/lapstoneandhammer.jpg';
import stress95 from '../../images/stress95.png';
import fearofgod from '../../images/fearofgod.png';
import footdistrict from '../../images/footdistrict.png';
import voostore from '../../images/voostore.png';
import empireShop from '../../images/empireShop.png';
import end from '../../images/end.jpg';
import hollywood from '../../images/hollywood.png';
import rooted from '../../images/rooted.png';
import eighteenmontrose from '../../images/18montrose.jpg';
import afewstore from '../../images/afewstore.jpg';
import crusoeandsons from '../../images/crusoeandsons.png';
import yme from '../../images/yme.png';
// import tresbien from '../../images/tresbien.png';
// import footpatrol from '../../images/footpatrol.png';
// import footshop from '../../images/footshop.png';
// import woodwood from '../../images/woodwood.jpg';
// import oneblockdown from '../../images/oneblockdown.jpeg';
// import supplystore from '../../images/supplystore.png';
// import kickz from '../../images/kickz.png';
// import bstn from '../../images/bstn.png';

import NakedCPH from './Raffle/NakedCPH';
import ExtraButter from './Raffle/ExtraButter';
import Bodega from './Raffle/Bodega';
import CityBlue from './Raffle/CityBlue';
import LapstoneAndHammer from './Raffle/LapstoneAndHammer';
import Renarts from './Raffle/Renarts';
import DSM from './Raffle/DSM';
import DSMNY from './Raffle/DSMNY';
import DSMLA from './Raffle/DSMLA';
import Stress95 from './Raffle/Stress95';
import FearOfGod from './Raffle/FearOfGod';
import FootDistrict from './Raffle/FootDistrict';
import END from './Raffle/END';
import VooStore from './Raffle/VooStore';
import EmpireShop from './Raffle/EmpireShop';
import HollyWood from './Raffle/HollyWood';
import Rooted from './Raffle/Rooted';
import EighteenMontrose from './Raffle/18Montrose';
import AFewStore from './Raffle/AFewStore';
import CrusoeAndSons from './Raffle/CrusoeAndSons';
import YME from './Raffle/YME';
// import TresBien from './Raffle/TresBien';
// import Footpatrol from './Raffle/Footpatrol';
// import FootShop from './Raffle/FootShop';
// import SupplyStore from './Raffle/SupplyStore';
// import OneBlockDown from './Raffle/OneBlockDown';
// import BSTN from './Raffle/BSTN';

const { dialog } = require('electron').remote;
const fs = require('fs');
const csv = require('csvtojson');
const chunk = require('lodash/chunk');
const fsPromises = require('fs').promises;

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
  { name: 'DSMLA', img: dsmla },
  { name: 'Stress95', img: stress95 },
  { name: 'Fear Of God', img: fearofgod },
  { name: 'FootDistrict', img: footdistrict },
  { name: 'END', img: end },
  { name: 'VooStore', img: voostore },
  { name: 'EmpireShop', img: empireShop },
  { name: 'HollyWood', img: hollywood },
  { name: 'Rooted', img: rooted },
  { name: '18Montrose', img: eighteenmontrose, value: 'EighteenMontrose' },
  { name: 'AFewStore', img: afewstore },
  { name: 'CrusoeAndSons', img: crusoeandsons },
  { name: 'YME', img: yme }
  // { name: 'TresBien', img: tresbien }
  // { name: 'BSTN', img: bstn }
  // { name: 'Kickz', img: kickz }
  // { name: 'WoodWood', img: woodwood }
  // { name: 'FootShop', img: footshop }
  // { name: 'SupplyStore', img: supplystore }
  // { name: 'OneBlockDown', img: oneblockdown }
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
  VooStore,
  EmpireShop,
  DSMLA,
  END,
  HollyWood,
  Rooted,
  EighteenMontrose,
  AFewStore,
  CrusoeAndSons,
  YME
};

export default class RaffleBot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      site: '',
      link: '',
      loadedRaffle: false,
      instagramAccounts: [],
      proxiesInput: '',
      style: '',
      captcha: '',
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

  importProfiles = async () => {
    const filePaths = await dialog.showOpenDialog({
      filters: [{ name: 'Neutrino Profiles', extensions: ['json', 'csv'] }]
    });
    if (!filePaths.canceled) {
      const filePath = filePaths.filePaths[0];
      try {
        const extension = filePath
          .split('.')
          .slice(-1)[0]
          .toLowerCase();
        let jsonContent;
        if (extension === 'csv') {
          const convertedCSV = await csv().fromFile(filePath);
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
          console.log(filePath);
          const contents = fs.readFileSync(filePath);
          jsonContent = JSON.parse(contents);
        }
        this.setState({
          profiles: Object.values(jsonContent)
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  importInstagramAccounts = async () => {
    const filePaths = await dialog.showOpenDialog({
      filters: [{ name: 'Instagram Account List', extensions: ['txt'] }]
    });
    if (!filePaths.canceled) {
      const filePath = filePaths.filePaths[0];
      try {
        const file = await fsPromises.readFile(filePath, { encoding: 'utf-8' });
        const instagramAccounts = file.split('\n');
        this.setState({ instagramAccounts });
      } catch (error) {
        console.error(error);
      }
    }
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
      captcha,
      entries,
      proxiesInput,
      instagramAccounts
    } = this.state;
    const { incrementRaffles, settings } = this.props;
    const newEntries = [];
    this.setState(
      {
        proxies: proxiesInput.split('\n')
      },
      () => {
        profiles.forEach((profile, index) => {
          let entry = false;
          const sizeObject = sizes.find(
            sizeOption => String(sizeOption.id) === size
          );
          const styleObject = styles.find(
            styleOption => String(styleOption.id) === style
          );
          if (['EmpireShop'].includes(site)) {
            raffleDetails.captcha = captcha;
          }
          // eslint-disable-next-line no-param-reassign
          profile.instagram =
            // eslint-disable-next-line no-nested-ternary
            instagramAccounts.length > 0 &&
            instagramAccounts[index] !== undefined
              ? // eslint-disable-next-line no-param-reassign
                (profile.instagram = instagramAccounts[index])
              : profile.instagram === undefined
              ? ''
              : profile.instagram;
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
    for (const [index, chunkedEntryGroup] of chunkedEntries.entries()) {
      if (index !== 0) {
        chunkedEntryGroup.forEach(entry => {
          entry.changeStatus(
            `Waiting ${settings.raffleEntryDelay / 1000}s Before Raffle Entry`
          );
        });
        // eslint-disable-next-line no-await-in-loop
        await sleep(parseInt(settings.raffleEntryDelay, 10));
      }
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        chunkedEntryGroup.map(entry => {
          // eslint-disable-next-line no-param-reassign
          entry.run = true;
          return entry.start();
        })
      );
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
      captcha,
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
                <Table data={entries} columns={columns} />
              </Col>
            </Row>
            {loadedRaffle ? (
              <Row className="py-3">
                <Col xs="4">
                  <Container>
                    {['EmpireShop'].includes(site) ? (
                      <Row className="py-3">
                        <Col>
                          <Label>Captcha</Label>
                          <Input
                            onChange={this.handleChange}
                            type="text"
                            name="captcha"
                            value={captcha}
                          />
                        </Col>
                      </Row>
                    ) : null}
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
                        <Button onClick={this.importInstagramAccounts}>
                          Load Instagram
                        </Button>
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
                <Col xs="4" className="align-self-center">
                  <Row>
                    <Col>
                      <Button className="my-3" onClick={this.loadEntries}>
                        Load
                      </Button>
                    </Col>
                    <Col>
                      <Button className="my-3" onClick={this.startAll}>
                        Start
                      </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Button className="my-3" onClick={this.stopAll}>
                        Stop
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        color="danger"
                        className="my-3"
                        onClick={this.clearAll}
                      >
                        Clear
                      </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs="6">
                      <Button
                        color="danger"
                        className="my-3"
                        onClick={this.goBack}
                      >
                        Back
                      </Button>
                    </Col>
                  </Row>
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
                            this.handleRaffleSiteChange(
                              raffleSite.value !== undefined
                                ? raffleSite.value
                                : raffleSite.name
                            );
                          }}
                        >
                          <img
                            alt={raffleSite.name}
                            name="raffleSite"
                            value={raffleSite.name}
                            className={`w-100 ${
                              site === raffleSite.name ||
                              site === raffleSite.value
                                ? 'highlightedImage'
                                : ''
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

RaffleBot.defaultProps = {
  raffleInfo: {}
};

RaffleBot.propTypes = {
  settings: PropTypes.objectOf(PropTypes.any).isRequired,
  setLoading: PropTypes.func.isRequired,
  setInfoModal: PropTypes.func.isRequired,
  raffleInfo: PropTypes.shape({
    store: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired
  }),
  setRaffleInfo: PropTypes.func.isRequired,
  incrementRaffles: PropTypes.func.isRequired
};
