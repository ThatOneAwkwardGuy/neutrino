import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Table, Progress } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import FontAwesome from 'react-fontawesome';
const remote = require('electron').remote;
const windowManager = remote.require('electron-window-manager');
const path = require('path');
import url from 'url';
const rp = require('request-promise');

export default class ActivityGenerator extends Component {
  constructor(props) {
    super(props);
    this.cookieJar = '';
    this.state = {
      status: 'Not Started',
      activityEmail: '',
      activityPassword: '',
      activityProxy: '',
      youtube: 0,
      searches: 0,
      shopping: 0,
      news: 0
    };
  }

  returnActivitiesRow = (activity, index) => {
    const total = activity.youtube + activity.searches + activity.shopping + activity.news;
    return (
      <tr key={`Activity-${index}`} className="activityRow d-flex align-items-center">
        <td className="col-1">{index + 1}</td>
        <td className="col">{activity.status}</td>
        <td className="col">{activity.activityEmail}</td>
        <td className="col">
          <Progress value={activity.youtube} max={total} />
        </td>
        <td className="col">
          <Progress value={activity.searches} max={total} />
        </td>
        <td className="col">
          <Progress value={activity.shopping} max={total} />
        </td>
        <td className="col">
          <Progress value={activity.news} max={total} />
        </td>
        <td className="col">
          <FontAwesome
            onClick={() => {
              this.startWindow(activity, index);
            }}
            name="play"
            style={{ padding: '10px' }}
            className="taskButton btn"
          />
          <FontAwesome
            onClick={() => {
              this.stopWindow(index);
            }}
            name="stop"
            style={{ padding: '10px' }}
            className="taskButton btn"
          />
          <FontAwesome
            name="trash"
            style={{ padding: '10px' }}
            className="taskButton btn"
            onClick={() => {
              this.deleteWindow(index, activity);
            }}
          />
        </td>
      </tr>
    );
  };

  startWindow = async (activity, index) => {
    const activityLocation = url.format({
      pathname:
        process.env.NODE_ENV === 'development'
          ? path.resolve(__dirname, '..', '..', 'webpack-pack', 'index.html')
          : path.resolve(__dirname, 'webpack-pack', 'index.html'),
      protocol: 'file:',
      slashes: true,
      hash: 'activity'
    });
    this.props.activities[index].status = 'Logging In';
    this.props.onUpdateActivity(index, this.props.activities[index]);
    if (this.cookieJar === '') {
      this.cookieJar = rp.jar();
      await this.loginToGoogle(activity.activityEmail, activity.activityPassword, this.cookieJar);
    }
    this.props.activities[index].status = 'Logged In';
    this.props.onUpdateActivity(index, this.props.activities[index]);
    this.props.setActivityWindow(
      index,
      windowManager.createNew(
        `window-${index}`,
        `window-${index}`,
        activityLocation,
        false,
        {
          // width: 500,
          // height: 650,
          // show: this.props.settings.showAcitivtyWindows ? true : false,
          width: this.props.settings.showAcitivtyWindows ? 500 : 0,
          height: this.props.settings.showAcitivtyWindows ? 650 : 0,
          show: true,
          frame: false,
          resizable: true,
          focusable: true,
          minimizable: true,
          closable: true,
          // ...(!this.props.settings.showAcitivtyWindows && { show: false }),
          allowRunningInsecureContent: true,
          webPreferences: {
            contextIsolation: false,
            allowRunningInsecureContent: true,
            nodeIntegration: true,
            webSecurity: false,
            preload: path.resolve(__dirname, '..', 'utils', 'activityPreload.js')
          }
        },
        false
      )
    );
    windowManager.sharedData.set(`window-${index}`, {
      activityDelayMin: this.props.settings.activityDelayMin,
      activityDelayMax: this.props.settings.activityDelayMax,
      data: this.props.activities[index],
      update: this.props.onUpdateActivity,
      url: 'google.com',
      cookies: this.cookieJar._jar.store.idx
    });
    console.log(this.props.activityWindows);
    this.props.activityWindows[index].create();
    if (this.props.settings.showAcitivtyWindows) {
      console.log('Opening');
      // windowManager.get(`window-${index}`).setURL(activityLocation);
      windowManager.get(`window-${index}`).object.show();
    }
  };

  stopWindow = index => {
    this.props.activities[index].status = 'Not Started';
    this.props.onUpdateActivity(index, this.props.activities[index]);
    if (this.props.activityWindows[index]) {
      this.props.activityWindows[index].close();
    }
  };

  deleteWindow = (index, activity) => {
    this.props.onRemoveActivity(activity);
    this.props.activityWindows[index].close();
  };

