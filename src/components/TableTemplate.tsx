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
  formQueryAlt?: string
  deleteQuery: string
  deleteQueryAlt?: string
}

interface ITemplateProps {
  pageKey: string
  primaryKey: string
  secondaryKey?: string
  searchKey?: string
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
  secondary?: boolean
}

interface IFormProps extends IFormData {
  closeModal: () => void
}

type TViewMode = { mode: "view" } & IViewProps;
type TFormMode = { mode: "form" } & IFormData;
type TModal = (TViewMode | TFormMode) & { key?: string | number };

type EditEvent = React.MouseEventHandler<HTMLElement>;
type DeleteEvent = (e?: React.MouseEvent<HTMLElement, MouseEvent> | undefined) => void;

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
    const { queries } = this.props;
    ipcRenderer.once('tableQuery', (event, data: Array<Object>) => {
      this.setState({ 
        tableData: data.map((entry, i) => ({ key: i, ...entry }))
      });
    });
    ipcRenderer.send('query', queries.tableQuery, 'tableQuery');
  }

  closeModal() {
    this.setState({ modal: null });
    this.refreshTable();
  }

  handleView(entryId: string | number, secondary: boolean) {
    const { queries } = this.props;
    const query = secondary ? queries.formQueryAlt : queries.formQuery;
    ipcRenderer.once('tableViewQuery', (event, data) => {
      this.setState({ 
        modal: {
          mode: "view",
          key: instanceOfKey(entryId),
          data: data[0]
        }
      });
    });
    ipcRenderer.send('queryValues', query, [entryId], 'tableViewQuery');
  }

  handleAdd() {
    this.setState({ 
      modal: { 
        mode: 'form' 
      }
    });
  }

  handleEdit(entryId: string | number, secondary: boolean) {
    this.setState({
      modal: {
        mode: 'form',
        key: instanceOfKey(entryId),
        entryId,
        secondary
      }
    });
  }

  handleDelete(entryId: string | number, secondary: boolean) {
    const { queries } = this.props;
    const query = secondary ? queries.deleteQueryAlt : queries.deleteQuery;
    ipcRenderer.once('tableDeleteQuery', () => {
      message.success(`Entry successfully deleted`);
      this.refreshTable();
    });
    ipcRenderer.send('queryValues', query, [entryId], 'tableDeleteQuery');
  }

  render() {
    const { View, Form, pageKey, primaryKey, secondaryKey, searchKey, extraData, width } = this.props;
    const { tableData, modal, search } = this.state;
    const processedData = extraData ? extraData(tableData) : tableData;

    let modalComponent: JSX.Element | null = null;
    if (modal) {
      const { key, mode } = modal;
      if (View === undefined || mode === 'form') {
        const { entryId, secondary } = modal as never;
        modalComponent = <Form key={key} entryId={entryId} secondary={secondary} closeModal={this.closeModal} />
      }
      else if (mode === 'view') {
        const { data } = modal as never;
        modalComponent = <View key={key} data={data} />
      }
    }

    const columns = [ 
      ...this.props.columns, 
      {
        dataIndex: 'key',
        render: (rowIndex: number) => {
          const onEdit: EditEvent = e => { 
            e.stopPropagation(); 
            const entry = processedData[rowIndex];
            const key = entry[primaryKey] || entry[secondaryKey!];
            this.handleEdit(key, !entry[primaryKey]); 
          }
          const onDelete: DeleteEvent = e => {
            e?.stopPropagation(); 
            const entry = processedData[rowIndex];
            const key = entry[primaryKey] || entry[secondaryKey!];
            this.handleDelete(key, !entry[primaryKey]);
          }
          return (
            <Space>
              <Button onClick={onEdit}>Edit</Button>
              <Popconfirm placement="left"
                title="Are you sure you would like to delete this entry?"
                onConfirm={onDelete}>
                <Button onClick={e => e.stopPropagation()}>Delete</Button>
              </Popconfirm>
            </Space>
          );
        }
      } 
    ];

    return (
      <>
        <PageEffect function={this.refreshTable} pageKey={pageKey} />
        {processedData.length > 0 ?
        <TemplateStyles>
          <Search placeholder="Search" allowClear style={{ width: 300 }}
            onSearch={value => this.setState({ search: value })} />
          <br />
          <Button icon={<PlusOutlined />} onClick={this.handleAdd}>Add Record</Button> 
          <Table columns={columns} size='small' pagination={false}
            dataSource={processedData.filter((entry: Object) => (
              new RegExp(search, 'i').test(entry[searchKey || primaryKey])
            ))}
            onRow={(record, rowIndex) => ({
              onClick: View && (e => {
                const key = record[primaryKey] || record[secondaryKey!];
                this.handleView(key, !record[primaryKey]);
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
