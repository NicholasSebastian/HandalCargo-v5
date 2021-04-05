import React, { Component, FunctionComponent, ComponentType, useState } from 'react';
import { Subtract } from 'utility-types';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Table, Input, Modal, message, Space, Button, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PlusOutlined } from '@ant-design/icons';

import PageEffect from './PageEffect';
import Loading from './Loading';

import instanceOfKey from '../utils/uniqueKey';

const { Search } = Input;

type Object = { [key: string]: any }

interface IQueries {
  tableQuery: string
  formQuery: string
  insertQuery: string
  updateQuery: string
  deleteQuery: string
}

interface ITemplateProps {
  pageKey: string
  dataKey: string
  queries: IQueries
  columns: ColumnsType<object>
  View?: FunctionComponent<IViewProps>
  Form: ComponentType<IFormProps>
  extraData?: (data: Array<Object>) => Array<Object>
  width?: number
}

interface ITemplateState {
  tableData: Array<Object>
  search: string
  modal: TModal | null
}

interface IViewProps {
  data: Object
}

interface IFormData {
  entryId?: string | number
}

interface IFormProps extends IFormData {
  closeModal: () => void
}

type TViewMode = { mode: "view" } & IViewProps;
type TFormMode = { mode: "form" } & IFormData;
type TModal = (TViewMode | TFormMode) & { key?: string | number };

class Template extends Component<ITemplateProps, ITemplateState> {
  constructor(props: ITemplateProps) {
    super(props);
    this.state = {
      tableData: [],
      search: '',
      modal: null
    };
    this.refreshTable = this.refreshTable.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleView = this.handleView.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  refreshTable() {
    const { dataKey, queries } = this.props;
    ipcRenderer.once('tableQuery', (event, data: Array<Object>) => {
      this.setState({ 
        tableData: data.map(entry => ({ key: entry[dataKey], ...entry }))
      });
    });
    ipcRenderer.send('query', queries.tableQuery, 'tableQuery');
  }

  closeModal() {
    this.setState({ modal: null });
    this.refreshTable();
  }

  handleView(entryId: string | number) {
    const { queries } = this.props;
    ipcRenderer.once('tableViewQuery', (event, data) => {
      this.setState({ 
        modal: {
          mode: "view",
          key: instanceOfKey(entryId),
          data: data[0]
        }
      });
    });
    ipcRenderer.send('queryValues', queries.formQuery, [entryId], 'tableViewQuery');
  }

  handleAdd() {
    this.setState({ 
      modal: { 
        mode: 'form' 
      }
    });
  }

  handleEdit(entryId: string | number) {
    this.setState({
      modal: {
        mode: 'form',
        key: instanceOfKey(entryId),
        entryId
      }
    });
  }

  handleDelete(entryId: string | number) {
    const { queries } = this.props;
    ipcRenderer.once('tableDeleteQuery', () => {
      message.success(`Entry successfully deleted`);
      this.refreshTable();
    });
    ipcRenderer.send('queryValues', queries.deleteQuery, [entryId], 'tableDeleteQuery');
  }

  render() {
    const { View, Form, pageKey, dataKey, extraData, width } = this.props;
    const { tableData, modal, search } = this.state;

    const columns = [ 
      ...this.props.columns, 
      {
        dataIndex: dataKey,
        render: (primaryKey: string | number) => (
          <Space>
            <Button onClick={e => { e.stopPropagation(); this.handleEdit(primaryKey); }}>Edit</Button>
            <Popconfirm placement="left"
              title="Are you sure you would like to delete this entry?"
              onConfirm={() => this.handleDelete(primaryKey)}>
              <Button onClick={e => e.stopPropagation()}>Delete</Button>
            </Popconfirm>
          </Space>
        )
      } 
    ];

    let modalComponent: JSX.Element | null = null;
    if (modal) {
      const { key, mode } = modal;
      if (View === undefined || mode === 'form') {
        const { entryId } = modal as never;
        modalComponent = <Form key={key} entryId={entryId} closeModal={this.closeModal} />
      }
      else if (mode === 'view') {
        const { data } = modal as never;
        modalComponent = <View key={key} data={data} />
      }
    }

    const processedData = extraData ? extraData(tableData) : tableData;
    return (
      <>
        <PageEffect function={this.refreshTable} pageKey={pageKey} />
        {processedData.length > 0 ?
        <TemplateStyles>
          <Search placeholder="Search" allowClear style={{ width: 300 }}
            onSearch={value => this.setState({ search: value })} />
          <br />
          <Button icon={<PlusOutlined />} onClick={this.handleAdd}>Add Record</Button> 
          <Table columns={columns} 
            dataSource={processedData.filter((entry: Object) => (
              new RegExp(search, 'i').test(entry[dataKey])
            ))}
            onRow={(record: Object, rowIndex) => ({
              onClick: View && (e => {
                const primaryKey = record[dataKey];
                this.handleView(primaryKey);
              })
            })} />
        </TemplateStyles> : <Loading />
        }
        <Modal centered maskClosable width={width || 1250} footer={null}
          visible={modal !== null} onCancel={this.closeModal}
          bodyStyle={{ 
            paddingTop: 30, 
            paddingBottom: 20, 
            paddingLeft: 50,
            paddingRight: 50,
            maxHeight: '90vh', 
            overflowY: 'auto' 
          }}>
          {modalComponent}
        </Modal>
      </>
    );
  }
}

export { IViewProps, IFormProps };
export default Template;

const TemplateStyles = styled.div`
  background-color: #fff;
  padding: 20px;
  text-align: right;

  > span:first-child, > button {
    margin-bottom: 10px;
  }

  tbody > tr:hover {
    cursor: pointer;
  }
`;
