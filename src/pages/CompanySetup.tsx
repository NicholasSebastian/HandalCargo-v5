import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Typography } from 'antd';

import {} from '../Queries.json';

const { Title, Text } = Typography;

class CompanySetup extends Component {
  render() {
    return (
      <CompanySetupStyles>
        test
      </CompanySetupStyles>
    );
  }
}

export default CompanySetup;

const CompanySetupStyles = styled.div`
  background-color: #fff;
  padding: 20px 20px 40px 20px;
`;