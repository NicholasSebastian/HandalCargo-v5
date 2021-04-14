import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import { Typography, FormInstance, Form as AntForm, Button, Input, DatePicker, Select, Divider, message } from 'antd';
import { Store } from 'antd/lib/form/interface';
import moment from 'moment';

import { query, simpleQuery } from '../../utils/query';
import round from '../../utils/roundToTwo';
import { objectDatesToMoment, objectMomentToDates } from '../../utils/momentConverter';
import fillEmptyValues from '../../utils/objectNulling';
import scrollToTop from '../../utils/scrollModal';
import isEmpty from '../../utils/isEmptyObject';
import withMultipleValues from '../../utils/manyQueryValues';

import { IFormProps } from '../../components/TableTemplate';
import Loading from '../../components/Loading';
import MarkingTable from './MarkingTable';

import { airCargo, routes, planes, currencies } from '../../Queries.json';
const { formQuery, insertQuery, updateQuery, markingTableQuery, markingInsertQuery, markingDeleteQuery } = airCargo;
const { tableQuery: routeQuery } = routes;
const { tableQuery: planeQuery } = planes;
const { tableQuery: currencyQuery } = currencies;

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface IFormState {
  initialData: Store
  markingData: Array<any>
  routes: Array<any>
  planes: Array<any>
  currencies: Array<any>
}

class Form extends Component<IFormProps, IFormState> {
  formRef: React.RefObject<FormInstance>

  daysToShipRef: React.RefObject<Input>;
  freightTotalRef: React.RefObject<Input>;
  commissionTotalRef: React.RefObject<Input>;
  clrnTotalRef: React.RefObject<Input>;
  totalFeesRef: React.RefObject<Input>;

  totalQuantityRef: React.RefObject<Input>;
  totalWeightHbRef: React.RefObject<Input>;
  totalWeightListRef: React.RefObject<Input>;
  realDifferenceRef: React.RefObject<Input>;
  masterDifferenceRef: React.RefObject<Input>;

  constructor(props: IFormProps) {
    super(props);
    this.state = {
      initialData: {},
      markingData: [],
      routes: [],
      planes: [],
      currencies: []
    };
    
    this.formRef = createRef();
    this.daysToShipRef = createRef();
    this.freightTotalRef = createRef();
    this.commissionTotalRef = createRef();
    this.clrnTotalRef = createRef();
    this.totalFeesRef = createRef();
    this.totalQuantityRef = createRef();
    this.totalWeightHbRef = createRef();
    this.totalWeightListRef = createRef();
    this.realDifferenceRef = createRef();
    this.masterDifferenceRef = createRef();

    this.initializeData = this.initializeData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.calculateValues = this.calculateValues.bind(this);
    this.calculateMarkingValues = this.calculateMarkingValues.bind(this);

    this.initializeData();
  }

  async initializeData() {
    const { entryId } = this.props;
    const routes = await simpleQuery(routeQuery) as Array<any>;
    const planes = await simpleQuery(planeQuery) as Array<any>;
    const currencies = await simpleQuery(currencyQuery) as Array<any>;
    if (entryId) {
      // Initialize 'edit' form values.
      const entry = await query(formQuery, [entryId]) as Array<any>;
      const data = entry[0];
      const markingData = await query(markingTableQuery, [data.no]) as Array<any>;
      const markingDataWithKeys = markingData.map((entry, i) => ({ key: i, ...entry }));
      this.setState({ 
        initialData: data,
        markingData: markingDataWithKeys,
        routes, planes, currencies
      });
      this.formRef.current?.resetFields();
      this.calculateValues();
      this.calculateMarkingValues();
    }
    else {
      // Initialize 'add' form values.
      this.setState({ routes, planes, currencies });
      this.formRef.current?.resetFields();
      this.calculateValues();
    }
  }

  handleSubmit(values: any) {
    const { entryId, closeModal } = this.props;
    
    const formValues = fillEmptyValues(values);
    const formattedValues = objectMomentToDates(formValues);
    const rawValues = Object.values(formattedValues);

    const { markingData } = this.state;
    const markingValues = markingData.map(entry => {
      delete entry.key;
      delete entry.no;
      return { 
        noaircargo: entryId || values.no, 
        ...entry 
      };
    });

    const [mInsertQuery, allMarkings] = withMultipleValues(markingInsertQuery, markingValues);
    
    if (entryId) {
      // Edit form on submit.
      Promise.all([
        query(updateQuery, [...rawValues, entryId]),
        query(markingDeleteQuery, [entryId]),
        markingValues.length > 0 && query(mInsertQuery, allMarkings)
      ])
      .then(() => {
        message.success(`'${entryId}' successfully updated`);
        closeModal();
      })
      .catch(e => message.error(e.message));
    }
    else {
      // Add form on submit.
      Promise.all([
        query(insertQuery, rawValues),
        markingValues.length > 0 && query(mInsertQuery, allMarkings)
      ])
      .then(() => {
        message.success('Entry successfully added');
        closeModal();
      })
      .catch(e => message.error(e.message));
    }
  }

  calculateValues() { 
    const data = this.formRef.current?.getFieldsValue(true);
    if (data) {
      const tglmuat = moment(data.tglmuat);
      const tgltiba = moment(data.tgltiba);
      const daysToShip = tgltiba.diff(tglmuat, 'days');
      this.daysToShipRef.current?.setState({ value: daysToShip || "" });

      const freightTotal = data["freightcharge/kg"] * data.brtfreight;
      this.freightTotalRef.current?.setState({ value: freightTotal || 0 });

      const commissionTotal = data["komisi/kg"] * data.brtkomisi;
      this.commissionTotalRef.current?.setState({ value: commissionTotal || 0 });

      const clrnTotal = data.customclrn * data.brtclrn;
      this.clrnTotalRef.current?.setState({ value: clrnTotal || 0 });

      const additionalFees = parseInt(data.biayatambahan);
      const otherFees = parseInt(data["biayalain-lain"]);
      const totalFees = (freightTotal || 0) + (commissionTotal || 0) + (clrnTotal || 0) + (additionalFees || 0) + (otherFees || 0);
      this.totalFeesRef.current?.setState({ value: totalFees || 0 });
    }
  }

