import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { message, Modal } from 'antd';

import Login from './Login';
import DatabaseSetup from './DatabaseSetup';
import Layout from './Layout';
import Loading from './Loading';

class Authentication extends Component {
  constructor(props: never) {
    super(props);
    this.establishConnection = this.establishConnection.bind(this);
    this.establishConnection();
  }

  establishConnection() {
    const connectionSettings = window.localStorage.getItem('dbsettings');
    const canConnect = connectionSettings !== null;
    const notConnected = window.sessionStorage.getItem('connected') === null;

    if (canConnect && notConnected) {
      ipcRenderer.once('connected', (event, error: boolean) => {
        if (error) {
          window.localStorage.removeItem('dbsettings');
          message.error('Unable to establish connection with database');
          this.setState({ loading: false });
        }
        else {
          window.sessionStorage.setItem('connected', 'true');
          this.forceUpdate();
        }
      });
      const encryptedSettings = JSON.parse(connectionSettings!);
      const decryptedString = ipcRenderer.sendSync('decrypt', encryptedSettings);
      const decryptedSettings = JSON.parse(decryptedString);
      ipcRenderer.send('connect', decryptedSettings);
    }
  }

  render() {
    const canConnect = window.localStorage.getItem('dbsettings') !== null;
    const isConnected = window.sessionStorage.getItem('connected') !== null;
    const isAuthenticated = window.sessionStorage.getItem('profile') !== null;

    if (canConnect) {
      if (isConnected) {
        if (isAuthenticated) 
          return <Layout />
        else
          return <Login callUpdate={() => this.forceUpdate()} />
      }
      else 
        return <Loading />
    }
    return <DatabaseSetup />
  }
}

export default Authentication;
