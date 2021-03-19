import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Typography, Form as AntForm, Button, Input, DatePicker, Select } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment, { Moment } from 'moment';

import { IFormProps } from '../../components/TableTemplate';

import MarkingTable from './MarkingTable';

import { airCargo, routes, planes, currencies } from '../../Queries.json';
const { insertQuery, updateQuery } = airCargo;

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface IFormState {
  routes: Array<any>
  planes: Array<any>
  currencies: Array<any>
  markingData: Array<any>
}

class Form extends Component<IFormProps, IFormState> {
  daysToShipRef: React.RefObject<Input>;
  freightTotalRef: React.RefObject<Input>;
  commissionTotalRef: React.RefObject<Input>;
  clrnTotalRef: React.RefObject<Input>;
  totalFeesRef: React.RefObject<Input>;

  constructor(props: IFormProps) {
    super(props);
    this.calculateValues = this.calculateValues.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);

    this.state = {
      routes: [],
      planes: [],
      currencies: [],
      markingData: []
    };
    this.initializeForm();

    // Dynamically calculated form fields.
    this.daysToShipRef = createRef();
    this.freightTotalRef = createRef();
    this.commissionTotalRef = createRef();
    this.clrnTotalRef = createRef();
    this.totalFeesRef = createRef();
  }

  componentDidMount() {
    this.calculateValues();
  }

  initializeForm() {
    // Callback hell.
    ipcRenderer.once('routesQuery', (event, routes) => {
      ipcRenderer.once('planesQuery', (event, planes) => {
        ipcRenderer.once('currenciesQuery', (event, currencies) => {
          this.setState({ routes, planes, currencies });
        });
        ipcRenderer.send('query', currencies.tableQuery, 'currenciesQuery');
      });
      ipcRenderer.send('query', planes.tableQuery, 'planesQuery');
    });
    ipcRenderer.send('query', routes.tableQuery, 'routesQuery');
  }

  handleSubmit(values: any) { // TODO
    const rawValues = Object.values(values);
    const markingValues = this.state.markingData;

    if (this.props.data) {
      // Edit form on submit.
      console.log('Editing', rawValues, markingValues);
    }
    else {
      // Add form on submit.
      console.log('Adding', rawValues, markingValues);
    }
    this.props.closeModal();
  }

  render() {
    const { Item } = AntForm;
    const { data, formRef } = this.props;
    const { routes, planes, currencies } = this.state;
    
    const initialValues = data && {
      ...data,
      tglmuat: moment(data.tglmuat),
      tgltiba: moment(data.tgltiba)
    };

    return (
      <FormStyles ref={formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} onFieldsChange={this.handleFieldChange}
        /* onFinishFailed={() => something} // TODO: scroll to top on fail */
        initialValues={initialValues}>
        <Title level={4}>Uhhh stuff</Title>
        <div>
          <div>
            <Item label="Airway Bill No" name='no'
              rules={[{ required: true, message: `Airway Bill Number is required` }]}>
              <Input />
            </Item>
            <Item label="Item Code" name='kode'><Input /></Item>
            <Item label="Date of Shipment" name="tglmuat"><DatePicker /></Item>
            <Item label="Date of Arrival" name="tgltiba"><DatePicker /></Item>
            <Item label="Days to Ship"><Input ref={this.daysToShipRef} disabled /></Item>
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
            <Item label="Exchange Rate" name="kurs"><Input /></Item>
            <Item label="Description" name="keterangan"><TextArea /></Item>
          </div>
          <div>
            <Item label="Charge/Kg" name="freightcharge/kg"><Input /></Item>
            <Item label="Freight Weight" name="brtfreight"><Input /></Item>
            <Item label="Freight Total"><Input ref={this.freightTotalRef} disabled /></Item>
            <Item label="Commission/Kg" name="komisi/kg"><Input /></Item>
            <Item label="Commission Weight" name="brtkomisi"><Input /></Item>
            <Item label="Commission Total"><Input ref={this.commissionTotalRef} disabled /></Item>
            <Item label="Custom Clrn" name="customclrn"><Input /></Item>
            <Item label="Clrn Weight" name="brtclrn"><Input /></Item>
            <Item label="Clrn Total"><Input ref={this.clrnTotalRef} disabled /></Item>
            <Item label="Additional Fees" name="biayatambahan"><Input /></Item>
            <Item label="Other Fees" name="biayalain-lain"><Input /></Item>
            <Item label="Total Fees"><Input ref={this.totalFeesRef} disabled /></Item>
          </div>
        </div>
        <MarkingTable data={this.state.markingData} setData={this.setState} />
        {
          // TODO:

          // Total Quantity (Sum of all Qty fields in marking table)
          // Total Weight (List) (Sum of all List[Kg] fields in marking table)
          // Total Weight (HB) (Sum of all HB[Kg] fields in marking table)

          // Real Difference (totalberat[hb] - totalberat[list])
          // Master Difference (totalberat[hb] - brtclrn)
        }
        <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
      </FormStyles>
    );
  }

  calculateValues() { // TODO: this is fucking blank for some reason???
    const { data } = this.props;
    if (data) {
      // Calculate Days to Ship
      const tglmuat = moment(data.tglmuat);
      const tgltiba = moment(data.tgltiba);
      const daysToShip = tgltiba.diff(tglmuat, 'days');
      this.daysToShipRef.current?.setState({ value: isNaN(daysToShip) ? "" : daysToShip });

      // Calculate Freight Total
      const freightTotal = data["freightcharge/kg"] * data.brtfreight;
      this.freightTotalRef.current?.setState({ value: freightTotal || 0 });

      // Calculate Commission Total
      const commissionTotal = data["komisi/kg"] * data.brtkomisi;
      this.commissionTotalRef.current?.setState({ value: commissionTotal || 0 });

      // Calculate Custom Clrn Total
      const clrnTotal = data.customclrn * data.brtclrn;
      this.clrnTotalRef.current?.setState({ value: clrnTotal || 0 });

      // Calculate Total Fees
      const totalFees = freightTotal + commissionTotal + clrnTotal + data.biayatambahan + data["biayalain-lain"];
      this.totalFeesRef.current?.setState({ value: totalFees || 0 });
    }
  }

  // This is horribly inefficient but oh well...
  handleFieldChange(changedValues: Array<any>, allValues: Array<any>) {
    const isChanged = (fieldName: string) => changedValues.some(value => value.name.includes(fieldName));
    const getValue = (fieldName: string) => allValues.find(value => value.name.includes(fieldName)).value;

    // Calculate Days to Ship
    if (isChanged("tglmuat") || isChanged("tgltiba")) {
      const tglmuat = getValue("tglmuat") as Moment;
      const tgltiba = getValue("tgltiba") as Moment;
      const daysToShip = tgltiba.diff(tglmuat, 'days');
      this.daysToShipRef.current?.setState({ value: isNaN(daysToShip) ? "" : daysToShip });
    }

    // Calculate Freight Total
    if (isChanged("freightcharge/kg") || isChanged("brtfreight")) {
      const freightCharge = getValue("freightcharge/kg") as number;
      const freightWeight = getValue("brtfreight") as number;
      const freightTotal = freightCharge * freightWeight;
      this.freightTotalRef.current?.setState({ value: freightTotal || 0 });
    }

    // Calculate Commission Total
    if (isChanged("komisi/kg") || isChanged("brtkomisi")) {
      const komisiCharge = getValue("komisi/kg") as number;
      const komisiWeight = getValue("brtkomisi") as number;
      const komisiTotal = komisiCharge * komisiWeight;
      this.commissionTotalRef.current?.setState({ value: komisiTotal || 0 });
    }

    // Calculate Custom Clrn Total
    if (isChanged("customclrn") || isChanged("brtclrn")) {
      const clrnCharge = getValue("customclrn") as number;
      const clrnWeight = getValue("brtclrn") as number;
      const clrnTotal = clrnCharge * clrnWeight;
      this.clrnTotalRef.current?.setState({ value: clrnTotal || 0 });
    }
    
    // Calculate Total Fees
    if (isChanged("freightcharge/kg") || isChanged("brtfreight") || 
      isChanged("komisi/kg") || isChanged("brtkomisi") ||
      isChanged("customclrn") || isChanged("brtclrn") ||
      isChanged("biayatambahan") || isChanged("biayalain-lain")) {

      const freightCharge = getValue("freightcharge/kg") as number;
      const freightWeight = getValue("brtfreight") as number;
      const freightTotal = freightCharge * freightWeight;

      const komisiCharge = getValue("komisi/kg") as number;
      const komisiWeight = getValue("brtkomisi") as number;
      const komisiTotal = komisiCharge * komisiWeight;

      const clrnCharge = getValue("customclrn") as number;
      const clrnWeight = getValue("brtclrn") as number;
      const clrnTotal = clrnCharge * clrnWeight;

      const additionalFees = getValue("biayatambahan");
      const otherFees = getValue("biayalain-lain");

      const totalFees = freightTotal + komisiTotal + clrnTotal + additionalFees + otherFees;
      this.totalFeesRef.current?.setState({ value: totalFees });
    }
  }
}

export default Form;

const FormStyles = styled(AntForm)`
  .ant-form-item {
    margin-bottom: 12px;
  }

  > div:first-of-type {
    display: flex;
    justify-content: space-between;

    > div { width: 550px; }
  }

  > div:last-child {
    text-align: right;
  }
`;