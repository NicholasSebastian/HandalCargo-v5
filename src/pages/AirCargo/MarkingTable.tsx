import React, { FunctionComponent, Fragment, useEffect, useRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Table, Input, Form, Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { DownOutlined } from "@ant-design/icons";

const { Item } = Form;

interface MarkingTableProps {
  data: Array<any>
  setData: Function
}

const MarkingTable: FunctionComponent<MarkingTableProps> = props => {
  const markingRef = useRef<Input>(null);
  const quantityRef = useRef<Input>(null);
  const listRef = useRef<Input>(null);

  useEffect(() => {
    // TODO: Query and set Table Data here.
  }, []);

  function handleSubmit() {
    const marking = markingRef.current?.state.value;
    const quantity = quantityRef.current?.state.value;
    const list = listRef.current?.state.value;

    // TODO: Modify Table Data here.
  }

  return (
    <Fragment>
      <Item label="Marking"><Input ref={markingRef} /></Item>
      <Button type="default" htmlType="button" icon={<DownOutlined />} onClick={handleSubmit} />
      <Item label="Quantity"><Input ref={quantityRef} /></Item>
      <Item label="List [Kg]"><Input ref={listRef} /></Item>
      <Table columns={innerTableColumns}
        dataSource={props.data}
        onRow={(record: Object, rowIndex) => {
          return { onClick: e => {
            // TODO: Select? so entries can be deleted.
          }}
        }} />
    </Fragment>
  );
}

const innerTableColumns: ColumnsType<object> = [
  {
    title: 'No',
    dataIndex: '',
    key: ''
  },
  {
    title: 'Marking',
    dataIndex: '',
    key: ''
  },
  {
    title: 'Qty',
    dataIndex: '',
    key: ''
  },
  {
    title: 'List [Kg]',
    dataIndex: '',
    key: ''
  },
  {
    title: 'HB [Kg]',
    dataIndex: '',
    key: ''
  },
  {
    title: 'Standard [Kg]',
    dataIndex: '',
    key: ''
  },
  {
    title: 'Vol. Charge',
    dataIndex: '',
    key: ''
  },
  {
    title: 'Lunas',
    dataIndex: '',
    key: ''
  },
  {
    title: 'Sisa',
    dataIndex: '',
    key: ''
  },
  {
    title: 'Surat Jalan',
    dataIndex: '',
    key: ''
  },
  {
    title: 'Faktur',
    dataIndex: '',
    key: ''
  }
];

export default MarkingTable;