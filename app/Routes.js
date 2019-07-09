import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { Container } from 'reactstrap';
import routes from './constants/routes';
import App from './containers/App';
import Home from './screens/Home';
import Login from './screens/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import { getAuth } from './utils/firebase';

export default class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authorised: false
    };
  }

  componentDidMount() {
    this.checkAuthChange();
  }

  checkAuthChange() {
    const auth = getAuth();
    auth.onAuthStateChanged(user => {
      this.setState({
        authorised: !!user
      });
    });
  }

  render() {
    return (
      <App>
        <Switch>
          {this.state.authorised ? (
            <Route path={routes.ROOT} component={Home} />
          ) : (
            <Route path={routes.ROOT} component={Login} />
          )}
        </Switch>
      </App>
    );
  }
}
