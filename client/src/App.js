import React, { Component } from 'react';
import { Route, BrowserRouter, Redirect } from 'react-router-dom';

import Predictions from './Predictions';
import Login from './Login';
import Register from './Register';
import Prediction from './Prediction'; 
import Upload from './Upload';
import Home from './Home';

class RouteWithLayout extends Component {
  render() {
    const { layout: Layout, component: Component, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={matchProps => (
          <Layout 
            page={this.props.name}
          >
            <Component {...matchProps} />
          </Layout>
        )}
      />
    );
  }
}

class App extends Component {
  render() {
    return (
      <BrowserRouter>
          {/* <Route exact path="/home" render={() => <Predictions />} />
          <Route exact path="/login" render={() => <Login />} />
          <Route exact path="/register" render={() => <Register />} />
          <Route exact path="/" render={() => <Redirect to="/home" />} />
          <Route exact path="/prediction/:jobId" render={() => <Prediction />} />
          <Route exact path="/upload" render={() => <Upload />} /> */}
          <RouteWithLayout exact path="/home" layout={Home} component={Predictions} name="Dashboard"/>
          <RouteWithLayout exact path="/login" layout={Login} component={Login} />
          <RouteWithLayout exact path="/register" layout={Register} component={Register} />
          <RouteWithLayout exact path="/" layout={Home} component={Predictions} name="Dashboard"/>
          <RouteWithLayout exact path="/prediction/:jobId" layout={Home} component={Prediction} name="Prediction" />
          <RouteWithLayout exact path="/upload" layout={Home} component={Upload} name="Upload" />

      </BrowserRouter>
    );
  }
}

export default App;