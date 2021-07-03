import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import { Typography, Form as AntForm, FormInstance, Button, Input, DatePicker, Select, Divider, message } from 'antd';
import { Store } from 'antd/lib/form/interface';
import moment from 'moment';

import { IFormProps } from '../../components/TableTemplate';
import Loading from '../../components/Loading';
import MarkingTable from './MarkingTable';

import { query, simpleQuery } from '../../utils/query';
import { objectDatesToMoment, objectMomentToDates } from '../../utils/momentConverter';
import fillEmptyValues from '../../utils/objectNulling';
import scrollToTop from '../../utils/scrollModal';
import isEmpty from '../../utils/isEmptyObject';
import withMultipleValues from '../../utils/manyQueryValues';

import { seaFreight, containerGroup, carriers, routes, handlers, currencies } from '../../Queries.json';
const { 
  formQuery, insertQuery, updateQuery, 
  markingTableQuery, markingInsertQuery, markingDeleteQuery,
  markingSizeTableQuery, markingKgInsertQuery, markingM3InsertQuery, markingSizeDeleteQuery
} = seaFreight;
const { tableQuery: containerGroupQuery } = containerGroup;
const { tableQuery: carrierQuery } = carriers;
const { tableQuery: routeQuery } = routes;
const { tableQuery: handlerQuery } = handlers;
const { tableQuery: currencyQuery } = currencies;

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface IFormState {
  initialData: Store
  markingData: Array<any>
  sizeData: ISizeData
  containerGroups: Array<any>
  carriers: Array<any>
  routes: Array<any>
  handlers: Array<any>
  currencies: Array<any>
}

interface ISizeData {
  dListKg?: Array<any>
  dListM3?: Array<any>
  hbKg?: Array<any>
  hbM3?: Array<any>
  custKg?: Array<any>
  custM3?: Array<any>
}

class Form extends Component<IFormProps, IFormState> {
  formRef: React.RefObject<FormInstance>;

  daysToShipRef: React.RefObject<Input>;
  totalFeesRef: React.RefObject<Input>;

  totalQuantityRef: React.RefObject<Input>;
  totalVolumeListRef: React.RefObject<Input>;
  totalVolumeDListRef: React.RefObject<Input>;
  totalVolumeHbRef: React.RefObject<Input>;
  totalVolumeCustRef: React.RefObject<Input>;

  totalWeightListRef: React.RefObject<Input>;
  totalWeightDListRef: React.RefObject<Input>;
  totalWeightHbRef: React.RefObject<Input>;
  totalWeightCustRef: React.RefObject<Input>;

  constructor(props: IFormProps) {
    super(props);
    this.state = {
      initialData: {},
      markingData: [],
      sizeData: {},
      containerGroups: [],
      carriers: [],
      routes: [],
      handlers: [],
      currencies: []
    };

    this.formRef = createRef();
    this.daysToShipRef = createRef();
    this.totalFeesRef = createRef();
    this.totalQuantityRef = createRef();
    this.totalVolumeListRef = createRef();
    this.totalVolumeDListRef = createRef();
    this.totalVolumeHbRef = createRef();
    this.totalVolumeCustRef = createRef();
    this.totalWeightListRef = createRef();
    this.totalWeightDListRef = createRef();
    this.totalWeightHbRef = createRef();
    this.totalWeightCustRef = createRef();

    this.initializeData = this.initializeData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.calculateValues = this.calculateValues.bind(this);
    this.calculateMarkingValues = this.calculateMarkingValues.bind(this);

    this.initializeData();
  }

