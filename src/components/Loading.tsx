import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Spin } from 'antd';

const Loading: FunctionComponent = () => {
  return (
    <Center><Spin size='large'/></Center>
  );
}

export default Loading;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
