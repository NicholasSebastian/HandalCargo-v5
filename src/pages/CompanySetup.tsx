import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';

import { simpleQuery, query } from '../utils/query';

import { companySetup } from '../Queries.json';
const { formQuery, updateQuery, initializeQuery } = companySetup;

const { Title, Text } = Typography;

interface ICompanySettings {
  companyname: string
  address: string
  city: string
  phone: string
  zipcode: number
  fax: string
  email: string
}

const CompanySetup: FC = () => {
  const [companySettings, setCompanySettings] = useState<ICompanySettings>();
  useEffect(() => { refreshData() }, []);

  async function refreshData() {
    const results = await simpleQuery(formQuery) as Array<ICompanySettings>;
    if (results && results.length !== 0) {
      const data = results[0];
      setCompanySettings(data);
    }
  }

  console.log(companySettings);
  return (
    <CompanySetupStyles>
      {/* here */}
    </CompanySetupStyles>
  );
}

export default CompanySetup;

const CompanySetupStyles = styled.div`
  background-color: #fff;
  padding: 20px 20px 40px 20px;
`;