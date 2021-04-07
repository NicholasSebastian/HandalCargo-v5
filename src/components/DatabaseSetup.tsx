import React, { FunctionComponent, useState } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Typography, Form, Input, Button, Modal, message } from 'antd';
import Image from '../assets/login.jpg';  // TODO: change this image

interface IDatabaseSetupImage {
  src: any
}

const DatabaseSetup: FunctionComponent = () => {
  const { Title } = Typography;
  const { Item } = Form;
  const { Password } = Input;
  const [loading, setLoading] = useState<boolean>(false);

  function handleSubmit(values: any) {
    setLoading(true);
    ipcRenderer.once('connected', (event, error: boolean) => {
      if (error) {
        message.error('Unable to establish connection with database');
        setLoading(false);
      }
      else {
        const connectionSettings = JSON.stringify(values);
        const encrypted = ipcRenderer.sendSync('encrypt', connectionSettings);
        const encryptedString = JSON.stringify(encrypted);
        window.localStorage.setItem('dbsettings', encryptedString);
        promptClose();
      }
    });
    ipcRenderer.send('connect', values);
  }

  function promptClose() {
    const close = () => ipcRenderer.send('logout');
    Modal.info({
      title: "Connection to Database Established",
      content: "The program will be restarted.",
      onOk: close,
      onCancel: close
    });
  }

  return (
    <ViewStyles src={Image}>
      <Form onFinish={handleSubmit}>
        <Title level={4}>Database Setup</Title>
        <Item name="host"><Input placeholder="Host" /></Item>
        <Item name="port"><Input placeholder="Port Number" /></Item>
        <Item name="database"><Input placeholder="Database Name" /></Item>
        <Item name="user"><Input placeholder="Database User" /></Item>
        <Item name="password"><Password placeholder="Database Password" /></Item>
        <Button type='primary' htmlType='submit' loading={loading}>Save</Button>
      </Form>
    </ViewStyles>
  );
}

export default DatabaseSetup;

const ViewStyles = styled.div<IDatabaseSetupImage>`
  background-image: url(${({ src }) => src});
  background-size: cover;
  background-position: bottom;
  height: 100%;

  > form {
    background-color: #fff;
    width: 350px;
    height: 100%;
    margin: 0 auto;
    padding: 35px 60px 0 60px;

    > h4 {
      margin-bottom: 25px;
    }

    > div {
      margin-bottom: 10px;
    }

    > button:last-of-type {
      float: right;
    }
  }
`;