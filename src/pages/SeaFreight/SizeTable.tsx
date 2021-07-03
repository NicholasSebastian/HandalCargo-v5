import React, { Component, FC, Fragment, useRef } from 'react';
import styled from 'styled-components';
import { Table, Form, Input, Button, Select } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

import { ISizeTableProps } from '../../components/MarkingTableTemplate';
const { Item } = Form;
const { Option } = Select;

type Mode = 'dListKg'|'dListM3'|'hbKg'|'hbM3'|'custKg'|'custKg'|'custM3';

interface ISizeTableState {
  mode: Mode
}

interface IInputProps {
  onSubmit: (values: any) => void
}

class SizeTable extends Component<ISizeTableProps, ISizeTableState> {
  constructor(props: ISizeTableProps) {
    super(props);
    this.state = {
      mode: 'dListKg'
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleSubmit(values: any) {
    const { markingId, data, setData } = this.props;
    const { mode } = this.state;
    const selectedData = data[mode];

    const newSize = { 
      key: selectedData!.length > 0 ? Math.max(...selectedData!.map((d: any) => d.key)) + 1 : 1,
      markingno: markingId,
      ...values
    };
    const newSizeData = [...selectedData!, newSize];

    const newData = { ...data };
    newData[mode] = newSizeData;
    setData(newData);
  }

  handleDelete(key: number) {
    const { data, setData } = this.props;
    const { mode } = this.state;
    const selectedData = data[mode];

    const index = data.findIndex((d: any) => d.uniquecounter === key);
    const newSizeData = [...selectedData!.slice(0, index), ...selectedData!.slice(index + 1)];

    const newData = { ...data };
    newData[mode] = newSizeData;
    setData(newData);
  }

  render() {
    const { markingId, data } = this.props;
    const { mode } = this.state;
    const selectedData = data[mode];

    const sizeMode = mode.substr(-2, 2);
    const columns = sizeMode === 'Kg' ? weightColumns : volumeColumns;
    const inputs = sizeMode === 'Kg' ? (
      <WeightInput onSubmit={this.handleSubmit} />
    ) : (
      <HeightInput onSubmit={this.handleSubmit} />
    );

    const markingData = selectedData?.filter((d: any) => d.markingno === markingId);
    return (
      <Fragment>
        <SizeStyles>
          <Select value={mode} onChange={mode => this.setState({ mode })}>
            <Option value='dListKg'>{'DList [Kg]'}</Option>
            <Option value='dListM3'>{'DList [m3]'}</Option>
            <Option value='hbKg'>{'HB [Kg]'}</Option>
            <Option value='hbM3'>{'HB [m3]'}</Option>
            <Option value='custKg'>{'Cust [Kg]'}</Option>
            <Option value='custM3'>{'Cust [m3]'}</Option>
          </Select>
          {inputs}
        </SizeStyles>
        <Table pagination={false}
          dataSource={markingData} size='small'
          columns={[
            ...columns,
            {
              dataIndex: 'uniquecounter',
              render: (value) => (
                <Button danger onClick={() => this.handleDelete(value)} icon={<DeleteOutlined />} />
              )
            }
          ]} />
      </Fragment>
    );
  }
}

const WeightInput: FC<IInputProps> = props => {
  const { onSubmit } = props;

  const weightRef = useRef<Input>(null);
  const collyRef = useRef<Input>(null);

  function handleSubmit() {
    const weight = weightRef.current?.state.value;
    const colly = collyRef.current?.state.value;
    const values = {
      berat: weight,
      colly
    };
    onSubmit(values);
  }

  return (
    <Fragment>
      <Item label="Berat" colon={false}><Input ref={weightRef} type='number' /></Item>
      <Item label="Colly" colon={false}><Input ref={collyRef} type='number' /></Item>
      <Button type="default" htmlType="button" icon={<PlusOutlined />} onClick={handleSubmit} />
    </Fragment>
  );
}

const HeightInput: FC<IInputProps> = props => {
  const { onSubmit } = props;

  const lengthRef = useRef<Input>(null);
  const widthRef = useRef<Input>(null);
  const heightRef = useRef<Input>(null);
  const collyRef = useRef<Input>(null);

  function handleSubmit() {
    const length = lengthRef.current?.state.value;
    const width = widthRef.current?.state.value;
    const height = heightRef.current?.state.value;
    const colly = collyRef.current?.state.value;
    const values = {
      panjang: length,
      lebar: width,
      tinggi: height,
      colly
    };
    onSubmit(values);
  }

  return (
    <Fragment> 
      <Item label="Panjang" colon={false}><Input ref={lengthRef} type='number' /></Item>
      <Item label="Lebar" colon={false}><Input ref={widthRef} type='number' /></Item>
      <Item label="Tinggi" colon={false}><Input ref={heightRef} type='number' /></Item>
      <Item label="Colly" colon={false}><Input ref={collyRef} type='number' /></Item>
      <Button type="default" htmlType="button" icon={<PlusOutlined />} onClick={handleSubmit} />
    </Fragment>
  );
}

export default SizeTable;

const SizeStyles = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr 1fr 1fr 1fr 50px;

  > * {
    margin-right: 12px;
  }
`;

const weightColumns: ColumnsType<object> = [
  {
    title: 'No',
    dataIndex: 'uniquecounter'
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

const volumeColumns: ColumnsType<object> = [
  {
    title: 'No',
    dataIndex: 'uniquecounter'
  },
  {
    title: 'Panjang',
    dataIndex: 'panjang'
  },
  {
    title: 'lebar',
    dataIndex: 'lebar'
  },
  {
    title: 'Tinggi',
    dataIndex: 'tinggi'
  },
  {
    title: 'Colly',
    dataIndex: 'colly'
  }
];