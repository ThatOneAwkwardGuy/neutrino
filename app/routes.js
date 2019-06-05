import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Home from './containers/Home';
import Login from './containers/Login';
import Captcha from './containers/Captcha';
import Activity from './containers/Activity';
export default (
  <HashRouter>
    <Switch>
      <Route exact path="/" component={Login} />
      <Route exact path="/bot" component={Home} />
      <Route exact path="/captcha" component={Captcha} />
      <Route exact path="/activity" component={Activity} />
    </Switch>
  </HashRouter>
);
