import React, { Component, Fragment, createRef } from 'react';
import styled from 'styled-components';
import { Table, Form, Input, Button, Select } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

import { ISizeTableProps } from '../../components/MarkingTableTemplate';
const { Item } = Form;
const { Option } = Select;

class SizeTable extends Component<ISizeTableProps, {}> {
  nameRef: React.RefObject<Input>;
  weightRef: React.RefObject<Input>;
  collyRef: React.RefObject<Input>;

  constructor(props: ISizeTableProps) {
    super(props);
    this.nameRef = createRef<Input>();
    this.weightRef = createRef<Input>();
    this.collyRef = createRef<Input>();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleSubmit() {
    const { markingId, data, setData } = this.props;

    const name = this.nameRef.current?.state.value;
    const weight = this.weightRef.current?.state.value;
    const colly = this.collyRef.current?.state.value;

    const newSize = { 
      key: Math.max(...data.map((d: any) => d.key)) + 1,
      markingno: markingId,
      nokarung: name, 
      berat: weight, 
      colly 
    };
    const newSizeData = [...data, newSize];
    setData(newSizeData);
  }

  handleDelete(key: number) {
    const { data, setData } = this.props;
    const index = data.findIndex((d: any) => d.uniquecounter === key);
    const newData = [...data.slice(0, index), ...data.slice(index + 1)];
    setData(newData);
  }

  render() {
    const { markingId, data } = this.props;
    const markingSizeData = data.filter((d: any) => d.markingno === markingId);
    return (
      <Fragment>
        <SizeStyles>
          <Select disabled defaultValue='hb[kg]'>
            <Option value='hb[kg]'>{'HB [Kg]'}</Option>
          </Select>
          <Item label="No. Karung" colon={false}><Input ref={this.nameRef} type='number' /></Item>
          <Item label="Berat" colon={false}><Input ref={this.weightRef} type='number' /></Item>
          <Item label="Colly" colon={false}><Input ref={this.collyRef} type='number' /></Item>
          <Button type="default" htmlType="button" icon={<PlusOutlined />} onClick={this.handleSubmit} />
        </SizeStyles>
        <Table pagination={false}
          dataSource={markingSizeData} size='small'
          columns={[
            ...sizeColumns,
            {
              dataIndex: 'uniquecounter',
              render: value => (
                <Button danger onClick={() => this.handleDelete(value)} icon={<DeleteOutlined />} />
              )
            }
          ]} />
      </Fragment>
    );
  }
}

export default SizeTable;

const SizeStyles = styled.div`
  display: grid;
  grid-template-columns: 150px 1.5fr 1fr 1fr 50px;

  > * {
    margin-right: 12px;
  }
`;

const sizeColumns: ColumnsType<object> = [
  {
    title: 'No',
    render: (value, row, index) => index
  },
  {
    title: 'No. Karung',
    dataIndex: 'nokarung'
  },
  {
    title: 'Berat',
    dataIndex: 'berat'
  },
  {
    title: 'Colly',
    dataIndex: 'colly'
  }
];