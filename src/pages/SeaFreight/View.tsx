import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Descriptions, Table } from 'antd';

import { query, simpleQuery } from '../../utils/query';

import { IViewProps } from '../../components/TableTemplate';
import { markingColumns } from './MarkingTable';

import { seaFreight, containerGroup, carriers, routes, handlers, currencies } from '../../Queries.json';
const { markingTableQuery: markingQuery } = seaFreight;
const { tableQuery: containerGroupQuery } = containerGroup;
const { tableQuery: carrierQuery } = carriers;
const { tableQuery: routeQuery } = routes;
const { tableQuery: handlerQuery } = handlers;
const { tableQuery: currencyQuery } = currencies;

type IViewState = null | {
  containerGroups: Array<any>
  carriers: Array<any>
  routes: Array<any>
  handlers: Array<any>
  currencies: Array<any>
  markingData: Array<any>
};

const View: FC<IViewProps> = (props) => {
  const { data } = props;
  const { Item } = Descriptions;

  const [extraData, setExtraData] = useState<IViewState>(null);
  useEffect(() => {
    (async () => {
      const containerGroups = await simpleQuery(containerGroupQuery) as Array<any>;
      const carriers = await simpleQuery(carrierQuery) as Array<any>;
      const routes = await simpleQuery(routeQuery) as Array<any>;
      const handlers = await simpleQuery(handlerQuery) as Array<any>;
      const currencies = await simpleQuery(currencyQuery) as Array<any>;
      const markingData = await query(markingQuery, [data.nocontainer]) as Array<any>;
      setExtraData({ containerGroups, carriers, routes, handlers, currencies, markingData });
    })();
  }, []);

  const shipmentDate = (data.tglmuat as Date)?.toDateString();
  const arrivalDate = (data.tgltiba as Date)?.toDateString();
  const blDate = (data.tglbl as Date)?.toDateString();

  const timeDifference = Math.abs(data.tgltiba - data.tglmuat);
  const dateDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  const containerGroup = extraData?.containerGroups.find(c => c.containercode === data.kelcontainer)?.containerdesc as string;
  const carrier = extraData?.carriers.find(c => c.shippercode === data.shipper)?.name as string;
  const route = extraData?.routes.find(r => r.rutecode === data.rute)?.rutedesc as string;
  const handler = extraData?.handlers.find(h => h.penguruscode === data.pengurus)?.pengurusname as string;
  const currency = extraData?.currencies.find(c => c.currencycode === data.matauang)?.currencydesc as string;

  const clearanceFees = data['b.customclrc'];
  const additionalFees = data['b.tambahan'];
  const otherFees = data['b.lain-lain'];
  const totalFees = data.biayamuat + clearanceFees + additionalFees + otherFees;

  const markingDataWithKeys = extraData?.markingData.map((entry: object, i: number) => ({ key: i, ...entry }));

  const totalQuantity = extraData?.markingData.map(d => d.qty).reduce((a, b) => a + b, 0);
  const totalVolumeList = extraData?.markingData.map(d => d['list[m3]']).reduce((a, b) => a + b, 0);
  const totalVolumeDList = extraData?.markingData.map(d => d['dlist[m3]']).reduce((a, b) => a + b, 0);
  const totalVolumeHB = extraData?.markingData.map(d => d['hb[m3]']).reduce((a, b) => a + b, 0);
  const totalVolumeCust = extraData?.markingData.map(d => d['cust[m3]']).reduce((a, b) => a + b, 0);
  const totalWeightList = extraData?.markingData.map(d => d['list[kg]']).reduce((a, b) => a + b, 0);
  const totalWeightDList = extraData?.markingData.map(d => d['dlist[kg]']).reduce((a, b) => a + b, 0);
  const totalWeightHB = extraData?.markingData.map(d => d['hb[kg]']).reduce((a, b) => a + b, 0);
  const totalWeightCust = extraData?.markingData.map(d => d['cust[kg]']).reduce((a, b) => a + b, 0);

  return (
    <ViewStyles>
      <Card title="Shipping Information">
        <Descriptions title="Basic Details" labelStyle={{ fontWeight: 500 }} bordered size='small'>
          <Item label="Container No">{data.nocontainer}</Item>
          <Item label="Item Code">{data.kodebarang}</Item>
          <Item label="Date of Shipment">{shipmentDate}</Item>
          <Item label="Date of Arrival">{arrivalDate}</Item>
          <Item label="Date of B/L">{blDate}</Item>
          <Item label="Days to Ship">{dateDifference}</Item>
          <Item label="Container Group">{containerGroup}</Item>
          <Item label="Carrier">{carrier}</Item>
          <Item label="Route">{route}</Item>
          <Item label="Handler">{handler}</Item>
          <Item label="Currency">{currency}</Item>
          <Item label="Exchange Rate">{data.kurs}</Item>
          <Item label="Description">{data.keterangan}</Item>
        </Descriptions>
        <Descriptions title="Monetary Details" labelStyle={{ fontWeight: 500 }} bordered size='small'>
          <Item label="Loading Fees">{data.biayamuat}</Item>
          <Item label="Custom Clearance Fees">{clearanceFees}</Item>
          <Item label="Additional Fees">{additionalFees}</Item>
          <Item label="Other Fees">{otherFees}</Item>
          <Item label="Total Fees">{totalFees}</Item>
        </Descriptions>
      </Card>
      <Card title="Markings">
        <Table size='small' pagination={false}
          columns={markingColumns}
          dataSource={markingDataWithKeys}
          loading={extraData === null} />
      </Card>
      <Card>
        <Descriptions title="Summary" labelStyle={{ fontWeight: 500 }} bordered size='small'>
          <Item label="Total Quantity">{totalQuantity}</Item>
          <Item label="Total Volume [List]">{totalVolumeList}</Item>
          <Item label="Total Volume [DList]">{totalVolumeDList}</Item>
          <Item label="Total Volume [HB]">{totalVolumeHB}</Item>
          <Item label="Total Volume [Cust]">{totalVolumeCust}</Item>
          <Item label="Total Weight [List]">{totalWeightList}</Item>
          <Item label="Total Weight [DList]">{totalWeightDList}</Item>
          <Item label="Total Weight [HB]">{totalWeightHB}</Item>
          <Item label="Total Weight [Cust]">{totalWeightCust}</Item>
        </Descriptions>
      </Card>
    </ViewStyles>
  );
}

export default View;

const ViewStyles = styled.div`
  > div { margin-bottom: 20px; }
  
  > div:first-child > div:last-child {
    > div:first-child { margin-bottom: 20px; }
  }
`;