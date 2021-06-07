import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Descriptions, Table, Space, Button } from 'antd';

import { query, simpleQuery } from '../../utils/query';
import round from '../../utils/roundToTwo';

import { IViewProps } from '../../components/TableTemplate';
import { markingColumns } from './MarkingTable';
import ShippingForm from './ShippingForm';

import { airCargo, routes, planes, currencies } from '../../Queries.json';
const { markingTableQuery: markingQuery } = airCargo;
const { tableQuery: routeQuery } = routes;
const { tableQuery: planeQuery } = planes;
const { tableQuery: currencyQuery } = currencies;

type IViewState = null | {
  routes: Array<any>
  planes: Array<any>
  currencies: Array<any>
  markingData: Array<any>
};

const View: FC<IViewProps> = (props) => {
  const { data } = props;
  const { Item } = Descriptions;

  const [shippingForm, setShippingForm] = useState<string | null>(null);
  const [extraData, setExtraData] = useState<IViewState>(null);
  useEffect(() => {
    (async () => {
      const routes = await simpleQuery(routeQuery) as Array<any>;
      const planes = await simpleQuery(planeQuery) as Array<any>;
      const currencies = await simpleQuery(currencyQuery) as Array<any>;
      const markingData = await query(markingQuery, [data.no]) as Array<any>;
      setExtraData({ routes, planes, currencies, markingData });
    })();
  }, []);

  const shipmentDate = (data.tglmuat as Date)?.toDateString();
  const arrivalDate = (data.tgltiba as Date)?.toDateString();

  const timeDifference = Math.abs(data.tgltiba - data.tglmuat);
  const dateDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  const route = extraData?.routes.find((r: any) => r.rutecode == data.rute)?.rutedesc as string;
  const plane = extraData?.planes.find((p: any) => p.pesawatcode == data.pesawat)?.pesawatdesc as string;
  const currency = extraData?.currencies.find((c: any) => c.currencycode == data.matauang)?.currencydesc as string;

  const freightCharge = data['freightcharge/kg'] || 0;
  const commissionCharge = data['komisi/kg'] || 0;
  const otherFees = data['biayalain-lain'] || 0;

  const freightTotal = freightCharge * data.brtfreight;
  const commissionTotal = commissionCharge * data.brtkomisi;
  const clrnTotal = data.customclrn * data.brtclrn;
  const totalFees = freightTotal + commissionTotal + clrnTotal + data.biayatambahan + otherFees;
  
  const markingDataWithKeys = extraData?.markingData.map((entry: object, i: number) => ({ key: i, ...entry }));

  const totalQuantity = extraData?.markingData.map((d: any) => d.qty).reduce((a: number, b: number) => a + b, 0);
  const totalWeightList = extraData?.markingData.map((d: any) => d['list[kg]']).reduce((a: number, b: number) => a + b, 0);
  const totalWeightHb = extraData?.markingData.map((d: any) => d['hb[kg]']).reduce((a: number, b: number) => a + b, 0);
  const realDifference = round(totalWeightHb - totalWeightList) || 0;
  const masterDifference = round(totalWeightHb - data.brtclrn) || 0;
  
  if (shippingForm) {
    return (
      <ShippingForm
        airwayNumber={data.no} 
        marking={shippingForm} 
        closeForm={() => setShippingForm(null)} />
    );
  }
  return (
    <ViewStyles>
      <Card title="Shipping Information">
        <Descriptions title="Basic Details" labelStyle={{ fontWeight: 500 }} bordered size='small'>
          <Item label="Airway Bill No">{data.no}</Item>
          <Item label="Item Code">{data.kode}</Item>
          <Item label="Date of Shipment">{shipmentDate}</Item>
          <Item label="Date of Arrival">{arrivalDate}</Item>
          <Item label="Days to Ship">{dateDifference}</Item>
          <Item label="Route">{route}</Item>
          <Item label="Plane">{plane}</Item>
          <Item label="Currency">{currency}</Item>
          <Item label="Exchange Rate">{data.kurs}</Item>
          <Item label="Description">{data.keterangan}</Item>
        </Descriptions>
        <Descriptions title="Monetary Details" labelStyle={{ fontWeight: 500 }} bordered size='small'>
          <Item label="Charge/Kg">{freightCharge}</Item>
          <Item label="Freight Weight">{data.brtfreight}</Item>
          <Item label="Freight Total">{freightTotal}</Item>
          <Item label="Commission/Kg">{commissionCharge}</Item>
          <Item label="Commission Weight">{data.brtkomisi}</Item>
          <Item label="Commission Total">{commissionTotal}</Item>
          <Item label="Custom Clrn">{data.customclrn}</Item>
          <Item label="Clrn Weight">{data.brtclrn}</Item>
          <Item label="Clrn Total">{clrnTotal}</Item>
          <Item label="Additional Fees">{data.biayatambahan}</Item>
          <Item label="Other Fees">{otherFees}</Item>
          <Item label="Total Fees">{totalFees}</Item>
        </Descriptions>
      </Card>
      <Card title="Markings">
        <TableStyles size='small' pagination={false}
          dataSource={markingDataWithKeys}
          loading={extraData === null}
          columns={[
            ...markingColumns,
            {
              render: (value, row, index) => (
                <Space>
                  <Button onClick={() => setShippingForm(value.marking)}>Surat Jalan</Button>
                  <Button>Faktur</Button>
                </Space>
              )
            }
          ]} />
      </Card>
      <Card>
        <Descriptions title="Summary" labelStyle={{ fontWeight: 500 }} bordered size='small'>
          <Item label="Total Quantity">{totalQuantity}</Item>
          <Item label="Total Weight (List)">{totalWeightList}</Item>
          <Item label="Total Weight (HB)">{totalWeightHb}</Item>
          <Item label="Real Difference">{realDifference}</Item>
          <Item label="Master Difference">{masterDifference}</Item>
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

const TableStyles = styled(Table)`
  tr > .ant-table-cell:last-of-type {
    text-align: right;
  }
`;