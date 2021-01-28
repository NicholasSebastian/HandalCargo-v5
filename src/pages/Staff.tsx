import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { 
  Card, Avatar, Typography, Space, Modal, Button, Form as AntForm, 
  Input, Select, Switch, DatePicker, Divider, message, Spin, FormInstance 
} from 'antd';
import { Store } from 'antd/lib/form/interface';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';

import { staff, staffGroup } from '../Queries.json';
const { tableQuery, viewQuery, formQuery, updateQuery, deleteQuery } = staff;

import PageEffect from '../components/PageEffect';
import ProfileView from '../components/ProfileTemplate';

const { Meta } = Card;
const { Text } = Typography;
const { Item } = AntForm;
const { Password } = Input;
const { Option } = Select;

interface IStaffTableInfo {
  staffid: string
  staffname: string
  groupname: string
  phonenum: string
  status: boolean
}

interface IStaffGroup {
  stfgrcode: number
  groupname: string
}

interface IStaffState {
  tableData: Array<IStaffTableInfo>
  modal: JSX.Element | null
}

interface IFormProps {
  staffId?: string
}

interface IFormState {
  initialValues: Store
  staffGroups: Array<IStaffGroup>
}

class Form extends Component<IFormProps, IFormState> {
  formRef: React.RefObject<FormInstance>;

  constructor(props: IFormProps) {
    super(props);
    this.state = {
      initialValues: {},
      staffGroups: []
    }
    this.formRef = createRef();
    this.initializeData = this.initializeData.bind(this);
  }

  componentDidMount() {
    this.initializeData();

    // Initialize staff group values for dropdown options.
    ipcRenderer.once('staffForm_staffGroupQuery', (event, data) => this.setState({ staffGroups: data }));
    ipcRenderer.send('query', staffGroup.tableQuery, 'staffForm_staffGroupQuery');
  }

  componentDidUpdate(prevProps: IFormProps) {
    if (this.props.staffId !== prevProps.staffId) {
      this.initializeData();
    }
    this.formRef.current?.resetFields();
  }

  initializeData() {
    if (this.props.staffId) {
      // Initialize 'edit' form values.
      ipcRenderer.once('staffFormQuery', (event, data) => this.setState({ initialValues: { ...data[0] } }));
      ipcRenderer.send('queryValues', formQuery, [this.props.staffId], 'staffFormQuery');
    }
    else {
      // Initialize 'add' form values. Normally this would be blank.
      this.setState({ initialValues: { status: true } });
    }
  }

  handleSubmit(values: any) {
    console.table(values); // TODO: handle submit according to 'add' or 'edit'
    Modal.destroyAll(); // TODO: this doesn't work. figure out a way to programmatically close the modal.
  }
  
  render() {
    return (
      <FormStyles ref={this.formRef} labelCol={{ span: 5 }}
        onFinish={this.handleSubmit} initialValues={this.state.initialValues}>
        <Item label="Username" name="staffid" 
          rules={[{ required: true, message: 'Username is required' }]}>
          <Input />
        </Item>
        <Item label="Password" name="pwd" 
          rules={[{ required: true, message: 'Password is required' }]}>
          <Password />
        </Item>
        <Item label="Access Level" name="level" 
          rules={[{ required: true, message: 'Access Level is required' }]}>
          <Select>
            <Option value={1}>Employee</Option>
            <Option value={2}>Manager</Option>
            <Option value={3}>Master</Option>
          </Select>
        </Item>
        <Item label="Status" name="status" valuePropName="checked">
          <Switch defaultChecked />
        </Item>
        <Divider />
        <Item label="Full Name" name="staffname" 
          rules={[{ required: true, message: 'Name is required' }]}>
          <Input />
        </Item>
        <Item label="Gender" name="gender" 
          rules={[{ required: true, message: 'Gender is required' }]}>
          <Select>
            <Option value={1}>Male</Option>
            <Option value={0}>Female</Option>
          </Select>
        </Item>
        <Item label="Place of Birth" name="placeofbirth">
          <Input />
        </Item>
        <Item label="Date of Birth" name="dateofbirth">
          <DatePicker />
        </Item>
        <Divider />
        <Item label="Job Category" name="groupcode" 
          rules={[{ required: true, message: 'Staff Group is required' }]}>
          <Select>
            {this.state.staffGroups.map(group => (
              <Option key={group.stfgrcode} value={group.stfgrcode}>{group.groupname}</Option>
            ))}
          </Select>
        </Item>
        <Item label="Employment Date" name="dateofemployment">
          <DatePicker />
        </Item>
        <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
      </FormStyles>
    );
  }
}

class Staff extends Component<{}, IStaffState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      tableData: [],
      modal: null
    }
    this.handleAdd = this.handleAdd.bind(this);
    this.handleView = this.handleView.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  refreshTable() {
    ipcRenderer.once('staffTableQuery', (event, data) => this.setState({ tableData: data }));
    ipcRenderer.send('query', tableQuery, 'staffTableQuery');
    console.log('Staff Table Refreshed');
  }

  handleAdd() {
    this.setState({ modal: <Form /> });
  }

  handleView(staffId: string) {
    ipcRenderer.once('staffViewQuery', (event, data) => {
      this.setState({ modal: <ProfileView profile={data[0]} />});
    });
    ipcRenderer.send('queryValues', viewQuery, [staffId], 'staffViewQuery');
  }

  handleEdit(staffId: string) {
    this.setState({ modal: <Form staffId={staffId} /> });
  }

  handleDelete(staffId: string) {
    ipcRenderer.once('staffDeleteQuery', () => {
      message.success(`Staff '${staffId}' successfully deleted`);
      this.refreshTable();
    });
    ipcRenderer.send('queryValues', deleteQuery, [staffId], 'staffDeleteQuery');
  }

  render() {
    return (
      <>
        <PageEffect function={() => this.refreshTable()} pageKey='staff' />
        {this.state.tableData.length > 0 ?
        <StaffStyles>
          <Button type="dashed" style={{ height: '100%' }} onClick={this.handleAdd}>Add Staff</Button>
          {this.state.tableData.map(staff => (
            <Card key={staff.staffid} hoverable 
              onClick={() => this.handleView(staff.staffid)} 
              actions={[
                <EditOutlined onClick={e => { e.stopPropagation(); this.handleEdit(staff.staffid); }}>Edit</EditOutlined>,
                <DeleteOutlined onClick={e => { e.stopPropagation(); this.handleDelete(staff.staffid); }}>Delete</DeleteOutlined>
              ]}>
              <Meta
                avatar={<Avatar size={64} shape="square" icon={<UserOutlined />} /* TODO: images */ />}
                title={staff.staffname}
                description={
                  <Space direction='vertical' size={2}>
                    <Text>{staff.staffid}</Text>
                    <Text>{staff.groupname}</Text>
                    <Text>{staff.status}</Text>
                    <Text>{staff.phonenum}</Text>
                  </Space>
                } />
            </Card>
          ))}
        </StaffStyles> :
        <Center><Spin size='large'/></Center>
        }
        <Modal centered maskClosable width={900} footer={null}
          bodyStyle={{ paddingTop: 45, maxHeight: '90vh', overflowY: 'auto' }}
          visible={this.state.modal !== null} 
          onCancel={() => this.setState({ modal: null })}>
          {this.state.modal}
        </Modal>
      </>
    );
  }
}

export default Staff;

const StaffStyles = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(300px, 1fr));
  gap: 20px;
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormStyles = styled(AntForm)`
  width: 700px;
  margin: 0 auto 5px auto;

  > div:last-child {
    text-align: right;
  }
`;
