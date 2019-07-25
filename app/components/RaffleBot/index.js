import React, { Component } from 'react';
import { Row, Col, Container, Label, Button, Input } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Table from '../Table/index';
import bodega from '../../images/bodega.jpg';
import extrabutter from '../../images/extrabutter.jpg';
import footpatrol from '../../images/footpatrol.png';
import nakedcph from '../../images/nakedcph.jpg';
import oneblockdown from '../../images/oneblockdown.jpeg';
import voostore from '../../images/voostore.png';
import { loadRaffleInfo } from './functions';

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
      link: ''
      // proxiesInput: '',
      // style: '',
      // size: '',
      // loadedRaffle: false
      // sizes: [],
      // styles: [],
      // entries: [],
      // proxies: [],
      // profiles: [],
      // raffleDetails: {}
      // styleInput: true,
      // sizeInput: true
    };
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

  loadRaffle = async () => {
    const { site, link } = this.state;
    try {
      await loadRaffleInfo(site, link);
      // this.setState({ loadedRaffle: true });
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { site, link } = this.state;
    const columns = [
      {
        Header: '#',
        Cell: row => <div>{row.row.index + 1}</div>,
        width: 20
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Proxy',
        accessor: 'proxy'
      },
      {
        Header: 'Status',
        accessor: 'status'
      },
      {
        Header: 'Actions',
        Cell: () => (
          <div>
            <FontAwesome className="mx-3" name="play" />
            <FontAwesome className="mx-3" name="stop" />
            <FontAwesome className="mx-3" name="trash" />
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
                    data: [],
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
          </Container>
        </Col>
      </Row>
    );
  }
}
