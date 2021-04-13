import React, { Component } from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';

import { simpleQuery, query } from '../utils/query';
import {} from '../Queries.json';

const { Title, Text } = Typography;

class CompanySetup extends Component {
  render() {
    return (
      <CompanySetupStyles>
        {/* here */}
      </CompanySetupStyles>
    );
  }
}

export default CompanySetup;

const CompanySetupStyles = styled.div`
  background-color: #fff;
  padding: 20px 20px 40px 20px;
`;