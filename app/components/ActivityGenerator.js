import React, { Component } from 'react';
import { Button, Container, Row, Col, Input, Label, Table, Progress } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import FontAwesome from 'react-fontawesome';
import url from 'url';
const remote = require('electron').remote;
const windowManager = remote.require('electron-window-manager');
const path = require('path');
const rp = require('request-promise');
export default class ActivityGenerator extends Component {
  constructor(props) {
    super(props);
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
      <tr key={`Activity-${index}`} className="activityRow">
        <td>{index + 1}</td>
        <td>{activity.status}</td>
        <td>{activity.activityEmail}</td>
        <td>
          <Progress className="progressBar" value={activity.youtube} max={total}>
            {/* {`${((activity.youtube * 100) / total).toFixed(1)}%`} */}
          </Progress>
        </td>
        <td>
          <Progress className="progressBar" value={activity.searches} max={total} />
        </td>
        <td>
          <Progress className="progressBar" value={activity.shopping} max={total} />
        </td>
        <td>
          <Progress className="progressBar" value={activity.news} max={total} />
        </td>
        <td>
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
      pathname: process.mainModule.filename,
      protocol: 'file:',
      slashes: true,
      hash: 'activity'
    });
    this.props.activities[index].status = 'Logging In';
    this.props.onUpdateActivity(index, this.props.activities[index]);
    const cookieJar = rp.jar();
    await this.loginToGoogle(activity.activityEmail, activity.activityPassword, cookieJar, index);
    this.props.activities[index].status = 'Logged In';
    this.props.onUpdateActivity(index, this.props.activities[index]);
    console.log(remote.session);
    this.props.setActivityWindow(
      index,
      windowManager.createNew(
        `window-${index}`,
        `window-${index}`,
        activityLocation,
        false,
        {
          width: this.props.settings.showAcitivtyWindows ? 500 : 0,
          height: this.props.settings.showAcitivtyWindows ? 650 : 0,
          show: true,
          frame: false,
          resizable: true,
          focusable: true,
          minimizable: true,
          closable: true,
          allowRunningInsecureContent: true,
          webPreferences: {
            allowRunningInsecureContent: true,
            nodeIntegration: true,
            webSecurity: false,
            session: remote.session.fromPartition(`window-${index}`),
            // partition: `window${index}`,
            preload:
              process.env.NODE_ENV === 'development'
                ? path.resolve(__dirname, '..', '..', 'webpack-pack', 'activityPreload.js')
                : path.resolve(process.resourcesPath, 'webpack-pack', 'activityPreload.js')
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
      cookies: cookieJar._jar.store.idx
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

  loginToGoogle = async (email, password, cookieJar, index) => {
    const getLoginBody = await rp({
      method: 'GET',
      jar: cookieJar,
      uri: 'https://accounts.google.com/ServiceLogin?hl=en&passive=true&continue=https://www.google.com/',
      followRedirect: true,
      resolveWithFullResponse: true
    });

    const emailLookUp = await rp({
      method: 'POST',
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'google-accounts-xsrf': '1',
        pragma: 'no-cache',
        'x-same-domain': '1',
        referrer:
          'https://accounts.google.com/signin/v2/identifier?hl=en&passive=true&continue=https%3A%2F%2Fwww.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin',
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      jar: cookieJar,
      uri: 'https://accounts.google.com/_/signin/sl/lookup?hl=en&_reqid=155835&rt=j',
      followRedirect: true,
      resolveWithFullResponse: true,
      body: `continue=https%3A%2F%2Fwww.google.com%2F&hl=en&f.req=%5B%22${encodeURIComponent(
        email
      )}%22%2C%22AEThLly5pGL2Ki3lmfMGGoS4m_TVeujt1FIJSsmQZomj6YVAOZDM8siVX81Nvq8NPJdvi9H7mzcQBw3JhhT0i-A4xmB1dgbIKZCgeNUVFcgIMQe9fXrKrrAoZgl_qZylmhuaGBmDVS4dw1Z7BrxleZgAzUQpudcSWedKxlF8GaXF5c_AfCNYsxY%22%2C%5B%5D%2Cnull%2C%22GB%22%2Cnull%2Cnull%2C2%2Cfalse%2Ctrue%2C%5Bnull%2Cnull%2C%5B2%2C1%2Cnull%2C1%2C%22https%3A%2F%2Faccounts.google.com%2FServiceLogin%3Fhl%3Den%26passive%3Dtrue%26continue%3Dhttps%253A%252F%252Fwww.google.com%252F%22%2Cnull%2C%5B%5D%2C4%2C%5B%5D%2C%22GlifWebSignIn%22%5D%2C1%2C%5Bnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2C%5B%5D%5D%2Cnull%2Cnull%2Cnull%2Ctrue%5D%2C%22${encodeURIComponent(
        email
      )}%22%5D&bgRequest=%5B%22identifier%22%2C%22!R0SlRGVCBNogPZe2FY1EgZLrBMxMIAECAAAAa1IAAAfPmQGWUbDP7zUTeTPaAjL7QIFSGE_U96gbmf8e5A1z7nZ_mXPBuWR55S1cWeBXUdzN81-H-ItOfJPAD1WziVmWEU9PTUwNl_UtsEjvZOosNKDKOJMQXdztncQq65E6BTw2ox0PLNLe4dAN5zZwMWd1IA9ovUC2fxf2guMAqzZak3Jf_3mFcCBt3ZcclO4YU8Tx_Cka7Hbs58250Dhgs9z9RkRQwvv-6VBSZYZkLM0a9PsO-pmbZ_mfNu_ShcAzHRGsSuckwvuX1PSzjISDogms6QQ13XYi36WP8yVNOUM6ZfdUfxA1t-S1IdjWxmywPwf7A7X2S6cqxoNHtWnWp63EY0knKaJcgQK4h55itUYbCkv6tMUFnVCL29fA9axFcra3_twxhDDOHtsi8dZGERbYrkdiYQopMFfCXy1xLAA03ld_Zgf3KDbexs7BBhZGHlbM9NWM95NxuoH_HyisCdjZ_s3ZOUZNLKsvryXnMZggKO2o8_y-rZOZHbptCJHJKSgugj6ggsipdIHo-4Ej5lJoC7W2VncuegJb_w%22%5D&azt=AFoagUVFbwXEzlk823d_NYQiekLDhnxJ9Q%3A1553959770855&cookiesDisabled=false&deviceinfo=%5Bnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2C%22GB%22%2Cnull%2Cnull%2C%5B%5D%2C%22GlifWebSignIn%22%2Cnull%2C%5Bnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2C%5B%5D%5D%5D&gmscoreversion=undefined&checkConnection=youtube%3A195%3A1&checkedDomains=youtube&pstMsg=1&`
    });
    const loginCode = emailLookUp.body.split(`"`)[3];
    console.log(loginCode);
    const login = await rp({
      method: 'POST',
      uri: 'https://accounts.google.com/_/signin/sl/challenge?hl=en&_reqid=355835&rt=j',
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'google-accounts-xsrf': '1',
        pragma: 'no-cache',
        'x-same-domain': '1',
        referrer:
          'https://accounts.google.com/signin/v2/sl/pwd?hl=en&passive=true&continue=https%3A%2F%2Fwww.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin&cid=1&navigationDirection=forward',
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      jar: cookieJar,
      body: `continue=https%3A%2F%2Fwww.google.com%2F&hl=en&f.req=%5B%22${loginCode}%22%2Cnull%2C1%2Cnull%2C%5B1%2Cnull%2Cnull%2Cnull%2C%5B%22${password}%22%2Cnull%2Ctrue%5D%5D%2C%5Bnull%2Cnull%2C%5B2%2C1%2Cnull%2C1%2C%22https%3A%2F%2Faccounts.google.com%2FServiceLogin%3Fhl%3Den%26passive%3Dtrue%26continue%3Dhttps%253A%252F%252Fwww.google.com%252F%22%2Cnull%2C%5B%5D%2C4%2C%5B%5D%2C%22GlifWebSignIn%22%5D%2C1%2C%5Bnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2C%5B%5D%5D%2Cnull%2Cnull%2Cnull%2Ctrue%5D%5D&bgRequest=%5B%22identifier%22%2C%22!w8ClwOFCBNogPZe2FY1EgZLrBMxMIAECAAAAWVIAAAcmmQGgbUb6bBxVY5Nxr9I6EyGloYcdx5m3oG6jc1mKUTsO9iOyJ6FHpDtOYZgvI4EnJmFukL58L5zksuECDWQ5GgdhYCdHwwObtbe-xZuWfNMqzmR6izzfBLzXawDdE26R8kbyj4ogPU5bZWrMHsrED8KzQAb6TVN-CSlJ-etcVJ4mYALrWR21RAKBWl-4MZBilmfWc6s70epG8yvJuCLES4L-FMOSpAia5IrHn5YwnFzroJ54S7TsCg0uvUysPMREfq1P5vYKeqH5yeOXhe-UjcwQa1Hv3yu3UKaBIVNrwYfLdGVu4qO_pBGLK8DqunZfQ6aBnB2EWaw6VLuv21Mrk1RP_M4lazqlJqRZEuvmT_6Otw4Eo0RNF7hwfDexb-7o5ee5dsBMsiCKXX8K4X28RPF3e-mucrt-KosB3cIZrbGKmkbpPcsaPt1hW5_W40H3hTSCM-R7T5O5H9B0a--HSFVODlWtECqUoh47kb3J3lCBKbio6oC75i2QN-b87GdaCiEKo3lNbBCSwXZYKihgTxokAmSPJov4O5vD8LsTW2FrypI%22%5D&bghash=psDJOMEN-Gt-kYnzHttn5GGc8LdDM2TL5qmr7yJNyfM&azt=AFoagUVFbwXEzlk823d_NYQiekLDhnxJ9Q%3A1553959770855&cookiesDisabled=false&deviceinfo=%5Bnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2C%22GB%22%2Cnull%2Cnull%2C%5B%5D%2C%22GlifWebSignIn%22%2Cnull%2C%5Bnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2C%5B%5D%5D%5D&gmscoreversion=undefined&checkConnection=youtube%3A195%3A1&checkedDomains=youtube&pstMsg=1&`,
      followRedirect: true,
      resolveWithFullResponse: true
    });

    if (login.body.includes('INCORRECT_ANSWER_ENTERED')) {
      this.props.activities[index].status = 'Wrong Password Entered';
      this.props.onUpdateActivity(index, this.props.activities[index]);
      throw new Error('Wrong Password Entered');
    }

    // const youtube = await rp({
    //   followAllRedirects: true,
    //   resolveWithFullResponse: true,
    //   headers: {
    //     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    //     'accept-language': 'en-US,en;q=0.9',
    //     'cache-control': 'no-cache',
    //     pragma: 'no-cache',
    //     'upgrade-insecure-requests': '1',
    //     'x-chrome-connected': 'mode=0,enable_account_consistency=false',
    //     'x-chrome-id-consistency-request':
    //       'version=1,client_id=77185425430.apps.googleusercontent.com,device_id=7a6aad61-5c71-4873-8562-5f7c8fe26d1d,sync_account_id=116241489796738701984,signin_mode=all_accounts,signout_mode=show_confirmation',
    //     'x-client-data': 'CKu1yQEIkLbJAQiitskBCMS2yQEIqZ3KAQioo8oBCL+nygEI7KfKAQjiqMoBGIKYygEY+aXKAQ=='
    //   },
    //   jar: cookieJar,
    //   uri: login.body.split('"').filter(elem => elem.includes('google'))[0],
    //   method: 'GET'
    // });
    // console.log(youtube);

    const get1 = await rp({
      method: 'GET',
      jar: cookieJar,
      uri: `https://accounts.youtube.com/accounts/SetSIDFrame?ssdc=1&sidt=${encodeURIComponent(loginCode)}&pmpo=https%3A%2F%2Faccounts.google.com`,
      followAllRedirects: true,
      resolveWithFullResponse: true,
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'upgrade-insecure-requests': '1',
        referrer:
          'https://accounts.google.com/CheckCookie?hl=en&checkedDomains=youtube&checkConnection=youtube%3A195%3A1&pstMsg=1&chtml=LoginDoneHtml&continue=https%3A%2F%2Fwww.google.com%2F&gidl=EgIIAA',
        referrerPolicy: 'no-referrer-when-downgrade'
      }
    });

    console.log(get1);

    const get2 = await rp({
      method: 'GET',
      jar: cookieJar,
      uri: `https://accounts.google.com/accounts/SetSIDFrame?ssdc=1&sidt=${encodeURIComponent(loginCode)}&pmpo=https%3A%2F%2Faccounts.google.com`,
      followAllRedirects: true,
      resolveWithFullResponse: true,
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'upgrade-insecure-requests': '1',
        referrer:
          'https://accounts.google.com/CheckCookie?hl=en&checkedDomains=youtube&checkConnection=youtube%3A195%3A1&pstMsg=1&chtml=LoginDoneHtml&continue=https%3A%2F%2Fwww.google.com%2F&gidl=EgIIAA',
        referrerPolicy: 'no-referrer-when-downgrade'
      }
    });

    const get3 = await rp({
      method: 'GET',
      followRedirect: true,
      resolveWithFullResponse: true,
      jar: cookieJar,
      uri:
        'https://accounts.google.com/CheckCookie?hl=en&checkedDomains=youtube&checkConnection=youtube%3A195%3A1&pstMsg=1&chtml=LoginDoneHtml&continue=https%3A%2F%2Fwww.google.com%2F&gidl=EgIIAA',
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'upgrade-insecure-requests': '1',
        referrer:
          'https://accounts.google.com/signin/v2/sl/pwd?hl=en&passive=true&continue=https%3A%2F%2Fwww.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin&cid=1&navigationDirection=forward',
        referrerPolicy: 'no-referrer-when-downgrade'
      }
    });

    const googleHomepage = await rp({
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'upgrade-insecure-requests': '1',
        referrer:
          'https://accounts.google.com/CheckCookie?hl=en&checkedDomains=youtube&checkConnection=youtube%3A195%3A1&pstMsg=1&chtml=LoginDoneHtml&continue=https%3A%2F%2Fwww.google.com%2F&gidl=EgIIAA',
        referrerPolicy: 'no-referrer-when-downgrade'
      },
      jar: cookieJar,
      uri: 'https://www.google.com/',
      method: 'GET',
      followRedirect: true,
      resolveWithFullResponse: true
    });

    const youtubeHomepage = await rp({
      method: 'GET',
      jar: cookieJar,
      uri: 'https://www.youtube.com/',
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'upgrade-insecure-requests': '1',
        referrerPolicy: 'no-referrer-when-downgrade'
      }
    });
    console.log(youtubeHomepage);
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
                    <tr>
                      <th>#</th>
                      <th>status</th>
                      <th>account</th>
                      <th>youtube</th>
                      <th>searches</th>
                      <th>shopping</th>
                      <th>news</th>
                      <th />
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
              <Col xs="2" className="d-flex flex-column justify-content-end">
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
