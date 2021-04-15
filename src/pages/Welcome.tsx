import React, { FC, useState, useRef } from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';

import { IProfile } from '../components/ProfileTemplate';
import PageEffect from '../components/PageEffect';

const { Title } = Typography;

const Welcome: FC = () => {
  const profile = useRef<IProfile>(JSON.parse(window.sessionStorage.getItem('profile')!));
  const [time, setTime] = useState<string>();

  function refreshTime() {
    setTime(new Date().toLocaleTimeString());
  }

  return (
    <WelcomeStyles>
      <PageEffect pageKey='welcome' function={refreshTime} />
      <Title>{time}</Title>
      <Title level={4}>Welcome {profile.current.staffname}</Title>
    </WelcomeStyles>
  );
}

export default Welcome;

const WelcomeStyles = styled.div`
  background-color: #fff;
  padding: 20px;
`;