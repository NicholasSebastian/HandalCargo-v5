import React, { FC, Fragment, useState, useEffect, useRef } from 'react';
import styled from "styled-components";
import { Table, Input, Form, Select, Button, Popconfirm, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SelectValue } from 'antd/lib/select';
import { DownOutlined, DeleteOutlined } from "@ant-design/icons";

import { simpleQuery } from '../../utils/query';

import { productDetails, routes } from '../../Queries.json';
const { tableQuery: productDetailQuery } = productDetails;
const { tableQuery: routeQuery } = routes;

const { Item } = Form;
const { Option } = Select;

interface IItemTableProps {
  data: Array<any>
  setData: (data: Array<any>) => void
}

interface IData {
  productDetails: Array<any>
  routes: Array<any>
}

const ItemTable: FC<IItemTableProps> = props => {
  const { data, setData } = props;

  const [itemDesc, setItemDesc] = useState<SelectValue | null>(null);
  const byRef = useRef<Input>(null);
  const [route, setRoute]  = useState<SelectValue| null>(null);
  const priceRef = useRef<Input>(null);

  const [localData, setLocalData] = useState<IData>();
  useEffect(() => {
    (async () => {
      const productDetails = await simpleQuery(productDetailQuery) as Array<any>;
      const routes = await simpleQuery(routeQuery) as Array<any>;
      setLocalData({ productDetails, routes });
    })();
  }, [data]);

  function handleSubmit() {
    const by = byRef.current?.state.value as string;
    if (itemDesc && (by && by.length > 0) && route) {
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
    else {
      message.error("'Item Description', 'By', and 'Route' fields may not be blank");
    }
  }

  function handleDelete(index: number) {
    const newData = [...data.slice(0, index), ...data.slice(index + 1)];
    setData(newData);
  }

  return (
    <Fragment>
      <ItemStyles>
        <Item label="Item Description" labelCol={{ span: 10 }} colon={false}>
          <Select onChange={value => setItemDesc(value)}>
            {localData?.productDetails.map(productDetail => (
              <Option key={productDetail.brgcode} value={productDetail.brgcode}>{productDetail.brgdesc}</Option>
            ))}
          </Select>
        </Item>
        <Item label="By" colon={false}><Input ref={byRef} /></Item>
        <Item label="Route" labelCol={{ span: 100 }} colon={false}>
          <Select onChange={value => setRoute(value)}>
            {localData?.routes.map(route => (
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
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr 50px;
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