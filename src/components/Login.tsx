import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components'
import { Typography, Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined, CloudServerOutlined } from '@ant-design/icons'

import Image from '../assets/login.jpg'

const { Title, Text } = Typography
const { Item } = Form
const { Password } = Input

const currentYear = new Date().getFullYear();

interface ILoginProps {
  callUpdate: Function
}

interface ILoginState {
  loading: boolean
}

interface ILoginImage {
  src: any
}

class Login extends Component<ILoginProps, ILoginState> {
  constructor(props: ILoginProps) {
    super(props);
    this.state = {
      loading: false
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleResetDbSettings = this.handleResetDbSettings.bind(this);
  }

  componentDidMount() {
    ipcRenderer.once('login-success', (event, profileInfo) => {
      window.sessionStorage.setItem('profile', JSON.stringify(profileInfo));
      ipcRenderer.removeAllListeners('login-failed'); // cleanup
      this.props.callUpdate();
    });

    ipcRenderer.on('login-failed', (event, errorMessage) => {
      message.error(errorMessage);
      this.setState({ loading: false });
    });
  }

  handleLogin(values: any) {
    ipcRenderer.send('login', values.username, values.password);
    this.setState({ loading: true });
  }

  handleResetDbSettings() {
    window.localStorage.removeItem('dbsettings');
    window.sessionStorage.removeItem('connected');
    this.props.callUpdate();
  }

  render() {
    const { loading } = this.state;
    return (
      <LoginStyles>
        <LoginImage src={Image} />
        <div>
          <Title level={5} style={{ textAlign: 'right' }}>Handal Cargo</Title>
          <Title level={2}>Log In</Title>
          <Form onFinish={this.handleLogin}>
            <Item name="username" rules={[{ required: true, message: 'Username is required.' }]}>
              <Input prefix={<UserOutlined style={{ color: 'gray' }} />} placeholder="Username" />
            </Item>
            <Item name="password" rules={[{ required: true, message: 'Password is required.' }]}>
              <Password prefix={<LockOutlined style={{ color: 'gray' }} />} placeholder="Password" />
            </Item>
            <Button type="primary" loading={loading} htmlType="submit">Login</Button>
          </Form>
          <Text>© Handal Cargo {currentYear}, All rights reserved.</Text>
          <Button icon={<CloudServerOutlined />} onClick={this.handleResetDbSettings} />
        </div>
      </LoginStyles>
    );
  }
}

export default Login;

const LoginImage = styled.div<ILoginImage>`
  background-image: url(${({ src }) => src});
  background-size: cover;
  background-position: right;
`;

const LoginStyles = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 5fr 6fr;

  > div:last-child {
    position: relative;
    padding: 45px 40px;

    > h2 {
      margin-bottom: 20px;
    }

    > h5 {
      position: absolute;
      top: 12px;
      right: 20px;
    }

    > span:last-of-type {
      position: absolute;
      bottom: 12px;
      left: 40px;
      font-size: 10px;
    }

    > button:last-of-type {
      position: absolute;
      bottom: 12px;
      right: 20px;
    }
  }
`;
