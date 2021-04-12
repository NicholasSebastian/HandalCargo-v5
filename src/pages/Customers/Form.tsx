import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Typography, FormInstance, Form as AntForm, Button, Input, Select, Switch, Divider, message } from 'antd';
import { Store } from 'antd/lib/form/interface';

import { IFormProps } from '../../components/TableTemplate';
import Loading from '../../components/Loading';
import MarkingTable from './MarkingTable';
import ItemTable from './ItemTable';

import { objectDatesToMoment, objectMomentToDates } from '../../utils/momentConverter';
import fillEmptyValues from '../../utils/objectNulling';
import scrollToTop from '../../utils/scrollModal';
import isEmpty from '../../utils/isEmptyObject';

import { customers, expedition } from '../../Queries.json';
const { 
  formQuery, formQueryAlt, insertQuery, updateQuery, 
  markingTableQuery: markingQuery, itemTableQuery: itemQuery 
} = customers;
const { tableQuery: expeditionQuery } = expedition;

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface IFormState {
  initialData: Store
  markingData: Array<any>
  itemData: Array<any>
  expeditions: Array<any>
}

class Form extends Component<IFormProps, IFormState> {
  formRef: React.RefObject<FormInstance>;

  constructor(props: IFormProps) {
    super(props);
    this.state = {
      initialData: {},
      markingData: [],
      itemData: [],
      expeditions: []
    };

    this.formRef = createRef();
    this.initializeData = this.initializeData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.initializeData();
  }

  initializeData() {
    const { entryId, secondary } = this.props;
    const query = secondary ? formQueryAlt : formQuery;
    ipcRenderer.once('expeditionsQuery', (event, expeditions) => {
      if (entryId) {
        // Initialize 'edit' form values.
        ipcRenderer.once('customersFormQuery', (event, data) => {
          const entry = data[0];
          const customerId = secondary ? entryId : entry.customerid;
          ipcRenderer.once('customersMarkingQuery', (event, markingData) => {
            ipcRenderer.once('customersItemQuery', (event, itemData) => {
              this.setState({
                initialData: entry,
                markingData: markingData.map((marking: object, i: number) => ({ key: i, ...marking })),
                itemData: itemData.map((item: object, i: number) => ({ key: i, ...item })),
                expeditions
              });
              this.formRef.current?.resetFields();
            });
            ipcRenderer.send('queryValues', itemQuery, [customerId], 'customersItemQuery');
          });
          ipcRenderer.send('queryValues', markingQuery, [customerId], 'customersMarkingQuery');
        });
        ipcRenderer.send('queryValues', query, [entryId], 'customersFormQuery');
      }
      else {
        // Initialize 'add' form values.
        this.setState({ expeditions });
        this.formRef.current?.resetFields();
      }
    });
    ipcRenderer.send('query', expeditionQuery, 'expeditionsQuery');
  }

  handleSubmit(values: any) {
    // here
  }

  render() {
    const { Item } = AntForm;
    const { entryId } = this.props;
    const { initialData: data, markingData, itemData, expeditions } = this.state;
    const initialValues = objectDatesToMoment(data);

    const isLoading = entryId ? isEmpty(data) : false;
    return isLoading ? <Loading /> : (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} onFinishFailed={scrollToTop} 
        initialValues={initialValues}>
        <Title level={4}>Customer</Title>
        <DoubleColumns>
          <div>
            <Item label="Customer ID" name="customerid"
              rules={[{ required: true, message: `Airway Bill Number is required` }]}>
              <Input />
            </Item>
            <Item label="Name" name="customername"><Input /></Item>
            <Item label="Active" name="status" valuePropName="checked">
              <Switch defaultChecked />
            </Item>
            <Item label="Company" name="company"><Input /></Item>
            <Item label="Address 1" name="address1"><Input /></Item>
            <Item label="City 1" name="city1"><Input /></Item>
            <Item label="Postal Code 1" name="postalcode1"><Input /></Item>
            <Item label="Address 2" name="address2"><Input /></Item>
            <Item label="City 2" name="city2"><Input /></Item>
            <Item label="Postal Code 2" name="postalcode2"><Input /></Item>
            <Item label="Description" name="others"><TextArea /></Item>
          </div>
          <div>
            <Item label="Office Phone 1" name="officephone1"><Input /></Item>
            <Item label="Office Phone 2" name="officephone2"><Input /></Item>
            <Item label="Mobile Phone 1" name="mobilephone1"><Input /></Item>
            <Item label="Mobile Phone 2" name="mobilephone2"><Input /></Item>
            <Item label="Home Phone" name="homephone"><Input /></Item>
            <Item label="Email" name="email"><Input /></Item>
            <Item label="Fax" name="fax"><Input /></Item>
            <Item label="Contact Person 1" name="contactperson1"><Input /></Item>
            <Item label="Contact Person 2" name="contactperson2"><Input /></Item>
            <Item label="Size Description" name="sizedesc"><Input /></Item>
            <Item label="Courier" name="courierdesc">
              <Select>
                {expeditions.map(expedition => (
                  <Option key={expedition.expedisicode} value={expedition.expedisicode}>{expedition.expedisiname}</Option>
                ))}
              </Select>
            </Item>
          </div>
        </DoubleColumns>
        <Divider />
        <MarkingTable data={markingData} setData={data => this.setState({ markingData: data })} />
        <Divider />
        <ItemTable data={itemData} setData={data => this.setState({ itemData: data })} />
        <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
      </FormStyles>
    );
  }
}

export default Form;

const FormStyles = styled(AntForm)`
  .ant-form-item {
    margin-bottom: 12px;
  }

  > .ant-table-wrapper {
    margin-bottom: 20px;
  }

  > div:last-child {
    text-align: right;
  }
`;

const DoubleColumns = styled.div`
  display: flex;
  justify-content: space-between;

  > div { width: 550px; }
`;