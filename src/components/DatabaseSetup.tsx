import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Typography, Form, Input, Button, Space } from 'antd';
import Image from '../assets/login.jpg';

interface IDatabaseSetupProps {
  connect: () => void
}

interface IDatabaseSetupImage {
  src: any
}

const DatabaseSetup: FunctionComponent<IDatabaseSetupProps> = props => {
  const { Title } = Typography;
  const { Item } = Form;
  const { Password } = Input;
  const { connect } = props;

  function handleSubmit(values: any) {
    const connectionSettings = JSON.stringify(values);
    window.localStorage.setItem('dbsettings', connectionSettings);
    connect();
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
        <Button type='primary' htmlType='submit'>Save</Button>
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