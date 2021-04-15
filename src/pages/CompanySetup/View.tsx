import React, { FC, useState, useEffect, Fragment } from 'react';
import styled from 'styled-components';
import { Descriptions, Button, Modal } from 'antd';

import { simpleQuery } from '../../utils/query';

import Form from './Form';

import { companySetup } from '../../Queries.json';
const { formQuery, initializeQuery } = companySetup;

const { Item } = Descriptions;

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
  const [modal, setModal] = useState<boolean>(false);

  const [companySettings, setCompanySettings] = useState<ICompanySettings>();
  useEffect(() => { refreshData() }, []);

  async function refreshData() {
    const results = await simpleQuery(formQuery) as Array<ICompanySettings>;
    if (results && results.length !== 0) {
      const data = results[0];
      setCompanySettings(data);
    }
    else {
      await simpleQuery(initializeQuery);
      refreshData();
    }
  }

  function closeModal() {
    setModal(false);
    refreshData();
  }

  return (
    <Fragment>
      <CompanySetupStyles>
        <div><Button onClick={() => setModal(true)}>Edit Settings</Button></div>
        <Descriptions bordered size='small' column={1}
          labelStyle={{ fontWeight: 500, width: '200px' }}>
          <Item label="Company Name">{companySettings?.companyname || 'Not Specified'}</Item>
          <Item label="Address">{companySettings?.address || 'Not Specified'}</Item>
          <Item label="City">{companySettings?.city || 'Not Specified'}</Item>
          <Item label="Phone">{companySettings?.phone || 'Not Specified'}</Item>
          <Item label="Zip Code">{companySettings?.zipcode || 'Not Specified'}</Item>
          <Item label="Fax">{companySettings?.fax || 'Not Specified'}</Item>
          <Item label="Email">{companySettings?.email || 'Not Specified'}</Item>
        </Descriptions>
      </CompanySetupStyles>
      <Modal centered maskClosable width={600} footer={null}
        visible={modal} onCancel={closeModal} bodyStyle={ModalStyles}>
        <Form data={companySettings} closeModal={closeModal} />
      </Modal>
    </Fragment>
  );
}

export { ICompanySettings };
export default CompanySetup;

const CompanySetupStyles = styled.div`
  background-color: #fff;
  padding: 20px 20px 40px 20px;

  > div:first-child {
    margin-bottom: 10px;
    text-align: right;
  }
`;

const ModalStyles: React.CSSProperties = { 
  paddingTop: 40, 
  paddingBottom: 30, 
  paddingLeft: 50,
  paddingRight: 50,
  maxHeight: '90vh', 
  overflowY: 'auto' 
}