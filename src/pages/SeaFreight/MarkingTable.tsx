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
  const listM3Ref = useRef<Input>(null);
  const listKgRef = useRef<Input>(null);

  function handleSubmit() {
    const marking = markingRef.current?.state.value;
    const quantity = quantityRef.current?.state.value;
    const listM3 = listM3Ref.current?.state.value;
    const listKg = listKgRef.current?.state.value;

    const newData = {
      key: data.length,
      no: null,
      marking,
      qty: quantity,
      'list[m3]': listM3,
      'list[kg]': listKg,
      'dlist[m3]': null,
      'dlist[kg]': null,
      'hb[m3]': null,
      'hb[kg]': null,
      'cust[m3]': null,
      'cust[kg]': null,
      lunas: false,
      // maybe there should be more
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
        <Item label="List [m3]"><Input ref={listM3Ref} /></Item>
        <Item label="List [Kg]"><Input ref={listKgRef} /></Item>
      </ItemStyles>
      <Table pagination={false}
        dataSource={data} size='small' 
        columns={[
          ...markingColumns,
          {
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
    title: 'List [m3]',
    dataIndex: 'list[m3]',
    key: 'list[m3]'
  },
  {
    title: 'List [Kg]',
    dataIndex: 'list[kg]',
    key: 'list[kg]'
  },
  {
    title: 'DList [m3]',
    dataIndex: 'dlist[m3]',
    key: 'dlist[m3]'
  },
  {
    title: 'DList [Kg]',
    dataIndex: 'dlist[kg]',
    key: 'dlist[kg]'
  },
  {
    title: 'HB [m3]',
    dataIndex: 'hb[m3]',
    key: 'hb[m3]'
  },
  {
    title: 'HB [Kg]',
    dataIndex: 'hb[kg]',
    key: 'hb[kg]'
  },
  {
    title: 'Cust [m3]',
    dataIndex: 'cust[m3]',
    key: 'cust[m3]'
  },
  {
    title: 'Cust [Kg]',
    dataIndex: 'cust[kg]',
    key: 'cust[kg]'
  },
  {
    title: 'Settled',
    dataIndex: 'lunas',
    key: 'lunas',
    render: (value) => value ? 
      <span style={{ color: 'green' }}>Paid Off</span> : 
      <span style={{ color: 'red' }}>Not Settled</span>
  },
  // I think there should be more here
];