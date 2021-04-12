import React, { FC, Fragment, useState, useEffect, useRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from "styled-components";
import { Table, Input, Form, Select, Button, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RefSelectProps } from 'antd/lib/select';
import { DownOutlined, DeleteOutlined } from "@ant-design/icons";

import { routes } from '../../Queries.json';
const { tableQuery: routeQuery } = routes;

const { Item } = Form;
const { Option } = Select;

interface IItemTableProps {
  data: Array<any>
  setData: (data: Array<any>) => void
}

const ItemTable: FC<IItemTableProps> = props => {
  const { data, setData } = props;

  const itemDescRef = useRef<Input>(null);
  const byRef = useRef<Input>(null);
  const routeRef = useRef<RefSelectProps>(null);
  const priceRef = useRef<Input>(null);

  const [routes, setRoutes] = useState<Array<any>>([]);
  useEffect(() => {
    ipcRenderer.once('routesQuery', (event, routes) => setRoutes(routes));
    ipcRenderer.send('query', routeQuery, 'routesQuery');
  }, []);

  function handleSubmit() {
    const itemDesc = itemDescRef.current?.state.value;
    const by = byRef.current?.state.value;
    // const route = routeRef.current?.;
    const price = priceRef.current?.state.value;

    // here
  }

  function handleDelete(index: number) {
    const newData = [...data.slice(0, index), ...data.slice(index + 1)];
    setData(newData);
  }

  return (
    <Fragment>
      <ItemStyles>
        <Item label="Item Description" labelCol={{ span: 10 }} colon={false}><Input ref={itemDescRef} /></Item>
        <Item label="By" colon={false}><Input ref={byRef} /></Item>
        <Item label="Route" labelCol={{ span: 100 }} colon={false}>
          <Select ref={routeRef}>
            {routes.map(route => (
              <Option key={route.rutecode} value={route.rutecode}>{route.rutedesc}</Option>
            ))}
          </Select>
        </Item>
        <Item label="Price" colon={false}><Input ref={priceRef} /></Item>
        <Button type="default" htmlType="button" icon={<DownOutlined />} onClick={handleSubmit} />
      </ItemStyles>
      <Table pagination={false}
        dataSource={data} size='small'
        columns={[
          ...itemColumns,
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

export { itemColumns };
export default ItemTable;

const ItemStyles = styled.div`
  display: flex;
  margin-top: 10px;

  > * {
    margin-right: 15px;
  }
`;

const itemColumns: ColumnsType<object> = [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date'
  },
  {
    title: 'Item Description',
    dataIndex: 'keteranganbrg',
    key: 'keteranganbrg'
  },
  {
    title: 'By',
    dataIndex: 'by',
    key: 'by'
  },
  {
    title: 'Route',
    dataIndex: 'rute',
    key: 'rute'
  },
  {
    title: 'Price',
    dataIndex: 'harga',
    key: 'harga'
  },
  {
    title: 'Final Price',
    dataIndex: 'hargaterakhir',
    key: 'hargaterakhir'
  },
  {
    title: 'User',
    dataIndex: 'user',
    key: 'user'
  }
];