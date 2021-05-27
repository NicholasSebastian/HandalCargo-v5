import React, { Component } from 'react';
import styled from 'styled-components';
import { 
  Card, Avatar, Typography, Space, Modal, Button, message, Popconfirm
} from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { v4 as generateKey } from 'uuid';

import { query, simpleQuery } from '../../utils/query';
import { urlFromBuffer } from '../../utils/images';

import PageEffect from '../../components/PageEffect';
import Loading from '../../components/Loading';
import ProfileView, { ITemplateData as IViewData } from '../../components/ProfileTemplate';
import Form, { IFormData } from './Form';

import { staff } from '../../Queries.json';
const { tableQuery, viewQuery, deleteQuery } = staff;

const { Meta } = Card;
const { Text } = Typography;

interface IStaffTableInfo {
  staffid: string
  staffname: string
  groupname: string
  phonenum: string
  status: boolean
  image: Uint8Array
}

interface IStaffState {
  tableData: Array<IStaffTableInfo>
  modal: TModal | null
}

type TViewMode = { mode: 'view' } & IViewData;
type TFormMode = { mode: 'form' } & IFormData;
type TModal = (TViewMode | TFormMode) & { key?: string | number };

class Staff extends Component<{}, IStaffState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      tableData: [],
      modal: null
    }
    this.refreshTable = this.refreshTable.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleView = this.handleView.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  async refreshTable() {
    const data = await simpleQuery(tableQuery) as Array<IStaffTableInfo>;
    this.setState({ tableData: data });
  }

  closeModal() {
    this.setState({ modal: null });
    this.refreshTable();
  }

  handleView(staffId: string) {
    query(viewQuery, [staffId])
    .then((data: any) => {
      this.setState({ 
        modal: {
          mode: 'view',
          key: generateKey(),
          profile: data[0]
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

  handleEdit(staffId: string) {
    this.setState({ 
      modal: {
        mode: 'form',
        key: generateKey(),
        staffId
      } 
    });
  }

  handleDelete(staffId: string) {
    query(deleteQuery, [staffId])
    .then(() => {
      message.success(`Staff '${staffId}' successfully deleted`);
      this.refreshTable();
    });
  }

  render() {
    const { tableData, modal } = this.state;

    const active = <span style={{ color: 'green' }}>Active</span>
    const inactive = <span style={{ color: 'red' }}>Inactive</span>

    let modalComponent: JSX.Element | null = null;
    if (modal) {
      const { key } = modal;
      switch (modal.mode) {
        case 'view':
          const { profile } = modal; 
          modalComponent = <ProfileView key={key} profile={profile} showSalary />
          break;
        case 'form':
          const { staffId } = modal;
          modalComponent = <Form key={key} staffId={staffId} closeModal={this.closeModal} />
          break;
      }
    }

    return (
      <>
        <PageEffect function={() => this.refreshTable()} pageKey='staff' />
        {tableData.length > 0 ?
        <StaffStyles>
          <Button type="dashed" style={{ height: '100%' }} onClick={this.handleAdd}>Add Staff</Button>
          {tableData.map(staff => (
            <Card key={staff.staffid} hoverable 
              onClick={() => this.handleView(staff.staffid)} 
              actions={[
                <EditOutlined onClick={e => { e.stopPropagation(); this.handleEdit(staff.staffid); }}>Edit</EditOutlined>,
                <Popconfirm title="Are you sure you would like to delete this user?"
                  onConfirm={e => { e?.stopPropagation(); this.handleDelete(staff.staffid) }}
                  onCancel={e => e?.stopPropagation()}>
                  <DeleteOutlined onClick={e => e.stopPropagation()}>Delete</DeleteOutlined>
                </Popconfirm>
              ]}>
              <Meta avatar={<Avatar size={64} shape="square" 
                icon={staff.image ? <img src={urlFromBuffer(staff.image)} /> : <UserOutlined />} />}
                title={staff.staffname}
                description={
                  <Space direction='vertical' size={2}>
                    <Text>{staff.staffid}</Text>
                    <Text>{staff.groupname}</Text>
                    <Text>{staff.status ? active : inactive}</Text>
                    <Text>{staff.phonenum || 'No Phone Number'}</Text>
                  </Space>
                } />
            </Card>
          ))}
        </StaffStyles> :
        <Loading />
        }
        <Modal centered maskClosable width={modal?.mode === 'view' ? 1200 : 900} footer={null}
          bodyStyle={{ paddingTop: 45, maxHeight: '90vh', overflowY: 'auto' }}
          visible={modal !== null} 
          onCancel={this.closeModal}>
          {modalComponent}
        </Modal>
      </>
    );
  }
}

export default Staff;

const StaffStyles = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(300px, 1fr));
  gap: 20px;

  @media (min-width: 1600px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;
