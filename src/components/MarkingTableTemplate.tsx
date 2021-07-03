import React, { Component, ReactNode, ComponentType, Fragment, Children } from 'react';
import styled from "styled-components";
import { Table, Select, Form, Button, Popconfirm, Card, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SelectValue } from 'antd/lib/select';
import { PlusOutlined, DeleteOutlined, GoldOutlined } from "@ant-design/icons";

import { simpleQuery } from '../utils/query';

const { Item } = Form;
const { Option } = Select;

interface IMarkingTableProps {
  data: Array<any>
  sizeData: any
  setData: (data: Array<any>) => void
  setSizeData: (data: any) => void
}

interface ITemplateProps extends IMarkingTableProps {
  query: string
  columns: ColumnsType<object>
  onSubmit: (marking: SelectValue) => any
  children: ReactNode
  SizeTable: ComponentType<ISizeTableProps>
}

interface IMarkingTableState {
  expanded: [string | number] | []
  marking: SelectValue | null
  customerMarkings: Array<any>
}

interface ISizeTableProps {
  markingId: string | number
  data: any
  setData: (data: any) => void
}

class MarkingTable extends Component<ITemplateProps, IMarkingTableState> {
  constructor(props: ITemplateProps) {
    super(props);
    this.state = {
      expanded: [],
      customerMarkings: [],
      marking: null
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentDidUpdate(prevProps: IMarkingTableProps) {
    const { query } = this.props;
    if (this.props.data !== prevProps.data) {
      console.log('data updated'); // TODO: test if this is only fetching once.
      simpleQuery(query).then((customerMarkings: any) => {
        const markings = customerMarkings.map((customerMarking: any) => customerMarking.marking);
        this.setState({ customerMarkings: markings });
      });
    }
  }

  handleSubmit() {
    const { data, setData, onSubmit } = this.props;
    const { marking } = this.state;
    if (marking) {
      if (data.find(d => d.marking === marking)) {
        message.error("Cannot have duplicate markings in the same entry");
      }
      else {
        const newMarking = onSubmit(marking);
        const newMarkingData = [...data, newMarking];
        setData(newMarkingData);
      }
    }
    else {
      message.error("'Marking' field may not be blank");
    }
  }

  handleDelete(index: number) {
    const { data, setData } = this.props;
    const newData = [...data.slice(0, index), ...data.slice(index + 1)];
    setData(newData);
  }

  render() {
    const { data, sizeData, setSizeData, columns, children, SizeTable } = this.props;
    const { expanded, customerMarkings } = this.state;
    
    const renderColumns = [
      ...columns, 
      { 
        render: (value: any, row: any, index: number) => (
          <Popconfirm placement="left"
            title="Are you sure you would like to delete this entry?"
            onConfirm={() => this.handleDelete(index)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ) 
      }
    ];

    return (
      <Fragment>
        <ItemStyles inputCount={Children.count(children)}>
          <Item label="Marking" colon={false}>
            <Select onChange={value => this.setState({ marking: value })}>
              {customerMarkings.map(marking => (
                <Option key={marking} value={marking}>{marking}</Option>
              ))}
            </Select>
          </Item>
          {children}
          <Button type="default" htmlType="button" icon={<PlusOutlined />} onClick={this.handleSubmit} />
        </ItemStyles>
        <Table pagination={false}
          dataSource={data} size='small' 
          columns={renderColumns}
          expandable={{
            expandIcon: ({ onExpand, record }) => (
              <Button onClick={e => onExpand(record, e)} icon={<GoldOutlined />} />
            ),
            expandIconColumnIndex: columns.length,
            expandedRowRender: (record, index) => (
              <Card>
                <SizeTable markingId={record.no} data={sizeData} setData={setSizeData} />
              </Card>
            ),
            expandedRowKeys: expanded,
            onExpand: (expanded, record) => {
              const keys = [];
              if (expanded) {
                keys.push(record.key);
              }
              this.setState({ expanded: keys as never });
            }
          }} />
      </Fragment>
    );
  }
}

export type { IMarkingTableProps, ISizeTableProps };
export default MarkingTable;

const ItemStyles = styled.div<{ inputCount: number }>`
  display: grid;
  grid-template-columns: ${({ inputCount }) => `1fr ${"1fr ".repeat(inputCount)}50px`};
  margin-top: 10px;

  > * {
    margin-right: 12px;
  }
`;