import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Descriptions, Table } from 'antd';

import { query, simpleQuery } from '../../utils/query';
import { IViewProps } from '../../components/TableTemplate';
import { markingColumns } from './MarkingTable';
import { itemColumns } from './ItemTable';

import { customers, productDetails } from '../../Queries.json';
const { markingTableQuery: markingQuery, itemTableQuery: itemQuery } = customers;
const { tableQuery: productDetailQuery } = productDetails;

interface IViewState {
  markingData: Array<any>
  itemData: Array<any>
  productDetails: Array<any>
}

const View: FC<IViewProps> = props => {
  const { data } = props;
  const { Item } = Descriptions;

  const [extraData, setExtraData] = useState<IViewState>();
  useEffect(() => {
    const primaryKey = data.customerid;
    (async () => {
      const markingData = await query(markingQuery, [primaryKey]) as Array<any>;
      const itemData = await query(itemQuery, [primaryKey]) as Array<any>;
      const productDetails = await simpleQuery(productDetailQuery) as Array<any>;
      setExtraData({ markingData, itemData, productDetails });
    })();
  }, []);

  const markingDataWithKeys = extraData?.markingData.map((entry, i) => ({ key: i, ...entry }));
  const itemDataWithKeys = extraData?.itemData.map((entry, i) => ({ key: i, ...entry }));

  return (
    <ViewStyles>
      <Card title="Customer Information">
        <Descriptions title="Customer Details" labelStyle={{ fontWeight: 500 }} bordered size='small'>
          <Item label="Customer ID">{data.customerid}</Item>
          <Item label="Name" span={2}>{data.customername}</Item>
          <Item label="Status">{data.status}</Item>
          <Item label="Company" span={2}>{data.company}</Item>
          <Item label="Address 1" span={3}>{data.address1}</Item>
          <Item label="City 1" span={2}>{data.city1}</Item>
          <Item label="Postal Code 1">{data.postalcode1}</Item>
          <Item label="Address 2" span={3}>{data.address2}</Item>
          <Item label="City 2" span={2}>{data.city2}</Item>
          <Item label="Postal Code 2">{data.postalcode2}</Item>
          <Item label="Size Description" span={2}>{data.sizedesc}</Item>
          <Item label="Courier">{data.courierdesc}</Item>
          <Item label="Other Description" span={3}>{data.others}</Item>
          <Item label="Date Added" span={3}>{data.dateadded?.toDateString()}</Item>
        </Descriptions>
        <Descriptions title="Contact Information" labelStyle={{ fontWeight: 500 }} bordered size='small' column={2}>
          <Item label="Office Phone 1">{data.officecode1}</Item>
          <Item label="Office Phone 2">{data.officecode2}</Item>
          <Item label="Mobile Phone 1">{data.mobilecode1}</Item>
          <Item label="Mobile Phone 2">{data.mobilecode2}</Item>
          <Item label="Home Phone" span={2}>{data.homephone}</Item>
          <Item label="Fax">{data.fax}</Item>
          <Item label="Email">{data.email}</Item>
          <Item label="Contact Person 1">{data.contactperson1}</Item>
          <Item label="Contact Person 2">{data.contactperson2}</Item>
        </Descriptions>
      </Card>
      <Card title="Markings">
        <Table size='small' pagination={false}
          columns={markingColumns}
          dataSource={markingDataWithKeys}
          loading={extraData === null} />
      </Card>
      <Card title="Items">
        <Table size='small' pagination={false}
          columns={[
            {
              title: 'Item Description',
              dataIndex: 'keteranganbarang',
              render: (itemcode) => extraData?.productDetails.find(pd => pd.brgcode === itemcode).brgdesc
            },
            ...itemColumns
          ]}
          dataSource={itemDataWithKeys}
          loading={extraData === null} />
      </Card>
    </ViewStyles>
  );
}

export default View;

const ViewStyles = styled.div`
  > div { margin-bottom: 20px; }

  > div:first-child > div:last-child {
    > div:first-child { margin-bottom: 30px; }
  }
`;