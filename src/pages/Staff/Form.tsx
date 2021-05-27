import React, { Component, createRef } from 'react';
import { ipcRenderer, remote } from 'electron';
import styled from 'styled-components';
import { 
  FormInstance, Switch, DatePicker, Divider, Input, Select, 
  Form as AntForm, Button, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Store } from 'antd/lib/form/interface';

import { query, simpleQuery } from '../../utils/query';
import scrollToTop from '../../utils/scrollModal';
import { objectMomentToDates, objectDatesToMoment } from '../../utils/momentConverter';
import isEmpty from '../../utils/isEmptyObject';
import fillEmptyValues from '../../utils/objectNulling';
import { urlFromPath, bufferFromPath } from '../../utils/images';

import Loading from '../../components/Loading';

import { staff, staffGroup } from '../../Queries.json';
const { formQuery, insertQuery, updateQuery } = staff;
const { tableQuery: staffGroupQuery } = staffGroup;

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
  initialValues: Store,
  image: string | null
  staffGroups: Array<IStaffGroup>
}

function checkImage(file: any) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload a JPG/PNG file');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 8;
  if (!isLt2M) {
    message.error('Image must smaller than 8MB');
    return false;
  }
  return true;
}

class Form extends Component<IFormProps, IFormState> {
  formRef: React.RefObject<FormInstance>;

  constructor(props: IFormProps) {
    super(props);
    this.state = {
      initialValues: {},
      image: null,
      staffGroups: []
    }
    this.initializeData();
    this.formRef = createRef();

    this.initializeData = this.initializeData.bind(this);
    this.handleImage = this.handleImage.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async initializeData() {
    const { staffId } = this.props;
    const staffGroups = await simpleQuery(staffGroupQuery) as Array<any>;
    if (staffId) {
      // Initialize 'edit' form values.
      const data = await query(formQuery, [staffId]) as Array<any>;
      const entry = data[0];
      this.setState({ 
        initialValues: entry,
        staffGroups
      });
      this.formRef.current?.resetFields();
    }
    else {
      // Initialize 'add' form values. Normally this would be blank.
      this.setState({ 
        initialValues: { status: true },
        staffGroups
      });
      this.formRef.current?.resetFields();
    }
  }

  async handleImage() {
    const currentWindow = remote.getCurrentWindow();
    const options: Electron.OpenDialogOptions = { 
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }]
    };
    const file = await remote.dialog.showOpenDialog(currentWindow, options);
    if (!file.canceled) {
      const imagePath = file.filePaths[0];
      this.setState({ image: imagePath });
    }
  }

  handleSubmit(values: any) {
    const { staffId, closeModal } = this.props;
    const { image } = this.state;
    
    const formValues = fillEmptyValues(values);
    const formattedValues = objectMomentToDates(formValues);

    const encryptedPassword = ipcRenderer.sendSync('encrypt', values.pwd);
    const { cipherText, initializeVector, salt } = encryptedPassword;

    const finalizedValues = { 
      ...formattedValues, 
      pwd: cipherText,
      pwd_iv: initializeVector,
      pwd_salt: salt,
      image: image ? bufferFromPath(image) : null
    };
    const rawValues = Object.values(finalizedValues);

    if (staffId) {
      // Edit form on submit.
      query(updateQuery, [...rawValues, staffId])
      .then(() => {
        message.success(`Staff '${staffId}' successfully updated`);
        closeModal();
      });
    }
    else {
      // Add form on submit.
      query(insertQuery, rawValues)
      .then(() => {
        message.success('Staff successfully added');
        closeModal();
      });
    }
  }
  
  render() {
    const { staffId } = this.props;
    const { initialValues: data, image } = this.state;
    const initialData = objectDatesToMoment(data);

    const uploadButton = (
      <Button type='dashed' onClick={this.handleImage}>
        <PlusOutlined />
        <div>Upload</div>
      </Button>
    );

    const isLoading = staffId ? isEmpty(data) : false;
    return isLoading ? <Loading /> : (
      <FormStyles ref={this.formRef} labelCol={{ span: 5 }}
        onFinish={this.handleSubmit} onFinishFailed={scrollToTop}
        initialValues={initialData}>
        <Title level={4}>Account Details</Title>
        <UploadStyles label="Profile Picture">
          {image ? <img src={urlFromPath(image)} alt="Avatar" /> : uploadButton}
        </UploadStyles>
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

const UploadStyles = styled(Item)`
  .ant-form-item-control-input-content > * {
    width: 128px;
    height: 128px;
  }
`;