  addActivity = () => {
    this.props.onCreateActivity({
      activityEmail: this.state.activityEmail,
      activityPassword: this.state.activityPassword,
      activityProxy: this.state.activityProxy,
      email: this.state.email,
      youtube: this.state.youtube,
      searches: this.state.searches,
      shopping: this.state.shopping,
      news: this.state.news,
      status: this.state.status
    });
    this.setState({
      status: 'Not Started',
      activityEmail: '',
      activityPassword: '',
      activityProxy: '',
      youtube: 0,
      searches: 0,
      shopping: 0,
      news: 0,
      total: 0
    });
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  loginToGoogle = async (email, password, cookieJar) => {
    try {
      const response1 = await rp({
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Content-Type': 'application/x-www-form-urlencoded',
          Te: 'Trailers',
          'Upgrade-Insecure-Requests': '1'
        },
        method: 'POST',
        jar: cookieJar,
        form: {
          identifier: email,
          password: password,
          ca: '',
          ct: ''
        },
        uri: 'https://accounts.google.com/signin/v2/challenge/password/empty',
        followRedirect: true,
        resolveWithFullResponse: true
      });
      console.log(response1);

      const response2 = await rp({
        method: 'POST',
        jar: cookieJar,
        uri: 'https://accounts.google.com/_/signin/sl/challenge?hl=en&_reqid=759031&rt=j',
        resolveWithFullResponse: true,
        body:
          'hl=en&continue=https%3A%2F%2Faccounts.google.com%2FManageAccount&f.req=%5B%22AEThLlyK91TD-rkBVKF4sH88l4Z-VO53n2pey9LG4FeYpMecpUzI0xQdv2JtKahyXdt9sG37NoUOoHC9-fwsnI1RA5JeTzeBebHy29pkmCoai3cczysvtyLs7a0yyjQwBTd72QUWm7h88VnTITr0gbD2t0qiqmUh7CeheOQVLnW7NANZyHZ4f7RMRFpYgbADeJtbT26f5CDoUmTRvpSBXAMuRIkbaPId8zcuns94R4orvUowGiv83FK3C7NVbi0o-gu4Q1e6LqJqSPdEYL5c1dUZNhuuDmmIGR_dgzWwsKiEAqrVi23-Udafv3Rit-p08VDEwy7TIf_OK0Tyb_1_KGxQYQq0ca1Pbhgv8I5oj9svxZxr1eF_6Wq5K6_Ke8rrw1NQDSOREGX9iY4k7KKs8MXq1aZwtTpAA5sMcdaQj-IziLEGp1dvVuzBEUfNLVs1QMQxYe138Q9P6dPON6xI30YF2KrG332dkhl_VbsJlPb3ca9MoJ0FTeZpYxlyQcbRKKobnOmbiSozWT4s4i9IUfd9jKn11oa6QJIKIbw_YipHC-9CJTuu60Uo37YkmjaJIWjzPhgKvJjghWs01tzrtuSfz0hbzO0Tggw-k0KMyn8PYs2wExfK-cUAI0B7tOSmSue3jF04y3VhNMCTG4fqux_XcKmZbGHydSZl46yVAovPcG5FEE9DnYk54xgUrxTSXW6jgy4IcQL2NnNx8M-Kjns-zvfAF2bB-kG1aKZwqkLH15v6TTuTji7qU2no1WRZlalhPSTX-aOoWt72PfDGvck7XomqNkkBIAQ24AL0Ypoe4pJuyMZLempLgu9-Xv3UTMrIpGEp11EfV3LE2HqS3tP_KhNNICWXMC6fjVtvRFhwswyqgwLtpEISPIYiGFrEyDvv6VKtgJ8JrUts1V0-xL3V82YEqpCaL1MU7t4Aqgz2qYWMl-gNqDKjcKSO5Xd_VHMCVmiA7fmdQ5nMXGgO9vdcL4YSmgqcWXjc04tNPaf-k5mmD9ykEmdr4DqDwS2MKKkMybMGwT-U3HBBaIethpp7wxwix09z4QPG2pkvof4vH31ldXQonV4%22%2Cnull%2C1%2Cnull%2C%5B1%2Cnull%2Cnull%2Cnull%2C%5B%22Sekinat123%22%2Cnull%2Ctrue%5D%5D%2C%5Bnull%2Cnull%2C%5B2%2C1%2Cnull%2C1%2C%22https%3A%2F%2Faccounts.google.com%2FServiceLogin%3Fhl%3Den%22%2Cnull%2C%5B%5D%2C4%2C%5B%5D%2C%22GlifWebSignIn%22%5D%2C1%2C%5Bnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2C%5B%5D%5D%2Cnull%2Cnull%2Cnull%2Ctrue%5D%5D&bgRequest=%5B%22identifier%22%2C%22!j4yljK1CMPKYchcs8K9Eg0qnjuQqLG4CAAAAxlIAAAAHmQFgEEgI-v5dh3ZE2KHow7386WNYjo09e193vxbzAP21ArJotoVEanUg-G4zmOiW9JLKwFsNrtLl8azqjIgVlC2PKhtNKStc7k5MnPr8q1K0OjtAkI59MA7hNBwo6qyJa46aQo-oRFAEOGio7iCa6dkF74yTRra5XJ99Bt14riBrKYHjVmNLHEoQmTY1nXF0_87swWdILbvRfsqrouZ9dg7eMgbT5k8f01H2MvcgWf9s74-QtEDkupjOvDiKr_qEw2tOgWOg0SIBy4995TMBRgQYVIpS77MlmhpPqJ6jDF0Q7FDOLDBZjQ0QbmcGu25SVgfd5HYJsYhWxOhC1Z6Kma1-QhLe-uhfH3TTJvSZ7rt1f5_mQgNbrAkTODWtJvx_OxOaYPzLlllOTtq3kHh5pGIUk87ZhNAhGWYLceZh_2rWAY5ybVo6HhUKRIeZqT_2TDKSGbf4iBJE8v71OPmyb3cBOw%22%5D&bghash=Eurz7aKF8IqumVYzQ1OPWaVioMwtTQQaPV_ttiabKqw&azt=AFoagUVgjnkngoyWpBQKIDlda1Qv-JFKSQ%3A1549815774884&deviceinfo=%5Bnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2C%22GB%22%2Cnull%2Cnull%2C%5B%5D%2C%22GlifWebSignIn%22%2Cnull%2C%5Bnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2C%5B%5D%5D%5D&gmscoreversion=undefined&checkConnection=youtube%3A1069%3A1&checkedDomains=youtube&pstMsg=1&',
        headers: {
          Accept: '*/*',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          'Google-Accounts-Xsrf': '1',
          Pragma: 'no-cache',
          Te: 'Trailers',
          'X-Same-Domain': '1'
        }
      });
      console.log(response2);

      const response3 = await rp({
        headers: {
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'upgrade-insecure-requests': '1',
          'x-chrome-connected': 'mode=0,enable_account_consistency=false',
          'x-chrome-id-consistency-request':
            'version=1,client_id=77185425430.apps.googleusercontent.com,device_id=7a6aad61-5c71-4873-8562-5f7c8fe26d1d,sync_account_id=116241489796738701984,signin_mode=all_accounts,signout_mode=show_confirmation',
          'x-client-data': 'CKu1yQEIkLbJAQiitskBCMS2yQEIqZ3KAQioo8oBCL+nygEI7KfKAQjiqMoBGIKYygEY+aXKAQ=='
        },
        jar: cookieJar,
        uri: response2.body.split('"').filter(elem => elem.includes('google'))[0],
        method: 'GET'
      });
      console.log(response3);
      console.log(cookieJar);
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <Col className="activeWindow">
          <Container fluid className="d-flex flex-column">
            <Row className="d-flex flex-grow-1" style={{ maxHeight: '100%' }}>
              <Col xs="12" style={{ overflowY: 'scroll', marginBottom: '30px' }}>
                <Table responsive hover className="text-center">
                  <thead>
                    <tr className="d-flex">
                      <th className="col-1">#</th>
                      <th className="col">status</th>
                      <th className="col">account</th>
                      <th className="col">youtube</th>
                      <th className="col">searches</th>
                      <th className="col">shopping</th>
                      <th className="col">news</th>
                      <th className="col" />
                    </tr>
                  </thead>
                  <tbody>{this.props.activities.map(this.returnActivitiesRow)}</tbody>
                </Table>
              </Col>
            </Row>
            <Row>
              <Col xs="2">
                <Label>email</Label>
                <Input name="activityEmail" onChange={this.handleChange} type="email" />
              </Col>
              <Col xs="2">
                <Label>pass</Label>
                <Input name="activityPassword" onChange={this.handleChange} type="password" />
              </Col>
              <Col xs="2">
                <Label>proxy</Label>
                <Input name="activityProxy" onChange={this.handleChange} type="text" />
              </Col>
              <Col xs="1" className="d-flex flex-column justify-content-end">
                <Button onClick={this.addActivity}>Add</Button>
              </Col>
              {/* Maybe Add Max Youtube Watch Time .etc */}
            </Row>
          </Container>
        </Col>
      </CSSTransition>
    );
  }
}
