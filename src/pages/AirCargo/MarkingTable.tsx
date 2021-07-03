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
  const listRef = useRef<Input>(null);

  function handleSubmit(marking: SelectValue) {
    const quantity = quantityRef.current?.state.value;
    const list = listRef.current?.state.value;
    return { 
      key: Math.max(...data.map(d => d.key)) + 1,
      no: null,
      marking,
      qty: quantity,
      'list[kg]': list,
      lunas: false,
      sisa: quantity,
      faktur: null
    };
  }

  const newColumns = [...markingColumns];
  newColumns[4].render = (markingNo: any) => {
    const hbKgData = sizeData.filter((d: any) => d.markingno === markingNo)
    const hbKg = hbKgData.map((d: any) => d.berat * d.colly).reduce((a: number, b: number) => a + b, 0);
    return hbKg;
  };

  return (
    <Template {...props}
      query={markingQuery}
      columns={newColumns}
      onSubmit={handleSubmit}
      SizeTable={SizeTable}>
      <Item label="Quantity" colon={false}><Input ref={quantityRef} type='number' /></Item>
      <Item label="List [Kg]" colon={false}><Input ref={listRef} type='number' /></Item>
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
    title: 'List [Kg]',
    dataIndex: 'list[kg]'
  },
  {
    title: 'HB [Kg]',
    dataIndex: 'no'
  },
  {
    title: 'Settled',
    dataIndex: 'lunas',
    render: value => value ? 
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