  calculateMarkingValues(data?: Array<any>) {
    const markingData = data || this.state.markingData;

    const totalQuantity = markingData.map(d => +d.qty).reduce((a, b) => a + b, 0) as number;
    this.totalQuantityRef.current?.setState({ value: totalQuantity || 0 });

    const totalWeightList = markingData.map(d => +d['list[kg]']).reduce((a, b) => a + b, 0) as number;
    this.totalWeightListRef.current?.setState({ value: totalWeightList || 0 });

    const totalWeightHb = markingData.map(d => +d['hb[kg]']).reduce((a, b) => a + b, 0) as number;
    this.totalWeightHbRef.current?.setState({ value: totalWeightHb || 0 });

    const realDifference = round(totalWeightHb - totalWeightList);
    this.realDifferenceRef.current?.setState({ value: realDifference || 0 });

    const clrnWeight = this.formRef.current?.getFieldValue('brtclrn');
    const masterDifference = round(totalWeightHb - clrnWeight);
    this.masterDifferenceRef.current?.setState({ value: masterDifference || 0 });
  }

  render() {
    const { Item } = AntForm;
    const { entryId } = this.props;
    const { initialData: data, markingData, routes, planes, currencies } = this.state;
    const initialValues = objectDatesToMoment(data);

    const isLoading = entryId ? isEmpty(data) : false;
    return isLoading ? <Loading /> : (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} onFieldsChange={this.calculateValues}
        onFinishFailed={scrollToTop} initialValues={initialValues}>
        <Title level={4}>Air Cargo</Title>
        <DoubleColumns>
          <div>
            <Item label="Airway Bill No" name='no'
              rules={[{ required: true, message: `Airway Bill Number is required` }]}>
              <Input />
            </Item>
            <Item label="Item Code" name='kode'
              rules={[{ required: true, message: `Item Code is required` }]}>
              <Input />
            </Item>
            <Item label="Date of Shipment" name="tglmuat"><DatePicker /></Item>
            <Item label="Date of Arrival" name="tgltiba"><DatePicker /></Item>
            <Item label="Days to Ship"><Input ref={this.daysToShipRef} disabled addonAfter="Days" /></Item>
            <Item label="Route" name="rute">
              <Select>
                {routes.map(route => (
                  <Option key={route.rutecode} value={route.rutecode}>{route.rutedesc}</Option>
                ))}
              </Select>
            </Item>
            <Item label="Plane" name="pesawat">
              <Select>
                {planes.map(plane => (
                  <Option key={plane.pesawatcode} value={plane.pesawatcode}>{plane.pesawatdesc}</Option>
                ))}
              </Select>
            </Item>
            <Item label="Currency" name="matauang">
              <Select>
                {currencies.map(currency => (
                  <Option key={currency.currencycode} value={currency.currencycode}>{currency.currencydesc}</Option>
                ))}
              </Select>
            </Item>
            <Item label="Exchange Rate" name="kurs">
              <Input type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Description" name="keterangan"><TextArea /></Item>
          </div>
          <div>
            <Item label="Charge/Kg" name="freightcharge/kg">
              <Input type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Freight Weight" name="brtfreight">
              <Input type='number' style={{ width: '100%' }} addonAfter="kg" />
            </Item>
            <Item label="Freight Total"><Input ref={this.freightTotalRef} disabled /></Item>
            <Item label="Commission/Kg" name="komisi/kg">
              <Input type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Commission Weight" name="brtkomisi">
              <Input type='number' style={{ width: '100%' }} addonAfter="kg" />
            </Item>
            <Item label="Commission Total"><Input ref={this.commissionTotalRef} disabled /></Item>
            <Item label="Custom Clrn" name="customclrn">
              <Input type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Clrn Weight" name="brtclrn">
              <Input type='number' style={{ width: '100%' }} addonAfter="kg" />
            </Item>
            <Item label="Clrn Total"><Input ref={this.clrnTotalRef} disabled /></Item>
            <Item label="Additional Fees" name="biayatambahan">
              <Input type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Other Fees" name="biayalain-lain">
              <Input type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Total Fees"><Input ref={this.totalFeesRef} disabled /></Item>
          </div>
        </DoubleColumns>
        <Divider />
        <MarkingTable 
          data={markingData} 
          setData={data => {
            this.setState({ markingData: data });
            this.calculateMarkingValues(data);
          }} />
        <Divider />
        <DoubleColumns>
          <div>
            <Item label="Total Quantity"><Input ref={this.totalQuantityRef} disabled /></Item>
            <Item label="Total Weight (List)"><Input ref={this.totalWeightListRef} disabled addonAfter="kg" /></Item>
            <Item label="Total Weight (HB)"><Input ref={this.totalWeightHbRef} disabled addonAfter="kg" /></Item>
          </div>
          <div>
            <Item label="Real Difference"><Input ref={this.realDifferenceRef} disabled addonAfter="kg" /></Item>
            <Item label="Master Difference"><Input ref={this.masterDifferenceRef} disabled addonAfter="kg" /></Item>
          </div>
        </DoubleColumns>
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