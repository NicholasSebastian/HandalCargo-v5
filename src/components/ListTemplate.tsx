import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { List, Button, Modal, Input, Form as AntForm, message, FormInstance, InputNumber, Popconfirm } from 'antd';
import { Store } from 'antd/lib/form/interface';
import { PlusOutlined } from '@ant-design/icons';

import PageEffect from './PageEffect';

const { Item } = List;
const { Search } = Input;

interface IListEntry {
  id: string | number
  name: string
  extra?: string
}

interface IFormItem {
  label: string
  key: string
}

interface IQueries {
  tableQuery: string
  formQuery: string
  insertQuery: string
  updateQuery: string
  deleteQuery: string
}

interface ITemplateProps {
  pageKey: string
  queries: IQueries
  formItems: Array<IFormItem>
}

interface ITemplateState {
  listData: Array<IListEntry>
  search: string
  modal: JSX.Element | null
}

interface IFormProps {
  closeModal: () => void
  entryId?: string | number
  queries: IQueries
  formItems: Array<IFormItem>
}

interface IFormState {
  initialValues: Store
}

class Form extends Component<IFormProps, IFormState> {
  formRef: React.RefObject<FormInstance>;

  constructor(props: IFormProps) {
    super(props);
    this.state = {
      initialValues: {}
    };
    this.formRef = createRef();
    this.initializeData = this.initializeData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.initializeData();
  }

  componentDidUpdate(prevProps: IFormProps) {
    if (this.props.entryId !== prevProps.entryId) {
      this.initializeData();
    }
    this.formRef.current?.resetFields();
  }

  initializeData() {
    if (this.props.entryId) {
      // Initialize 'edit' form values.
      ipcRenderer.once('listFormQuery', (event, data) => this.setState({ initialValues: { ...data[0] } }));
      ipcRenderer.send('queryValues', this.props.queries.formQuery, [this.props.entryId], 'listFormQuery');
    }
    else {
      // Initialize 'add' form values; Clear the fields.
      this.setState({ initialValues: {} });
    }
  }

  handleSubmit(values: any) {
    const rawValues = Object.values(values);
    if (this.props.entryId) {
      // Edit form on submit.
      ipcRenderer.once('listUpdateQuery', () => {
        message.success(`'${rawValues[1]}' successfully updated`);
        this.props.closeModal();
      });
      ipcRenderer.send('queryValues', this.props.queries.updateQuery, [...rawValues, this.props.entryId], 'listUpdateQuery');
    }
    else {
      // Add form on submit.
      ipcRenderer.once('listInsertQuery', () => {
        message.success('Entry successfully added');
        this.props.closeModal();
      });
      ipcRenderer.send('queryValues', this.props.queries.insertQuery, rawValues, 'listInsertQuery');
    }
  }

  render() {
    const { Item } = AntForm;
    return (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} initialValues={this.state.initialValues}>
        <Item label={this.props.formItems[0].label} name={this.props.formItems[0].key}
          rules={[{ required: true, message: `${this.props.formItems[0].label} is required` }]}>
          <InputNumber min={0} />
        </Item>
        <Item label={this.props.formItems[1].label} name={this.props.formItems[1].key}
          rules={[{ required: true, message: `${this.props.formItems[1].label} is required` }]}>
          <Input />
        </Item>
        {this.props.formItems[2] &&
          <Item label={this.props.formItems[2].label} name={this.props.formItems[2].key}>
            <Input />
          </Item>
        }
        <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
      </FormStyles>
    );
  }
}

class Template extends Component<ITemplateProps, ITemplateState> {
  constructor(props: ITemplateProps) {
    super(props);
    this.state = {
      listData: [],
      search: '',
      modal: null
    };
    this.refreshList = this.refreshList.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  refreshList() {
    ipcRenderer.once('listQuery', (event, data) => {
      this.setState({ listData: data
        .map((obj: Object): IListEntry => {
          const arrayForm = Object.values(obj);
          return {
            id: arrayForm[0],
            name: arrayForm[1],
            extra: arrayForm[2]
          }
        })
        .sort((first: IListEntry, second: IListEntry) => {
          return (first.id as number) - (second.id as number);
        })
      });
    });
    ipcRenderer.send('query', this.props.queries.tableQuery, 'listQuery');
  }

  closeModal() {
    this.setState({ modal: null });
    this.refreshList();
  }

  handleAdd() {
    this.setState({ 
      modal: 
        <Form closeModal={this.closeModal} 
          queries={this.props.queries} 
          formItems={this.props.formItems} /> 
    });
  }

  handleEdit(entryId: string | number) {
    this.setState({ 
      modal: 
        <Form key={entryId}
          closeModal={this.closeModal} 
          queries={this.props.queries} 
          formItems={this.props.formItems} 
          entryId={entryId} /> 
    });
  }

  handleDelete(entryId: string | number) {
    ipcRenderer.once('listDeleteQuery', () => {
      message.success(`Entry successfully deleted`);
      this.refreshList();
    });
    ipcRenderer.send('queryValues', this.props.queries.deleteQuery, [entryId], 'listDeleteQuery');
  }

  render() {
    return (
      <>
        <PageEffect function={this.refreshList} pageKey={this.props.pageKey} />
        <TemplateStyles>
          <div>
            <Search placeholder="Search" allowClear
              style={{ width: 300 }}
              onSearch={value => this.setState({ search: value })} />
          </div>
          <Button block type="dashed" onClick={this.handleAdd} icon={<PlusOutlined />}>Add</Button>
          <List size="small"
            loading={this.state.listData.length === 0}
            dataSource={this.state.listData}
            renderItem={entry => {
              return new RegExp(this.state.search, 'i').test(entry.name) && (
                <Item actions={[
                  <Button onClick={() => this.handleEdit(entry.id)}>Edit</Button>,
                  <Popconfirm placement='left'
                    title="Are you sure you would like to delete this entry?"
                    onConfirm={() => this.handleDelete(entry.id)}>
                    <Button>Delete</Button>
                  </Popconfirm>
                ]}>
                  <ItemStyles>
                    <div>{entry.id}</div>
                    <div>{entry.name}</div>
                    {entry.extra && <div>{entry.extra}</div>}
                  </ItemStyles>
                </Item>
              );
            }} />
        </TemplateStyles>
        <Modal centered maskClosable width={600} footer={null}
          bodyStyle={{ paddingTop: 55 }}
          visible={this.state.modal !== null}
          onCancel={this.closeModal}>
          {this.state.modal}
        </Modal>
      </>
    );
  }
}

export default Template;

const TemplateStyles = styled.div`
  background-color: #fff;
  padding: 20px;

  > div:first-child {
    text-align: right;
    margin-bottom: 20px;
  }

  > button:first-of-type {
    margin-bottom: 5px;
  }
`;

const ItemStyles = styled.div`
  display: flex;
  
  > div:first-child {
    width: 100px;
  }

  > div:nth-child(2) {
    font-weight: 500;
  }

  > div:not(:first-child) {
    width: 200px;
  }
`;

const FormStyles = styled(AntForm)`
  width: 500px;
  margin: 0 auto;

  > div:last-child {
    text-align: right;
  }
`;
