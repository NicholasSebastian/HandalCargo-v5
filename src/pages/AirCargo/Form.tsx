import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Typography, Form as AntForm, Button, Input, InputNumber, DatePicker, Select, FormInstance, message } from 'antd';
import { Store } from 'antd/lib/form/interface';
import moment from 'moment';

import { IFormProps } from '../../components/TableTemplate';
import MarkingTable from './MarkingTable';

import round from '../../utils/roundToTwo';
import { objectDatesToMoment, objectMomentToDates } from '../../utils/momentConverter';
import scrollToTop from '../../utils/scrollModal';

import { airCargo, routes, planes, currencies } from '../../Queries.json';
const { formQuery, insertQuery, updateQuery, markingTableQuery, markingInsertQuery, markingDeleteQuery } = airCargo;

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

  initializeData() {
    ipcRenderer.once('routesQuery', (event, routes) => {
      ipcRenderer.once('planesQuery', (event, planes) => {
        ipcRenderer.once('currenciesQuery', (event, currencies) => {
          const { entryId } = this.props;
          if (entryId) {
            // Initialize 'edit' form values.
            ipcRenderer.once('formQuery', (event, data) => {
              ipcRenderer.once('markingTableQuery', (event, markingData: Array<object>) => {
                this.setState({ 
                  initialData: data[0],
                  routes, planes, currencies,
                  markingData: markingData.map((entry, i) => ({ key: i, ...entry }))
                });
                this.formRef.current?.resetFields();
                this.calculateValues();
                this.calculateMarkingValues();
              });
              ipcRenderer.send('queryValues', markingTableQuery, [data[0].no], 'markingTableQuery');
            });
            ipcRenderer.send('queryValues', formQuery, [entryId], 'formQuery');
          }
          else {
            // Initialize 'add' form values.
            this.setState({ routes, planes, currencies });
            this.formRef.current?.resetFields();
            this.calculateValues();
          }
        });
        ipcRenderer.send('query', currencies.tableQuery, 'currenciesQuery');
      });
      ipcRenderer.send('query', planes.tableQuery, 'planesQuery');
    });
    ipcRenderer.send('query', routes.tableQuery, 'routesQuery');
  }

  handleSubmit(values: any) {
    const { entryId, closeModal } = this.props;
    
    const formValues = Object.values(values);
    const rawValues = objectMomentToDates(formValues);

    const { markingData } = this.state;
    const markingValues = markingData.map(entry => {
      delete entry.key;
      return { noaircargo: entryId, ...entry };
    });

    const withMultipleValues = (insertQuery: string, queryValues: Array<object>) => {
      const from = insertQuery.lastIndexOf('(');
      const queryEnd = insertQuery.substring(from);

      let newInsertQuery = insertQuery;
      for (let i = 0; i < queryValues.length - 1; i++) {
        newInsertQuery += `,${queryEnd}`;
      }
      
      const flattenedValues = queryValues.map(entry => Object.values(entry)).flat();
      return [newInsertQuery, flattenedValues];
    }

    if (entryId) {
      // Edit form on submit.
      ipcRenderer.once('aircargoUpdateQuery', () => {
        ipcRenderer.once('aircargoMarkingDeleteQuery', () => {
          if (markingValues.length > 0) {
            ipcRenderer.once('aircargoMarkingInsertQuery', () => {
              message.success(`'${entryId}' successfully updated`);
              closeModal();
            });
            ipcRenderer.send('queryValues', ...withMultipleValues(markingInsertQuery, markingValues), 'aircargoMarkingInsertQuery');
          }
        });
        ipcRenderer.send('queryValues', markingDeleteQuery, [entryId], 'aircargoMarkingDeleteQuery');
      });
      ipcRenderer.send('queryValues', updateQuery, [...rawValues, entryId], 'aircargoUpdateQuery');
    }
    else {
      // Add form on submit.
      ipcRenderer.once('aircargoInsertQuery', () => {
        if (markingValues.length > 0) {
          ipcRenderer.once('aircargoMarkingInsertQuery', () => {
            message.success('Entry successfully added');
            closeModal();
          });
          ipcRenderer.send('queryValues', ...withMultipleValues(markingInsertQuery, markingValues), 'aircargoMarkingInsertQuery');
        }
      });
      ipcRenderer.send('queryValues', insertQuery, rawValues, 'aircargoInsertQuery');
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

  calculateMarkingValues() {
    const { markingData } = this.state;

    const totalQuantity = markingData.map(d => d.qty).reduce((a, b) => a + b, 0) as number;
    this.totalQuantityRef.current?.setState({ value: totalQuantity || 0 });

    const totalWeightList = markingData.map(d => d['list[kg]']).reduce((a, b) => a + b, 0) as number;
    this.totalWeightListRef.current?.setState({ value: totalWeightList || 0 });

    const totalWeightHb = markingData.map(d => d['hb[kg]']).reduce((a, b) => a + b, 0) as number;
    this.totalWeightHbRef.current?.setState({ value: totalWeightHb || 0 });

    const realDifference = round(totalWeightHb - totalWeightList);
    this.realDifferenceRef.current?.setState({ value: realDifference || 0 });

    const clrnWeight = this.formRef.current?.getFieldValue('brtclrn');
    const masterDifference = round(totalWeightHb - clrnWeight);
    this.masterDifferenceRef.current?.setState({ value: masterDifference || 0 });
  }

  render() {
    const { Item } = AntForm;
    const { initialData: data, markingData, routes, planes, currencies } = this.state;
    const initialValues = objectDatesToMoment(data);

    return (
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
            <Item label="Item Code" name='kode'><Input /></Item>
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
              <InputNumber type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Description" name="keterangan"><TextArea /></Item>
          </div>
          <div>
            <Item label="Charge/Kg" name="freightcharge/kg">
              <InputNumber type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Freight Weight" name="brtfreight">
              <InputNumber type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Freight Total"><Input ref={this.freightTotalRef} disabled /></Item>
            <Item label="Commission/Kg" name="komisi/kg">
              <InputNumber type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Commission Weight" name="brtkomisi">
              <InputNumber type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Commission Total"><Input ref={this.commissionTotalRef} disabled /></Item>
            <Item label="Custom Clrn" name="customclrn">
              <InputNumber type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Clrn Weight" name="brtclrn">
              <InputNumber type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Clrn Total"><Input ref={this.clrnTotalRef} disabled /></Item>
            <Item label="Additional Fees" name="biayatambahan">
              <InputNumber type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Other Fees" name="biayalain-lain">
              <InputNumber type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Total Fees"><Input ref={this.totalFeesRef} disabled /></Item>
          </div>
        </DoubleColumns>
        <MarkingTable 
          data={markingData} 
          setData={data => this.setState({ markingData: data })}
          onUpdate={this.calculateMarkingValues} />
        <DoubleColumns>
          <div>
            <Item label="Total Quantity"><Input ref={this.totalQuantityRef} disabled /></Item>
            <Item label="Total Weight (List)"><Input ref={this.totalWeightListRef} disabled /></Item>
            <Item label="Total Weight (HB)"><Input ref={this.totalWeightHbRef} disabled /></Item>
          </div>
          <div>
            <Item label="Real Difference"><Input ref={this.realDifferenceRef} disabled /></Item>
            <Item label="Master Difference"><Input ref={this.masterDifferenceRef} disabled /></Item>
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