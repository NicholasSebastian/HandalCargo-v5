import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Button, Modal, Input, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { v4 as generateKey } from 'uuid';

import { query, simpleQuery } from '../utils/query';

import PageEffect from './PageEffect';
import Form, { IFormItem } from './ListTemplateForm';

const { Item } = List;
const { Search } = Input;

interface IListEntry {
  id: string | number
  name: string
  extra?: string
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
  modal: TModal | null
}

interface IFormData {
  entryId?: string | number
}

type TModal = IFormData & { key?: string | number };

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

  async refreshList() {
    const { tableQuery } = this.props.queries;
    const data = await simpleQuery(tableQuery) as Array<any>;
    const formattedData = data.map((obj: Object): IListEntry => {
      const [id, name, extra] = Object.values(obj);
      return { id, name, extra };
    })
    const sortedData = formattedData.sort((first: IListEntry, second: IListEntry) => {
      return (first.id as number) - (second.id as number);
    })
    this.setState({ listData: sortedData });
  }

  closeModal() {
    this.setState({ modal: null });
    this.refreshList();
  }

  handleAdd() {
    this.setState({ 
      modal: {} 
    });
  }

  handleEdit(entryId: string | number) {
    this.setState({ 
      modal: {
        key: generateKey(),
        entryId
      }
    });
  }

  handleDelete(entryId: string | number) {
    const { deleteQuery } = this.props.queries;
    query(deleteQuery, [entryId])
    .then(() => {
      message.success(`Entry successfully deleted`);
      this.refreshList();
    })
    .catch(e => message.error(e.message));
  }

  render() {
    const { queries, formItems } = this.props;
    
    let modalComponent: JSX.Element | null = null;
    if (this.state.modal) {
      modalComponent = 
        <Form {...this.state.modal} 
          closeModal={this.closeModal} 
          queries={queries} 
          formItems={formItems} />
    }

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
            renderItem={entry => (
              new RegExp(this.state.search, 'i').test(entry.name) && (
                <Item actions={[
                  <Button onClick={() => this.handleEdit(entry.id)}>Edit</Button>,
                  <Popconfirm placement='left'
                    title="Are you sure you would like to delete this entry?"
                    onConfirm={e => {
                      e?.stopPropagation();
                      this.handleDelete(entry.id);
                    }}
                    onCancel={e => e?.stopPropagation()}>
                    <Button onClick={e => e.stopPropagation()}>Delete</Button>
                  </Popconfirm>
                ]}>
                  <ItemStyles>
                    <div>{entry.id}</div>
                    <div>{entry.name}</div>
                    {entry.extra && <div>{entry.extra}</div>}
                  </ItemStyles>
                </Item>
              )
            )} />
        </TemplateStyles>
        <Modal centered maskClosable width={600} footer={null}
          bodyStyle={{ paddingTop: 55 }}
          visible={this.state.modal !== null}
          onCancel={this.closeModal}>
          {modalComponent}
        </Modal>
      </>
    );
  }
}

export { IQueries, IFormData };
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
