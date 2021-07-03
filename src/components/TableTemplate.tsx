import React, { Component, FunctionComponent, ComponentType, Fragment } from 'react';
import styled from 'styled-components';
import { Typography, Table, Input, Modal, message, Space, Button, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PlusOutlined } from '@ant-design/icons';
import { v4 as generateKey } from 'uuid';

import { simpleQuery, query } from '../utils/query';

import PageEffect from './PageEffect';
import Loading from './Loading';

const { Text } = Typography;
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
  extraDelete?: Array<string>
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
type TModal = TViewMode | TFormMode;

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

  async refreshTable() {
    const { tableQuery } = this.props.queries;
    const data = await simpleQuery(tableQuery) as Array<any>;
    const dataWithKeys = data.map((entry, i) => ({ key: i, ...entry }));
    this.setState({ tableData: dataWithKeys });
  }

  closeModal() {
    this.setState({ modal: null });
    this.refreshTable();
  }

  handleView(entryId: string | number, secondary: boolean) {
    const { queries } = this.props;
    const entryQuery = secondary ? queries.formQueryAlt : queries.formQuery;
    query(entryQuery!, [entryId])
    .then((data: any) => {
      const entry = data[0];
      this.setState({ 
        modal: {
          mode: "view",
          data: entry
        }
      });
    });
  }

  handleAdd() {
    this.setState({ 
      modal: { 
        mode: 'form' 
      }
    });
  }

  handleEdit(entry: Object) {
    const { primaryKey, secondaryKey } = this.props;
    this.setState({
      modal: {
        mode: 'form',
        entryId: entry[primaryKey] || entry[secondaryKey!],
        secondary: !entry[primaryKey]
      }
    });
  }

  handleDelete(entry: Object) {
    const { queries, primaryKey, secondaryKey, extraDelete } = this.props;
    const secondary = !entry[primaryKey];
    
    const deleteProcess = () => {
      const entryId = entry[primaryKey] || entry[secondaryKey!];
      const deleteQuery = secondary ? queries.deleteQueryAlt : queries.deleteQuery;
      query(deleteQuery!, [entryId])
      .then(() => {
        message.success(`Entry successfully deleted`);
        this.refreshTable();
      })
      .catch(e => message.success(e.message));
    }

    const extraProcess = async () => {
      for (const queryName of extraDelete!) {
        const queryString = queries[queryName as never];
        const entryId = secondaryKey ? entry[secondaryKey] : entry[primaryKey];
        await query(queryString, [entryId]);
      }
    }

    if (extraDelete) {
      extraProcess().then(deleteProcess);
    }
    else deleteProcess();
  }

  render() {
    const { View, Form, pageKey, primaryKey, secondaryKey, searchKey, extraData, width } = this.props;
    const { tableData, modal, search } = this.state;
    const processedData = extraData ? extraData(tableData) : tableData;

    const dataSource = processedData.filter((entry: Object) => (
      new RegExp(search, 'i').test(entry[searchKey || primaryKey])
    ));

    let modalComponent: JSX.Element | null = null;
    if (modal) {
      const { mode } = modal;
      const key = generateKey();
      if (View === undefined || mode === 'form') {
        const { entryId, secondary } = modal as never;
        modalComponent = (
          <Form key={key} entryId={entryId} secondary={secondary} closeModal={this.closeModal} />
        );
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
            this.handleEdit(entry); 
          }
          const onDelete: DeleteEvent = e => {
            e?.stopPropagation();
            const entry = processedData[rowIndex];
            this.handleDelete(entry);
          }
          return (
            <Space>
              <Button onClick={onEdit}>Edit</Button>
              <Popconfirm placement="left"
                title="Are you sure you would like to delete this entry?"
                onConfirm={onDelete} onCancel={e => e?.stopPropagation()}>
                <Button onClick={e => e.stopPropagation()}>Delete</Button>
              </Popconfirm>
            </Space>
          );
        }
      } 
    ];

    return (
      <Fragment>
        <PageEffect function={this.refreshTable} pageKey={pageKey} />
        {processedData.length > 0 ?
        <TemplateStyles>
          { /* TODO: Advanced Search features */ }
          <Search placeholder="Search" allowClear style={{ width: 300 }}
            onSearch={value => this.setState({ search: value })} />
          <div>
            <Text>Query returned {dataSource.length} results.</Text>
            <Button icon={<PlusOutlined />} onClick={this.handleAdd}>Add Record</Button> 
          </div>
          { /* TODO: Limit the table height; Add pagination. */ }
          <Table columns={columns} size='small' pagination={false}
            dataSource={dataSource} onRow={(record, rowIndex) => ({
              onClick: View && (e => {
                const key = record[primaryKey] || record[secondaryKey!];
                this.handleView(key, !record[primaryKey]);
              })
            })} />
        </TemplateStyles> : <Loading />
        }
        <Modal centered maskClosable width={width || 1250} footer={null}
          visible={modal !== null} onCancel={this.closeModal} bodyStyle={ModalStyles}>
          {modalComponent}
        </Modal>
      </Fragment>
    );
  }
}

export { IViewProps, IFormProps };
export default Template;

const TemplateStyles = styled.div`
  background-color: #fff;
  padding: 20px;
  text-align: right;

  > span:first-child {
    margin-bottom: 10px;
  }

  > div:first-of-type {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    > span:first-child {
      color: #999;
      font-size: 12px;
    }
  }

  tbody > tr:hover {
    cursor: pointer;
  }
`;

const ModalStyles: React.CSSProperties = { 
  paddingTop: 30, 
  paddingBottom: 20, 
  paddingLeft: 50,
  paddingRight: 50,
  maxHeight: '90vh', 
  overflowY: 'auto' 
}