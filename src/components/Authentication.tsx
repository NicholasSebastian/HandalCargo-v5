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
    this.setupDatabase = this.setupDatabase.bind(this);

    this.establishConnection(() => this.forceUpdate());
  }

  establishConnection(onSuccess: () => void) {
    const connectionSettings = window.localStorage.getItem('dbsettings');
    const canConnect = connectionSettings !== null;
    const notConnected = window.sessionStorage.getItem('connected') === null;

    if (canConnect && notConnected) {
      ipcRenderer.once('connected', (event, error: boolean) => {
        if (error) {
          window.localStorage.removeItem('dbsettings');
          message.error('Unable to establish connection with database');
        }
        else {
          window.sessionStorage.setItem('connected', 'true');
          onSuccess();
        }
      });
      ipcRenderer.send('connect', JSON.parse(connectionSettings!));
    }
  }

  setupDatabase() {
    this.establishConnection(() => {
      Modal.info({
        title: "Connection to Database Established",
        content: "The program will be restarted.",
        onOk() {
          ipcRenderer.send('logout');
        }
      });
    });
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
    return <DatabaseSetup connect={this.setupDatabase} />
  }
}

export default Authentication;
