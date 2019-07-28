import React, { Component } from 'react';
import { Row, Col, Container, Label, Button, Input } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import PropTypes from 'prop-types';
import Table from '../Table/index';
import bodega from '../../images/bodega.jpg';
import extrabutter from '../../images/extrabutter.jpg';
import footpatrol from '../../images/footpatrol.png';
import nakedcph from '../../images/nakedcph.jpg';
import oneblockdown from '../../images/oneblockdown.jpeg';
import voostore from '../../images/voostore.png';
import { loadRaffleInfo } from './functions';
import { generateUEID } from '../../utils/utils';
import { convertCSVToBase } from '../ProfileTaskEditorConverter/functions';
import { convertBaseToNeutrino } from '../ProfileCreator/functions';
import FootpatrolUK from './Raffle/FootpatrolUK';
import NakedCPH from './Raffle/NakedCPH';
import ExtraButter from './Raffle/ExtraButter';
import END from './Raffle/END';
import VooStore from './Raffle/VooStore';
import Bodega from './Raffle/Bodega';
import OneBlockDown from './Raffle/OneBlockDown';

const { dialog } = require('electron').remote;
const fs = require('fs');
const csv = require('csvtojson');

const sites = [
  {
    name: 'Footpatrol UK',
    img: footpatrol
  },
  { name: 'NakedCPH', img: nakedcph },
  { name: 'ExtraButter', img: extrabutter },
  { name: 'VooStore', img: voostore },
  { name: 'Bodega', img: bodega },
  { name: 'OneBlockDown', img: oneblockdown }
];

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
    this.setState({ loadedRaffle: false });
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
    if (randomProxy === undefined) {
      return '';
    }
    if (randomProxy.length === 2) {
      return `http://${randomProxy.ip}:${randomProxy.port}`;
    }
    if (randomProxy.length === 4) {
      return `http://${randomProxy.user}:${randomProxy.pass}@${randomProxy.ip}:${randomProxy.port}`;
    }
  };

  loadRaffle = async () => {
    const { site, link } = this.state;
    const { setLoading } = this.props;
    try {
      setLoading(true, 'Loading Raffle Info', false);
      const raffleInfo = await loadRaffleInfo(site, link);
      this.setState({ loadedRaffle: true, ...raffleInfo });
    } catch (error) {
      console.log(error);
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
            console.log(jsonContent);
            this.setState({
              profiles: Object.values(jsonContent)
            });
          } catch (error) {
            console.log(error);
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
    const newEntries = [];
    this.setState({
      proxies: proxiesInput.split('\n')
    });
    profiles.forEach(profile => {
      let entry = false;
      const sizeObject = sizes.find(
        sizeOption => String(sizeOption.id) === size
      );
      const styleObject = styles.find(
        styleOption => String(styleOption.id) === style
      );
      switch (site) {
        case 'Footpatrol UK':
          entry = new FootpatrolUK(
            link,
            profile,
            site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            raffleDetails,
            this.triggerRender
          );
          break;
        case 'NakedCPH':
          entry = new NakedCPH(
            link,
            profile,
            site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            raffleDetails,
            this.triggerRender
          );
          break;
        case 'ExtraButter':
          entry = new ExtraButter(
            link,
            profile,
            site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            raffleDetails,
            this.triggerRender
          );
          break;
        case 'END':
          entry = new END(
            link,
            profile,
            site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            raffleDetails,
            this.triggerRender
          );
          break;
        case 'VooStore':
          entry = new VooStore(
            link,
            profile,
            site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            raffleDetails,
            this.triggerRender
          );
          break;
        case 'Bodega':
          entry = new Bodega(
            link,
            profile,
            site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            raffleDetails,
            this.triggerRender
          );
          break;
        case 'OneBlockDown':
          entry = new OneBlockDown(
            link,
            profile,
            site,
            styleObject,
            sizeObject,
            'Not Started',
            this.getRandomProxy(),
            raffleDetails,
            this.triggerRender
          );
          break;
        default:
          break;
      }
      if (entry) {
        newEntries.push(entry);
      }
    });
    this.setState({ entries: [...entries, ...newEntries] });
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
            <FontAwesome
              className="mx-3"
              name="play"
              onClick={() => {
                entries[row.row.index].run = true;
                entries[row.row.index].start();
              }}
            />
            <FontAwesome
              className="mx-3"
              name="stop"
              onClick={() => {
                entries[row.row.index].stop();
              }}
            />
            <FontAwesome
              className="mx-3"
              name="trash"
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
                  {...{
                    data: entries,
                    columns,
                    loading: false,
                    infinite: true,
                    manualSorting: false,
                    manualFilters: false,
                    manualPagination: false,
                    disableMultiSort: true,
                    disableGrouping: true,
                    debug: false
                  }}
                />
              </Col>
            </Row>
            {loadedRaffle ? (
              <Row>
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
                  <Label>Proxies</Label>
                  <Input
                    onChange={this.handleChange}
                    name="proxiesInput"
                    value={proxiesInput}
                    type="textarea"
                    rows="5"
                    placeholder="ip:port or ip:port:user:pass"
                  />
                </Col>
                <Col xs="2" className="align-self-center">
                  <Button className="my-3" onClick={this.loadEntries}>
                    Load
                  </Button>
                  <Button className="my-3">Stop</Button>
                </Col>
                <Col xs="2" className="align-self-center">
                  <Button className="my-3">Start</Button>
                  <Button color="danger" className="my-3">
                    Clear
                  </Button>
                </Col>
              </Row>
            ) : (
              <Row className="py-3 align-items-end noselect">
                <Col xs="6">
                  <Label>Select a site*</Label>
                  <Container>
                    <Row>
                      {sites.map(raffleSite => (
                        <Col
                          xs="2"
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
  setLoading: PropTypes.func.isRequired,
  raffleInfo: PropTypes.shape({
    store: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired
  }).isRequired,
  setRaffleInfo: PropTypes.func.isRequired
};
