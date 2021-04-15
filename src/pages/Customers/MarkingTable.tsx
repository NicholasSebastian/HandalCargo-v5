import React, { FC, Fragment, useRef } from 'react';
import styled from "styled-components";
import { Table, Input, Form, Button, Popconfirm , message} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { DownOutlined, DeleteOutlined } from "@ant-design/icons";

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
      const newData = { key: data.length, marking };
      setData([...data, newData]);
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
        <Item label="Marking" colon={false}><Input ref={markingRef} /></Item>
        <Button type="default" htmlType="button" icon={<DownOutlined />} onClick={handleSubmit} />
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