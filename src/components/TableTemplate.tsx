import React, { Component, FunctionComponent } from 'react';
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
  View: FunctionComponent<IViewProps>
  Form: typeof Component
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
  query?: string
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
    ipcRenderer.once('tableQuery', (event, data: Array<Object>) => {
      this.setState({ 
        tableData: data.map(entry => {
          const processedEntries = Object.entries(entry).map(([key, value]) => {
            const newValue = (typeof value === 'object') ? value.toString().substr(4, 11) : value; // dates
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
    ipcRenderer.once('tableViewQuery', (event, data) => {
      this.setState({ 
        modal: {
          mode: "view",
          key: instanceOfKey(entryId),
          data: data[0]
        }
      });
    });
    ipcRenderer.send('queryValues', this.props.queries.formQuery, [entryId], 'tableViewQuery');
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
    ipcRenderer.once('tableDeleteQuery', () => {
      message.success(`Entry successfully deleted`);
      this.refreshTable();
    });
    ipcRenderer.send('queryValues', this.props.queries.deleteQuery, [entryId], 'tableDeleteQuery');
  }

  render() {
    const { View, Form, queries } = this.props;
    const { tableData, modal, search } = this.state;

    const columns = [ 
      ...this.props.columns, 
      {
        dataIndex: this.props.dataKey,
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
      const { key } = modal;
      switch (modal.mode) {
        case 'view':
          const { data } = modal;
          modalComponent = <View key={key} data={data} />
          break;
        case 'form':
          const { entryId } = modal;
          const { formQuery } = queries;
          modalComponent = 
            <Form key={key} entryId={entryId} query={formQuery} 
              closeModal={this.closeModal} />
          break;
      }
    }

    return (
      <>
        <PageEffect function={this.refreshTable} pageKey={this.props.pageKey} />
        {tableData.length > 0 ?
        <TemplateStyles>
          <Search placeholder="Search" allowClear style={{ width: 300 }}
            onSearch={value => this.setState({ search: value })} />
          <br />
          <Button icon={<PlusOutlined />} onClick={this.handleAdd}>Add Record</Button> 
          <Table columns={columns} 
            dataSource={tableData.filter(entry => (
              new RegExp(search, 'i').test(entry[this.props.dataKey])
            ))}
            onRow={(record: Object, rowIndex) => {
              return { onClick: e => {
                const primaryKey = record[this.props.dataKey];
                this.handleView(primaryKey);
              }}
            }} />
        </TemplateStyles> :
        <Loading />
        }
        <Modal centered maskClosable width={1250} footer={null}
          bodyStyle={{ 
            paddingTop: 50, 
            paddingBottom: 20, 
            paddingLeft: 50,
            paddingRight: 50,
            maxHeight: '90vh', 
            overflowY: 'auto' 
          }}
          visible={modal !== null}
          onCancel={this.closeModal}>
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
