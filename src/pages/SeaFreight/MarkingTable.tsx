import React, { FC, useRef } from 'react';
import { Input, Form } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SelectValue } from 'antd/lib/select';

import Template, { IMarkingTableProps } from '../../components/MarkingTableTemplate';
import SizeTable from './SizeTable';

import { customers } from '../../Queries.json';
const { markingQuery } = customers;

const { Item } = Form;

const MarkingTable: FC<IMarkingTableProps> = props => {
  const { data, sizeData } = props;
  const quantityRef = useRef<Input>(null);
  const listM3Ref = useRef<Input>(null);
  const listKgRef = useRef<Input>(null);

  function handleSubmit(marking: SelectValue) {
    const quantity = quantityRef.current?.state.value;
    const listM3 = listM3Ref.current?.state.value;
    const listKg = listKgRef.current?.state.value;
    return {
      key: Math.max(...data.map(d => d.key)) + 1,
      no: null,
      marking,
      qty: quantity,
      'list[m3]': listM3,
      'list[kg]': listKg,
      lunas: false,
      sisa: quantity,
      faktur: null
    };
  }

  const getSizeData = (key: string, no: number) => sizeData[key].filter((d: any) => d.markingno === no);
  const sum = (numArray: Array<number>) => numArray.reduce((a: number, b: number) => a + b, 0);
  const calculateVolume = (data: Array<any>) => sum(data.map((d: any) => d.panjang * d.lebar * d.tinggi * d.colly));
  const calculateWeight = (data: Array<any>) => sum(data.map((d: any) => d.berat * d.colly));

  const newColumns = [...markingColumns];
  newColumns[5].render = (markingNo: any) => {
    const dListM3Data = getSizeData('dListM3', markingNo);
    const dListM3 = calculateVolume(dListM3Data);
    return dListM3;
  };
  newColumns[6].render = (markingNo: any) => {
    const dListKgData = getSizeData('dListKg', markingNo);
    const dListKg = calculateWeight(dListKgData);
    return dListKg;
  };
  newColumns[7].render = (markingNo: any) => {
    const hbM3Data = getSizeData('hbM3', markingNo);
    const hbM3 = calculateVolume(hbM3Data);
    return hbM3;
  };
  newColumns[8].render = (markingNo: any) => {
    const hbKgData = getSizeData('hbKg', markingNo);
    const hbKg = calculateWeight(hbKgData);
    return hbKg;
  };
  newColumns[9].render = (markingNo: any) => {
    const custM3Data = getSizeData('custM3', markingNo);
    const custM3 = calculateVolume(custM3Data);
    return custM3;
  };
  newColumns[10].render = (markingNo: any) => {
    const custKgData = getSizeData('custKg', markingNo);
    const custKg = calculateWeight(custKgData);
    return custKg;
  };

  return (
    <Template {...props}
      query={markingQuery}
      columns={newColumns}
      onSubmit={handleSubmit}
      SizeTable={SizeTable}>
      <Item label="Quantity" colon={false}><Input ref={quantityRef} type='number' /></Item>
      <Item label="List [m3]" colon={false}><Input ref={listM3Ref} type='number' /></Item>
      <Item label="List [Kg]" colon={false}><Input ref={listKgRef} type='number' /></Item>
    </Template>
  );
}

export { markingColumns };
export default MarkingTable;

const markingColumns: ColumnsType<object> = [
  {
    title: 'No',
    dataIndex: 'no'
  },
  {
    title: 'Marking',
    dataIndex: 'marking'
  },
  {
    title: 'Qty',
    dataIndex: 'qty'
  },
  {
    title: 'List [m3]',
    dataIndex: 'list[m3]'
  },
  {
    title: 'List [Kg]',
    dataIndex: 'list[kg]'
  },
  {
    title: 'DList [m3]',
    dataIndex: 'no'
  },
  {
    title: 'DList [Kg]',
    dataIndex: 'no'
  },
  {
    title: 'HB [m3]',
    dataIndex: 'no'
  },
  {
    title: 'HB [Kg]',
    dataIndex: 'no'
  },
  {
    title: 'Cust [m3]',
    dataIndex: 'no'
  },
  {
    title: 'Cust [Kg]',
    dataIndex: 'no'
  },
  {
    title: 'Settled',
    dataIndex: 'lunas',
    render: (value) => value ? 
      <span style={{ color: 'green' }}>Paid Off</span> : 
      <span style={{ color: 'red' }}>Not Settled</span>
  },
  {
    title: 'Remainder',
    dataIndex: 'sisa'
  },
  {
    title: 'Delivery Orders',
    dataIndex: 'sisa',
    render: (value: number) => value === 0 ? 
      <span>True</span> :
      <span>False</span>
  },
  {
    title: 'Invoice',
    dataIndex: 'faktur'
  }
];