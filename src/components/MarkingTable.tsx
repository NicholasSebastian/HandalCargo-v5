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
    
    setData([
      ...data,
      { 
        no: null,   // TODO: Figure out what to do with this 'no' field. Without this, handleDelete won't work.
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
      }
    ]);
    if (onUpdate) onUpdate();
  }

  function handleDelete(primaryKey: string | number) {
    const newData = data.filter(d => d.no !== primaryKey);
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
          ...innerTableColumns,
          {
            dataIndex: 'no',
            render: (primaryKey: string | number) => (
              <Popconfirm placement="left"
                title="Are you sure you would like to delete this entry?"
                onConfirm={() => handleDelete(primaryKey)}>
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )
          }
        ]} />
    </Fragment>
  );
}

export default MarkingTable;

const ItemStyles = styled.div`
  display: flex;
  margin-top: 10px;

  > * {
    margin-right: 10px;
  }
`;

const innerTableColumns: ColumnsType<object> = [
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
    title: 'Lunas',
    dataIndex: 'lunas',
    key: 'lunas'
  },
  {
    title: 'Sisa',
    dataIndex: 'sisa',
    key: 'sisa'
  },
  {
    title: 'Surat Jalan',
    dataIndex: 'suratjalan',
    key: 'suratjalan'
  },
  {
    title: 'Faktur',
    dataIndex: 'faktur',
    key: 'faktur'
  }
];