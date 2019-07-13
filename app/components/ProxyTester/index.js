import React, { Component } from 'react';
import { Container, Row, Col, Input, Label, Button } from 'reactstrap';
import Table from '../Table';
// import ReactTable from 'react-table';
export default class ProxyTester extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proxies: [
        {
          ip: 'test',
          user: 'test',
          pass: 'test',
          ping: 100,
          port: 100
        },
        {
          ip: 'test2',
          user: 'test2',
          pass: 'test2',
          ping: 200,
          port: 100
        },
        {
          ip: 'test',
          user: 'test',
          pass: 'test',
          ping: 100,
          port: 100
        },
        {
          ip: 'test2',
          user: 'test2',
          pass: 'test2',
          ping: 200,
          port: 100
        },
        {
          ip: 'test',
          user: 'test',
          pass: 'test',
          ping: 100,
          port: 100
        },
        {
          ip: 'test2',
          user: 'test2',
          pass: 'test2',
          ping: 200,
          port: 100
        },
        {
          ip: 'test',
          user: 'test',
          pass: 'test',
          ping: 100,
          port: 100
        },
        {
          ip: 'test2',
          user: 'test2',
          pass: 'test2',
          ping: 200,
          port: 100
        },
        {
          ip: 'test',
          user: 'test',
          pass: 'test',
          ping: 100,
          port: 100
        },
        {
          ip: 'test2',
          user: 'test2',
          pass: 'test2',
          ping: 200,
          port: 100
        },
        {
          ip: 'test',
          user: 'test',
          pass: 'test',
          ping: 100,
          port: 100
        },
        {
          ip: 'test2',
          user: 'test2',
          pass: 'test2',
          ping: 200,
          port: 100
        },
        {
          ip: 'test',
          user: 'test',
          pass: 'test',
          ping: 100,
          port: 100
        },
        {
          ip: 'test2',
          user: 'test2',
          pass: 'test2',
          ping: 200,
          port: 100
        },
        {
          ip: 'test',
          user: 'test',
          pass: 'test',
          ping: 100,
          port: 100
        },
        {
          ip: 'test2',
          user: 'test2',
          pass: 'test2',
          ping: 200,
          port: 100
        }
      ],
      order: 'asc',
      orderBy: '#'
    };
  }

  handleSort = (event, property) => {
    const { orderBy, order } = this.state;
    const isDesc = orderBy === property && order === 'desc';
    this.setState({
      order: isDesc ? 'asc' : 'desc',
      orderBy: property
    });
  };

  render() {
    // const columns = [
    //   {
    //     text: '#',
    //     dataField: '',
    //     formatter: (cell, row, rowIndex, formatExtraData) => {
    //       return rowIndex + 1;
    //     }
    //   },
    //   {
    //     text: 'IP',
    //     dataField: 'ip',
    //     sort: true
    //   },
    //   {
    //     text: 'Port',
    //     dataField: 'port',
    //     sort: true
    //   },
    //   {
    //     text: 'User',
    //     dataField: 'user',
    //     sort: true
    //   },
    //   {
    //     text: 'Pass',
    //     dataField: 'pass',
    //     sort: true
    //   },
    //   {
    //     text: 'Ping(ms)',
    //     dataField: 'ping',
    //     sort: true
    //   }
    // ];

    const columns = [
      {
        Header: '#',
        Cell: row => <div>{row.row.index + 1}</div>,
        width: 20
      },
      {
        Header: 'IP',
        accessor: 'ip'
      },
      {
        Header: 'Port',
        accessor: 'port'
      },
      {
        Header: 'User',
        accessor: 'user'
      },
      {
        Header: 'Pass',
        accessor: 'pass'
      },
      {
        Header: 'Ping(ms)',
        accessor: 'ping'
      }
    ];

    const { proxies } = this.state;
    return (
      <Row className="h-100">
        <Col className="h-100">
          <Container fluid className="p-0 h-100 d-flex flex-column">
            <Row className="flex-1 overflow-hidden panel-middle">
              <Col id="TableContainer" className="h-100">
                <Table
                  {...{
                    data: proxies,
                    columns,
                    loading: false,
                    infinite: true,
                    manualSorting: false, // Manual sorting
                    manualFilters: false, // Manual filters
                    manualPagination: false, // Manual pagination
                    disableMultiSort: true, // Disable multi-sort
                    disableGrouping: true, // Disable grouping
                    debug: false
                  }}
                />
                {/* <BootstrapTable
                  bootstrap4={true}
                  bordered={false}
                  keyField="ip"
                  data={this.state.proxies}
                  columns={columns}
                /> */}
              </Col>
            </Row>
            <Row>
              <Col>
                <Container fluid>
                  <Row>
                    <Col xs="6" className="py-3">
                      <Label>Proxies*</Label>
                      <Input
                        rows="4"
                        type="textarea"
                        placeholder="ip:port or ip:port:user:pass"
                      />
                    </Col>
                    <Col xs="3" className="py-3">
                      <Label>Website*</Label>
                      <Input type="text" />
                      <Button className="my-2">Test Proxies</Button>
                      <Button className="my-2">Copy Proxies</Button>
                    </Col>
                    <Col xs="3" className="py-3">
                      <Label>Max Ping</Label>
                      <Input type="text" />
                      <Button color="danger" className="my-2">
                        Clear Proxies
                      </Button>
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