  async initializeData() {
    const { entryId } = this.props;
    const containerGroups = await simpleQuery(containerGroupQuery) as Array<any>;
    const carriers = await simpleQuery(carrierQuery) as Array<any>;
    const routes = await simpleQuery(routeQuery) as Array<any>;
    const handlers = await simpleQuery(handlerQuery) as Array<any>;
    const currencies = await simpleQuery(currencyQuery) as Array<any>;
    if (entryId) {
      // Initialize 'edit' form values.
      const data = await query(formQuery, [entryId]) as Array<any>;
      const entry = data[0];
      
      const markingData = await query(markingTableQuery, [entry.nocontainer]) as Array<any>;
      const markingDataWithKeys = markingData.map((entry, i) => ({ key: i, ...entry }));

      const sizeData: Array<any> = [];
      for (const type of ['dlist[kg]', 'dlist[m3]', 'hb[kg]', 'hb[m3]', 'cust[kg]', 'cust[m3]']) {
        const sizeQuery = markingSizeTableQuery.replace('|type|', type);
        const data = await query(sizeQuery, [entry.nocontainer]) as Array<any>;
        const dataWithKeys = data.map((entry, i) => ({ key: i, ...entry }));
        sizeData.push(dataWithKeys);
      }

      this.setState({ 
        initialData: entry,
        markingData: markingDataWithKeys,
        sizeData: {
          dListKg: sizeData[0],
          dListM3: sizeData[1],
          hbKg: sizeData[2],
          hbM3: sizeData[3],
          custKg: sizeData[4],
          custM3: sizeData[5]
        },
        containerGroups, carriers, routes, handlers, currencies
      });
      this.formRef.current?.resetFields();

      this.calculateValues();
      this.calculateMarkingValues();
    }
    else {
      // Initialize 'add' form values.
      this.setState({ containerGroups, carriers, routes, handlers, currencies });

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
        nocontainer: entryId || values.nocontainer, 
        ...entry 
      };
    });

    const [mInsertQuery, allMarkings] = withMultipleValues(markingInsertQuery, markingValues);

    if (entryId) {
      // Edit form on submit.
      Promise.all([
        query(updateQuery, [...rawValues, entryId]),
        query(markingDeleteQuery, [entryId]),
        markingValues.length > 0 && query(mInsertQuery as string, allMarkings as Array<any>)
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
        markingValues.length > 0 && query(mInsertQuery as string, allMarkings as Array<any>)
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

      const loadingFees = parseInt(data.biayamuat) || 0;
      const customClrnFees = parseInt(data['b.customclrc']) || 0;
      const additionalFees = parseInt(data['b.tambahan']) || 0;
      const otherFees = parseInt(data['b.lain-lain']) || 0;
      const totalFees = loadingFees + customClrnFees + additionalFees + otherFees;
      this.totalFeesRef.current?.setState({ value: totalFees || 0 });
    }
  }

  calculateMarkingValues(data?: Array<any>, sData?: ISizeData) {
    const markingData = data || this.state.markingData;
    const sizeData = sData || this.state.sizeData;

    const totalQuantity = markingData.map(d => +d.qty).reduce((a, b) => a + b, 0);
    this.totalQuantityRef.current?.setState({ value: totalQuantity || 0 });

    const totalVolumeList = markingData.map(d => +d['list[m3]']).reduce((a, b) => a + b, 0);
    this.totalVolumeListRef.current?.setState({ value: totalVolumeList || 0 });

    const totalWeightList = markingData.map(d => +d['list[kg]']).reduce((a, b) => a + b, 0);
    this.totalWeightListRef.current?.setState({ value: totalWeightList || 0 });

    const totalVolumeDList = sizeData.dListM3?.map(d => d.panjang * d.lebar * d.tinggi * d.colly).reduce((a, b) => a + b, 0);
    this.totalVolumeDListRef.current?.setState({ value: totalVolumeDList || 0 });

    const totalWeightDList = sizeData.dListKg?.map(d => d.berat * d.colly).reduce((a, b) => a + b, 0);
    this.totalWeightDListRef.current?.setState({ value: totalWeightDList || 0 });

    const totalVolumeHb = sizeData.hbM3?.map(d => d.panjang * d.lebar * d.tinggi * d.colly).reduce((a, b) => a + b, 0);
    this.totalVolumeHbRef.current?.setState({ value: totalVolumeHb || 0 });

    const totalWeightHb = sizeData.hbKg?.map(d => d.berat * d.colly).reduce((a, b) => a + b, 0);
    this.totalWeightHbRef.current?.setState({ value: totalWeightHb || 0 });

    const totalVolumeCust = sizeData.custM3?.map(d => d.panjang * d.lebar * d.tinggi * d.colly).reduce((a, b) => a + b, 0);
    this.totalVolumeCustRef.current?.setState({ value: totalVolumeCust || 0 });

    const totalWeightCust = sizeData.custKg?.map(d => d.berat * d.colly).reduce((a, b) => a + b, 0);
    this.totalWeightCustRef.current?.setState({ value: totalWeightCust || 0 });
  }
 
  render() {
    const { Item } = AntForm;
    const { entryId } = this.props;
    const { initialData: data, markingData, sizeData, containerGroups, carriers, routes, handlers, currencies } = this.state;
    const initialValues = objectDatesToMoment(data);

    const isLoading = entryId ? isEmpty(data) : false;
    return isLoading ? <Loading /> : (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} onFieldsChange={this.calculateValues}
        onFinishFailed={scrollToTop} initialValues={initialValues}>
        <Title level={4}>Sea Freight</Title>
        <DoubleColumns>
          <div>
            <Item label="Container No" name='nocontainer'
              rules={[{ required: true, message: `Container Number is required` }]}>
              <Input />
            </Item>
            <Item label="Item Code" name='kodebarang'
              rules={[{ required: true, message: `Item Code is required` }]}>
              <Input />
            </Item>
            <Item label="Date of Shipment" name='tglmuat'><DatePicker /></Item>
            <Item label="Date of Arrival" name='tgltiba'><DatePicker /></Item>
            <Item label="Bill of Lading Date" name='tglbl'><DatePicker /></Item>
            <Item label="Days to Ship"><Input ref={this.daysToShipRef} disabled addonAfter="Days" /></Item>
            <Item label="Container Group" name="kelcontainer">
              <Select>
                {containerGroups.map(cg => (
                  <Option key={cg.containercode} value={cg.containercode}>{cg.containerdesc}</Option>
                ))}
              </Select>
            </Item>
            <Item label="Carrier" name="shipper">
              <Select>
                {carriers.map(carrier => (
                  <Option key={carrier.shippercode} value={carrier.shippercode}>{carrier.name}</Option>
                ))}
              </Select>
            </Item>
            <Item label="Route" name="rute">
              <Select>
                {routes.map(route => (
                  <Option key={route.rutecode} value={route.rutecode}>{route.rutedesc}</Option>
                ))}
              </Select>
            </Item>
            <Item label="Handler" name="pengurus">
              <Select>
                {handlers.map(handler => (
                  <Option key={handler.penguruscode} value={handler.penguruscode}>{handler.pengurusname}</Option>
                ))}
              </Select>
            </Item>
          </div>
          <div>
            <Item label="Currencies" name="matauang">
              <Select>
                {currencies.map(currency => (
                  <Option key={currency.currencycode} value={currency.currencycode}>{currency.currencydesc}</Option>
                ))}
              </Select>
            </Item>
            <Item label="Exchange Rate" name="kurs">
              <Input type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Loading Fees" name="biayamuat">
              <Input type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Custom Clrn Fees" name="b.customclrc">
              <Input type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Additional Fees" name="b.tambahan">
              <Input type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Other Fees" name="b.lain-lain">
              <Input type='number' style={{ width: '100%' }} />
            </Item>
            <Item label="Total Fees"><Input ref={this.totalFeesRef} disabled /></Item>
            <Item label="Description" name="keterangan"><TextArea /></Item>
          </div>
        </DoubleColumns>
        <Divider />
        <MarkingTable
          data={markingData}
          sizeData={sizeData}
          setData={data => {
            this.setState({ markingData: data });
            this.calculateMarkingValues(data);
          }}
          setSizeData={data => {
            this.setState({ sizeData: data });
            this.calculateMarkingValues(undefined, data);
          }} />
        <Divider />
        <DoubleColumns>
          <div>
            <Item label="Total Volume [List]"><Input ref={this.totalVolumeListRef} disabled addonAfter="m³" /></Item>
            <Item label="Total Volume [DList]"><Input ref={this.totalVolumeDListRef} disabled addonAfter="m³" /></Item>
            <Item label="Total Volume [HB]"><Input ref={this.totalVolumeHbRef} disabled addonAfter="m³" /></Item>
            <Item label="Total Volume [Cust]"><Input ref={this.totalVolumeCustRef} disabled addonAfter="m³" /></Item>
            <Item label="Total Quantity"><Input ref={this.totalQuantityRef} disabled addonAfter="m³" /></Item>
          </div>
          <div>
            <Item label="Total Weight [List]"><Input ref={this.totalWeightListRef} disabled addonAfter="kg" /></Item>
            <Item label="Total Weight [DList]"><Input ref={this.totalWeightDListRef} disabled addonAfter="kg" /></Item>
            <Item label="Total Weight [HB]"><Input ref={this.totalWeightHbRef} disabled addonAfter="kg" /></Item>
            <Item label="Total Weight [Cust]"><Input ref={this.totalWeightCustRef} disabled addonAfter="kg" /></Item>
          </div>
        </DoubleColumns>
        <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
      </FormStyles>
    );
  }
}

export { ISizeData };
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