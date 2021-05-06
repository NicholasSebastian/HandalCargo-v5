import React, { FC, Fragment, useRef } from 'react';
import styled from "styled-components";
import { Table, Input, Form, Button, Popconfirm , message} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

import { query } from '../../utils/query';
import { customers } from '../../Queries.json';
const { markingCheckQuery } = customers;

const { Item } = Form;

interface IMarkingTableProps {
  data: Array<any>
  setData: (data: Array<any>) => void
}

const MarkingTable: FC<IMarkingTableProps> = props => {
  const { data, setData } = props;
  const markingRef = useRef<Input>(null);

  function handleSubmit() {
    const marking = markingRef.current?.state.value as string;
    if (marking && marking.length > 0) {
      if (data.find(d => d.marking === marking)) {
        message.error("Cannot have duplicate markings in the same entry");
      }
      else {
        const newData = { key: data.length, marking };
        setData([...data, newData]);
      }
    }
    else {
      message.error("'Marking' field may not be blank");
    }
  }

  async function handleDelete(index: number) {
    const { marking } = data[index];
    const result = await query(markingCheckQuery, [marking, marking]) as Array<any>;
    const isReferenced = Boolean(Object.values(result[0])[0]);
    if (isReferenced) {
      message.error("This marking is currently being used in a shipping entry");
    }
    else {
      const newData = [...data.slice(0, index), ...data.slice(index + 1)];
      setData(newData);
    }
  }

  return (
    <Fragment>
      <ItemStyles>
        <Item label="Marking" colon={false}><Input ref={markingRef} /></Item>
        <Button type="default" htmlType="button" icon={<PlusOutlined />} onClick={handleSubmit} />
      </ItemStyles>
      <Table pagination={false}
        dataSource={data} size='small'
        columns={[
          ...markingColumns,
          {
            width: 50,
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
  justify-content: center;
  margin-top: 10px;

  > * {
    margin-right: 12px;
  }
`;

const markingColumns: ColumnsType<object> = [
  {
    title: 'Marking',
    dataIndex: 'marking'
  }
];