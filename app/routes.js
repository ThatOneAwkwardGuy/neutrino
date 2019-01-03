import React from 'react';
import { Route, Switch } from 'react-router';
import Home from './containers/Home';
import Login from './containers/Login';
export default (
  <Switch>
    <Route exact path="/" component={Login} />
    <Route exact path="/bot" component={Home} />
  </Switch>
);
