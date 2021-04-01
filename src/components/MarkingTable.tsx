import React, { FunctionComponent, Fragment, useRef } from 'react';
import styled from "styled-components";
import { Table, Input, Form, Button, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { DownOutlined, DeleteOutlined } from "@ant-design/icons";

const { Item } = Form;

interface MarkingTableProps {
  data: Array<any>
  setData: (data: Array<any>) => void
  onUpdate?: () => void
}

const MarkingTable: FunctionComponent<MarkingTableProps> = props => {
  const { data, setData, onUpdate } = props;

  const markingRef = useRef<Input>(null);
  const quantityRef = useRef<Input>(null);
  const listRef = useRef<Input>(null);

  function handleSubmit() {
    const marking = markingRef.current?.state.value;
    const quantity = quantityRef.current?.state.value;
    const list = listRef.current?.state.value;

    const newData = { 
      key: data.length,
      no: null,
      marking,
      qty: quantity,
      'list[kg]': list,
      'hb[kg]': null,
      'standart[kg]': null,
      'vol.charge': null,
      lunas: false,
      sisa: null,
      suratjalan: null,
      faktur: null
    };
    
    setData([...data, newData]);
    if (onUpdate) onUpdate();
  }

  function handleDelete(index: number) {
    const newData = [...data.slice(0, index), ...data.slice(index + 1)];
    setData(newData);
    if (onUpdate) onUpdate();
  }

  return (
    <Fragment>
      <ItemStyles>
        <Item label="Marking"><Input ref={markingRef} /></Item>
        <Button type="default" htmlType="button" icon={<DownOutlined />} onClick={handleSubmit} />
        <Item label="Quantity"><Input ref={quantityRef} /></Item>
        <Item label="List [Kg]"><Input ref={listRef} /></Item>
      </ItemStyles>
      <Table pagination={false}
        dataSource={data} size='small' 
        columns={[
          ...markingColumns,
          {
            dataIndex: 'no',
            render: (value, row, index) => (
              <Popconfirm placement="left"
                title="Are you sure you would like to delete this entry?"
                onConfirm={() => handleDelete(index)}>
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )
          }
        ]} />
    </Fragment>
  );
}

export { markingColumns };
export default MarkingTable;

const ItemStyles = styled.div`
  display: flex;
  margin-top: 10px;

  > * {
    margin-right: 10px;
  }
`;

const markingColumns: ColumnsType<object> = [
  {
    title: 'No',
    dataIndex: 'no',
    key: 'no'
  },
  {
    title: 'Marking',
    dataIndex: 'marking',
    key: 'marking'
  },
  {
    title: 'Qty',
    dataIndex: 'qty',
    key: 'qty'
  },
  {
    title: 'List [Kg]',
    dataIndex: 'list[kg]',
    key: 'list[kg]'
  },
  {
    title: 'HB [Kg]',
    dataIndex: 'hb[kg]',
    key: 'hb[kg]'
  },
  {
    title: 'Standard [Kg]',
    dataIndex: 'standart[kg]',
    key: 'standart[kg]'
  },
  {
    title: 'Vol. Charge',
    dataIndex: 'vol.charge',
    key: 'vol.charge'
  },
  {
    title: 'Settled',
    dataIndex: 'lunas',
    key: 'lunas',
    render: (value) => value ? 
      <span style={{ color: 'green' }}>Paid Off</span> : 
      <span style={{ color: 'red' }}>Not Settled</span>
  },
  {
    title: 'Remainder',
    dataIndex: 'sisa',
    key: 'sisa'
  },
  {
    title: 'Delivery Orders',
    dataIndex: 'suratjalan',
    key: 'suratjalan'
  },
  {
    title: 'Invoice',
    dataIndex: 'faktur',
    key: 'faktur'
  }
];