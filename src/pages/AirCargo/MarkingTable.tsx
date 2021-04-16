import React, { FC, Fragment, useRef, useEffect, useState } from 'react';
import styled from "styled-components";
import { Table, Input, Select, Form, Button, Popconfirm, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SelectValue } from 'antd/lib/select';
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

import { simpleQuery } from '../../utils/query';

import { customers } from '../../Queries.json';
const { markingQuery } = customers;

const { Item } = Form;
const { Option } = Select;

interface IMarkingTableProps {
  data: Array<any>
  setData: (data: Array<any>) => void
}

const MarkingTable: FC<IMarkingTableProps> = props => {
  const { data, setData } = props;

  const [marking, setMarking] = useState<SelectValue | null>(null);
  const quantityRef = useRef<Input>(null);
  const listRef = useRef<Input>(null);

  const [customerMarkings, setCustomerMarkings] = useState([]);
  useEffect(() => {
    simpleQuery(markingQuery).then((customerMarkings: any) => {
      const markings = customerMarkings.map((customerMarking: any) => customerMarking.marking);
      setCustomerMarkings(markings);
    });
  }, [data]);

  function handleSubmit() {
    if (marking) {
      if (data.find(d => d.marking === marking)) {
        message.error("Cannot have duplicate markings in the same entry");
      }
      else {
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
      }
    }
    else {
      message.error("'Marking' field may not be blank");
    }
  }

  function handleDelete(index: number) {
    const newData = [...data.slice(0, index), ...data.slice(index + 1)];
    setData(newData);
  }

  return (
    <Fragment>
      <ItemStyles>
        <Item label="Marking" colon={false}>
          <Select onChange={value => setMarking(value)}>
            {customerMarkings.map(marking => (
              <Option key={marking} value={marking}>{marking}</Option>
            ))}
          </Select>
        </Item>
        <Item label="Quantity" colon={false}><Input ref={quantityRef} type='number' /></Item>
        <Item label="List [Kg]" colon={false}><Input ref={listRef} type='number' /></Item>
        <Button type="default" htmlType="button" icon={<PlusOutlined />} onClick={handleSubmit} />
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
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 50px;
  margin-top: 10px;

  > * {
    margin-right: 12px;
  }
`;

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
    dataIndex: 'hb[kg]'
  },
  {
    title: 'Standard [Kg]',
    dataIndex: 'standart[kg]'
  },
  {
    title: 'Vol. Charge',
    dataIndex: 'vol.charge'
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
    dataIndex: 'suratjalan'
  },
  {
    title: 'Invoice',
    dataIndex: 'faktur'
  }
];