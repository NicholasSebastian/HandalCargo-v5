import React, { Component, FunctionComponent, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Table, Input, Modal, message, Space, Button, FormInstance, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PlusOutlined } from '@ant-design/icons';

import PageEffect from './PageEffect';
import { Store } from 'antd/lib/form/interface';

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
  formRef: React.RefObject<FormInstance>
}

interface IDataProps {
  query: string
  entryId: string | number
  closeModal: () => void
}

interface IDataState {
  initialValues: Store
}

function withFormRef(Comp: typeof Component) {
  // I don't know why this is what it is.
  return class Form extends Component<any, any> {
    formRef: React.RefObject<FormInstance>;

    constructor(props: any) {
      super(props);
      this.formRef = createRef();
    }

    render() {
      return <Comp {...this.props} formRef={this.formRef} />;
    }
  }
}

function withData(Comp: typeof Component) {
  return class Form extends Component<IDataProps, IDataState> {
    formRef: React.RefObject<FormInstance>;

    constructor(props: IDataProps) {
      super(props);
      this.formRef = createRef();
      this.state = {
        initialValues: {}
      };
      this.initializeData = this.initializeData.bind(this);
    }

    componentDidMount() {
      this.initializeData();
    }

    componentDidUpdate(prevProps: IDataProps) {
      if (prevProps !== this.props) {
        this.initializeData();
      }
      this.formRef.current?.resetFields();
    }

    initializeData() {
      const { query, entryId } = this.props;
      ipcRenderer.once('formDataQuery', (event, data) => this.setState({ initialValues: { ...data[0] } }));
      ipcRenderer.send('queryValues', query, [entryId], 'formDataQuery');
    }

    render() {
      const { closeModal } = this.props;
      const { initialValues } = this.state;
      return (
        <Comp data={initialValues} closeModal={closeModal} formRef={this.formRef} />
      );
    }
  }
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
    const { View } = this.props;
    ipcRenderer.once('tableViewQuery', (event, data) => {
      this.setState({ modal: <View key={entryId} data={data[0]} /> });
    });
    ipcRenderer.send('queryValues', this.props.queries.formQuery, [entryId], 'tableViewQuery');
  }

  handleAdd() {
    const { Form } = this.props;
    const FormWithFormRef = withFormRef(Form);
    this.setState({ 
      modal: <FormWithFormRef closeModal={this.closeModal} /> 
    });
  }

  handleEdit(entryId: string | number) {
    const { Form, queries } = this.props;
    const FormWithData = withData(Form);
    this.setState({
      modal: 
        <FormWithData key={entryId}
          query={queries.formQuery}
          entryId={entryId}
          closeModal={this.closeModal} />
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
        <Modal centered maskClosable width={1250} footer={null}
          bodyStyle={{ 
            paddingTop: 50, 
            paddingBottom: 20, 
            paddingLeft: 50,
            paddingRight: 50,
            maxHeight: '90vh', 
            overflowY: 'auto' 
          }}
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
