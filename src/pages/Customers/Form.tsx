import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import { Typography, FormInstance, Form as AntForm, Button, Input, Select, Switch, Divider, message } from 'antd';
import { Store } from 'antd/lib/form/interface';

import { query, simpleQuery } from '../../utils/query';
import { objectDatesToMoment } from '../../utils/momentConverter';
import fillEmptyValues from '../../utils/objectNulling';
import scrollToTop from '../../utils/scrollModal';
import isEmpty from '../../utils/isEmptyObject';
import withMultipleValues from '../../utils/manyQueryValues';

import { IFormProps } from '../../components/TableTemplate';
import Loading from '../../components/Loading';

import MarkingTable from './MarkingTable';
import ItemTable from './ItemTable';

import { customers, expedition } from '../../Queries.json';
const { 
  formQuery, formQueryAlt, insertQuery, updateQuery, 
  markingTableQuery: markingQuery, markingInsertQuery, markingDeleteQuery,
  itemTableQuery: itemQuery, itemInsertQuery, itemDeleteQuery
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

  async initializeData() {
    const { entryId, secondary } = this.props;
    const entryQuery = secondary ? formQueryAlt : formQuery;
    const expeditions = await simpleQuery(expeditionQuery) as Array<any>;
    if (entryId) {
      // Initialize 'edit' form values.
      const entry = await query(entryQuery, [entryId]) as Array<any>;
      const data = entry[0];
      const customerId = secondary ? entryId : data.customerid;
      const markingData = await query(markingQuery, [customerId]) as Array<any>;
      const markingDataWithKeys = markingData.map((marking: object, i: number) => ({ key: i, ...marking }));
      const itemData =  await query(itemQuery, [customerId]) as Array<any>;
      const itemDataWithKeys = itemData.map((item: object, i: number) => ({ key: i, ...item }));
      this.setState({
        initialData: data,
        markingData: markingDataWithKeys,
        itemData: itemDataWithKeys,
        expeditions
      });
      this.formRef.current?.resetFields();
    }
    else {
      // Inititalize 'add' form values.
      this.setState({ expeditions });
      this.formRef.current?.resetFields();
    }
  }

  handleSubmit(values: any) {
    const { entryId, secondary, closeModal } = this.props;
    const id = secondary ? entryId : this.state.initialData.customerid;

    const formValues = fillEmptyValues(values);
    const rawValues = Object.values(formValues);

    const replaceKeyWithId = (data: Array<any>) => {
      return data.map((entry: any) => {
        delete entry.key;
        return { 
          customerid: id || values.customerid, 
          ...entry 
        };
      });
    }

    const { markingData, itemData } = this.state;
    const markingValues = replaceKeyWithId(markingData);
    const itemValues = replaceKeyWithId(itemData);
    
    const [mInsertQuery, allMarkings] = withMultipleValues(markingInsertQuery, markingValues);
    const [iInsertQuery, allItems] = withMultipleValues(itemInsertQuery, itemValues);

    if (entryId) {
      // Edit form on submit.
      Promise.all([
        query(updateQuery, [...rawValues, id]),
        query(markingDeleteQuery, [id]),
        markingValues.length > 0 && query(mInsertQuery, allMarkings),
        query(itemDeleteQuery, [id]),
        itemValues.length > 0 && query(iInsertQuery, allItems)
      ])
      .then(() => {
        message.success(`'${entryId}' successfully updated`);
        closeModal();
      })
      .catch(e => message.error(e.message));
    }
    else {
      // Add form on submit.
      const dateAdded = new Date();
      const rawValuesWithDate = [...rawValues, dateAdded];
      Promise.all([
        query(insertQuery, rawValuesWithDate),
        markingValues.length  > 0 && query(mInsertQuery, allMarkings),
        itemValues.length > 0 && query(iInsertQuery, allItems)
      ])
      .then(() => {
        message.success('Entry successfully added');
        closeModal();
      })
      .catch(e => message.error(e.message));
    }
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
              rules={[{ required: true, message: `Customer ID is required` }]}>
              <Input />
            </Item>
            <Item label="Name" name="customername"
              rules={[{ required: true, message: `Customer Name is required` }]}>
              <Input />
            </Item>
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