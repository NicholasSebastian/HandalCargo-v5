import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';

import { IProfile } from '../components/ProfileTemplate';

const { Title } = Typography;

class Welcome extends PureComponent {
  render() {
    const profile: IProfile = JSON.parse(window.sessionStorage.getItem('profile')!); 
    const currentTime = new Date().toLocaleTimeString();

    return (
      <WelcomeStyles>
        <Title>{currentTime}</Title>
        <Title level={4}>Welcome {profile.staffname}</Title>
      </WelcomeStyles>
    );
  }
}

export default Welcome;

const WelcomeStyles = styled.div`
  background-color: #fff;
  padding: 20px;
`;