import React, { Component, FunctionComponent } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Table, Input, Modal, message, Space, Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PlusOutlined } from '@ant-design/icons';

import PageEffect from './PageEffect';

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
  View: FunctionComponent<IViewProps>
  Form: typeof Component // Component<IFormProps, IFormState>
}

interface ITemplateState {
  tableData: Array<Object>
  search: string
  modal: JSX.Element | null
}

interface IViewProps {
  data: Object
}

interface IFormProps {
  closeModal: () => void
  data?: Object
}

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
    ipcRenderer.once('tableQuery', (event, data: Array<Object>) => {
      this.setState({ 
        tableData: data.map(entry => {
          const processedEntries = Object.entries(entry).map(([key, value]) => {
            const newValue = (typeof value === 'object') ? value.toString().substr(4, 11) : value;
            return [key, newValue];
          });
          const processedObject = Object.fromEntries(processedEntries);
          return { key: entry[this.props.dataKey], ...processedObject };
        })
      });
    });
    ipcRenderer.send('query', this.props.queries.tableQuery, 'tableQuery');
  }

  closeModal() {
    this.setState({ modal: null });
    this.refreshTable();
  }

  handleView(entryId: string | number) {
    const { View, dataKey } = this.props;
    ipcRenderer.once('tableViewQuery', (event, data) => {
      this.setState({ modal: <View data={data[0]} key={data[0][dataKey]} /> });
    });
    ipcRenderer.send('queryValues', this.props.queries.formQuery, [entryId], 'tableViewQuery');
  }

  handleAdd() {
    const { Form, dataKey } = this.props;
    this.setState({ modal: <Form closeModal={this.closeModal} /> });
  }

  handleEdit(entryId: string | number) {
    const { Form, dataKey } = this.props;
    ipcRenderer.once('tableFormQuery', (event, data) => {
      this.setState({ modal: <Form data={data[0]} closeModal={this.closeModal} key={data[0][dataKey]} /> });
    });
    ipcRenderer.send('queryValues', this.props.queries.formQuery, [entryId], 'tableFormQuery');
  }

  handleDelete(entryId: string | number) {
    ipcRenderer.once('tableDeleteQuery', () => {
      message.success(`Entry successfully deleted`);
      this.refreshTable();
    });
    ipcRenderer.send('queryValues', this.props.queries.deleteQuery, [entryId], 'tableDeleteQuery');
  }

  render() {
    const columns = [ 
      ...this.props.columns, 
      {
        dataIndex: this.props.dataKey,
        render: (primaryKey: string | number) => (
          <Space>
            <Button onClick={e => { e.stopPropagation(); this.handleEdit(primaryKey); }}>Edit</Button>
            <Button onClick={e => { e.stopPropagation(); this.handleDelete(primaryKey); }}>Delete</Button>
          </Space>
        )
      } 
    ];

    return (
      <>
        <PageEffect function={this.refreshTable} pageKey={this.props.pageKey} />
        <TemplateStyles>
          <Search placeholder="Search" allowClear
            style={{ width: 300 }}
            onSearch={value => this.setState({ search: value })} />
          <br />
          <Button icon={<PlusOutlined />} onClick={this.handleAdd}>Add Record</Button> 
          <Table columns={columns} 
            dataSource={this.state.tableData.filter(entry => (
              new RegExp(this.state.search, 'i').test(entry[this.props.dataKey])
            ))}
            onRow={(record: Object, rowIndex) => {
              return { onClick: e => {
                const primaryKey = record[this.props.dataKey];
                this.handleView(primaryKey);
              }}
            }} />
        </TemplateStyles>
        <Modal centered maskClosable width={600} footer={null}
          bodyStyle={{ paddingTop: 50, paddingBottom: 20 }}
          visible={this.state.modal !== null}
          onCancel={this.closeModal}>
          {this.state.modal}
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
