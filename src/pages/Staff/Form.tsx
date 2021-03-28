import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { 
  FormInstance, Switch, DatePicker, Divider, Input, Select, 
  Form as AntForm, Button, Typography, message } from 'antd';
import { Store } from 'antd/lib/form/interface';

import scrollToTop from '../../utils/scrollModal';

import { staff, staffGroup } from '../../Queries.json';
const { formQuery, insertQuery, updateQuery } = staff;

const { Title } = Typography;
const { Item } = AntForm;
const { Password, TextArea } = Input;
const { Option } = Select;

interface IStaffGroup {
  stfgrcode: number
  groupname: string
}

interface IFormData {
  staffId?: string
}

interface IFormProps extends IFormData {
  closeModal: () => void
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
    this.initializeData();

    this.formRef = createRef();

    this.initializeData = this.initializeData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  initializeData() {
    ipcRenderer.once('staffForm_staffGroupQuery', (event, staffGroups) => {
      const { staffId } = this.props;
      if (staffId) {
        // Initialize 'edit' form values.
        ipcRenderer.once('staffFormQuery', (event, data) => {
          this.setState({ 
            initialValues: data[0],
            staffGroups
          });
          this.formRef.current?.resetFields();
        });
        ipcRenderer.send('queryValues', formQuery, [staffId], 'staffFormQuery');
      }
      else {
        // Initialize 'add' form values. Normally this would be blank.
        this.setState({ 
          initialValues: { status: true },
          staffGroups
        });
        this.formRef.current?.resetFields();
      }
    });
    ipcRenderer.send('query', staffGroup.tableQuery, 'staffForm_staffGroupQuery');
  }

  handleSubmit(values: any) {
    const { staffId, closeModal } = this.props;
    const encryptedPassword = ipcRenderer.sendSync('encrypt', values.pwd);
    const finalizedValues = { 
      ...values, 
      pwd: encryptedPassword.cipherText,
      pwd_iv: encryptedPassword.initializeVector,
      pwd_salt: encryptedPassword.salt,
      profilepic: null,                   // TODO: Images
      profilepic_type: null
    };
    const rawValues = Object.values(finalizedValues).map(value => value || null);

    if (staffId) {
      // Edit form on submit.
      ipcRenderer.once('staffUpdateQuery', () => message.success(`Staff '${staffId}' successfully updated`));
      ipcRenderer.send('queryValues', updateQuery, [...rawValues, staffId], 'staffUpdateQuery');
    }
    else {
      // Add form on submit.
      ipcRenderer.once('staffInsertQuery', () => message.success('Staff successfully added'));
      ipcRenderer.send('queryValues', insertQuery, rawValues, 'staffInsertQuery');
    }
    closeModal();
  }
  
  render() {
    const { initialValues } = this.state;
    return (
      <FormStyles ref={this.formRef} labelCol={{ span: 5 }}
        onFinish={this.handleSubmit} onFinishFailed={scrollToTop}
        initialValues={initialValues}>
        <Title level={4}>Account Details</Title>
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
        <Title level={4}>Personal Information</Title>
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
        <Item label="Phone Number" name="phonenum">
          <Input />
        </Item>
        <Item label="Address" name="address1">
          <TextArea autoSize={{ minRows: 2 }} />
        </Item>
        <Item label="District" name="district">
          <Input />
        </Item>
        <Item label="City" name="city">
          <Input />
        </Item>
        <Item label="Place of Birth" name="placeofbirth">
          <Input />
        </Item>
        <Item label="Date of Birth" name="dateofbirth">
          <DatePicker />
        </Item>
        <Divider />
        <Title level={4}>Work Details</Title>
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
        <Divider />
        <Title level={4}>Salary Details</Title>
        <Item label="Salary" name="salary">
          <Input />
        </Item>
        <Item label="Overtime Pay" name="othr">
          <Input />
        </Item>
        <Item label="Meal Allowance" name="foodallowance">
          <Input />
        </Item>
        <Item label="Bonus" name="bonus">
          <Input />
        </Item>
        <Item label="Extra Bonus" name="dilligencebonus">
          <Input />
        </Item>
        <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
      </FormStyles>
    );
  }
}

export { IFormData };
export default Form;

const FormStyles = styled(AntForm)`
  width: 700px;
  margin: 0 auto 5px auto;

  .ant-form-item {
    margin-bottom: 16px;
  }

  > h4 {
    margin-bottom: 20px;
  }

  > div:last-child {
    text-align: right;
  }
`;