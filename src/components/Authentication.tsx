import React, { Component } from 'react';
import { ipcRenderer } from 'electron';

import Login from './Login';
import Layout from './Layout';
import Loading from './Loading';

class Authentication extends Component {
  componentDidMount() {
    // connect to database if not connected.
    if (window.sessionStorage.getItem('connected') === null) {
      ipcRenderer.once('connected', () => {
        window.sessionStorage.setItem('connected', 'true');
        this.forceUpdate();
      });
      ipcRenderer.send('connect');
    }
  }

  render() {
    const isConnected = window.sessionStorage.getItem('connected') !== null;
    const isAuthenticated = window.sessionStorage.getItem('profile') !== null;

    if (isConnected) {
      if (isAuthenticated) 
        return <Layout />
      else
        return <Login callUpdate={() => this.forceUpdate()} />
    }
    return <Loading />
  }
}

export default Authentication;
