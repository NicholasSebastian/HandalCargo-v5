import React, { FC, Fragment, useState, useEffect, useRef } from 'react';
import styled from "styled-components";
import { Table, Input, Form, Select, Button, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SelectValue } from 'antd/lib/select';
import { DownOutlined, DeleteOutlined } from "@ant-design/icons";

import { simpleQuery } from '../../utils/query';
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
  const [route, setRoute]  = useState<SelectValue| null>(null);
  const priceRef = useRef<Input>(null);

  const [routes, setRoutes] = useState<Array<any>>([]);
  useEffect(() => {
    simpleQuery(routeQuery).then((routes: any) => setRoutes(routes));
  }, []);

  function handleSubmit() {
    const itemDesc = itemDescRef.current?.state.value;
    const by = byRef.current?.state.value;
    const price = priceRef.current?.state.value;
    const profile = JSON.parse(window.sessionStorage.getItem('profile')!);

    const newData = {
      key: data.length,
      date: null,
      keteranganbarang: itemDesc,
      by,
      rute: route,
      harga: price,
      hargaterakhir: null,
      user: profile.staffid
    };

    setData([...data, newData]);
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
          <Select onChange={value => setRoute(value)}>
            {routes.map(route => (
              <Option key={route.rutecode} value={route.rutecode}>{route.rutedesc}</Option>
            ))}
          </Select>
        </Item>
        <Item label="Price" colon={false}><Input ref={priceRef} type='number' /></Item>
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
    dataIndex: 'date'
  },
  {
    title: 'Item Description',
    dataIndex: 'keteranganbarang'
  },
  {
    title: 'By',
    dataIndex: 'by'
  },
  {
    title: 'Route',
    dataIndex: 'rute'
  },
  {
    title: 'Price',
    dataIndex: 'harga'
  },
  {
    title: 'Final Price',
    dataIndex: 'hargaterakhir'
  },
  {
    title: 'User',
    dataIndex: 'user'
  }
];