import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Typography, Form as AntForm, FormInstance, Button, Input, DatePicker, Select, message } from 'antd';
import { Store } from 'antd/lib/form/interface';
import moment from 'moment';

import { IFormProps } from '../../components/TableTemplate';
import Loading from '../../components/Loading';
import MarkingTable from './MarkingTable';

import { objectDatesToMoment, objectMomentToDates } from '../../utils/momentConverter';
import fillEmptyValues from '../../utils/objectNulling';
import scrollToTop from '../../utils/scrollModal';
import isEmpty from '../../utils/isEmptyObject';

import { seaFreight, containerGroup, carriers, routes, handlers, currencies } from '../../Queries.json';
const { formQuery, insertQuery, updateQuery, markingTableQuery, markingInsertQuery, markingDeleteQuery } = seaFreight;

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface IFormState {
  initialData: Store
  markingData: Array<any>
  containerGroups: Array<any>
  carriers: Array<any>
  routes: Array<any>
  handlers: Array<any>
  currencies: Array<any>
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

  initializeData() {
    ipcRenderer.once('conGroupQuery', (event, containerGroups) => {
      ipcRenderer.once('carrierQuery', (event, carriers) => {
        ipcRenderer.once('routeQuery', (event, routes) => {
          ipcRenderer.once('handlerQuery', (event, handlers) => {
            ipcRenderer.once('currencyQuery', (event, currencies) => {
              const { entryId } = this.props;
              if (entryId) {
                // Initialize 'edit' form values.
                ipcRenderer.once('formQuery', (event, data) => {
                  ipcRenderer.once('markingTableQuery', (event, markingData: Array<object>) => {
                    this.setState({ 
                      initialData: data[0],
                      markingData: markingData.map((entry, i) => ({ key: i, ...entry })),
                      containerGroups, carriers, routes, handlers, currencies
                    });
                    this.formRef.current?.resetFields();
                    this.calculateValues();
                    this.calculateMarkingValues();
                  });
                  ipcRenderer.send('queryValues', markingTableQuery, [data[0].nocontainer], 'markingTableQuery');
                });
                ipcRenderer.send('queryValues', formQuery, [entryId], 'formQuery');
              }
              else {
                // Initialize 'add' form values.
                this.setState({ containerGroups, carriers, routes, handlers, currencies });
                this.formRef.current?.resetFields();
                this.calculateValues();
              }
            });
            ipcRenderer.send('query', currencies.tableQuery, 'currencyQuery');
          });
          ipcRenderer.send('query', handlers.tableQuery, 'handlerQuery');
        });
        ipcRenderer.send('query', routes.tableQuery, 'routeQuery');
      });
      ipcRenderer.send('query', carriers.tableQuery, 'carrierQuery');
    });
    ipcRenderer.send('query', containerGroup.tableQuery, 'conGroupQuery');
  }

  handleSubmit(values: any) {
    const { entryId, closeModal } = this.props;
    
    const formValues = fillEmptyValues(values);
    const formattedValues = objectMomentToDates(formValues);
    const rawValues = Object.values(formattedValues);

    const { markingData } = this.state;
    const markingValues = markingData.map(entry => {
      delete entry.key;
      return { nocontainer: entryId || values.nocontainer, ...entry };
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
      const onSuccess = () => {
        message.success(`'${entryId}' successfully updated`);
        closeModal();
      }
      ipcRenderer.once('seafreightUpdateQuery', () => {
        ipcRenderer.once('seafreightMarkingDeleteQuery', () => {
          if (markingValues.length > 0) {
            ipcRenderer.once('seafreightMarkingInsertQuery', onSuccess);
            ipcRenderer.send('queryValues', ...withMultipleValues(markingInsertQuery, markingValues), 'seafreightMarkingInsertQuery');
          }
          else onSuccess();
        });
        ipcRenderer.send('queryValues', markingDeleteQuery, [entryId], 'seafreightMarkingDeleteQuery');
      });
      ipcRenderer.send('queryValues', updateQuery, [...rawValues, entryId], 'seafreightUpdateQuery');
    }
    else {
      // Add form on submit.
      const onSuccess = () => {
        message.success('Entry successfully added');
        closeModal();
      }
      ipcRenderer.once('seafreightInsertQuery', () => {
        if (markingValues.length > 0) {
          ipcRenderer.once('seafreightMarkingInsertQuery', onSuccess);
          ipcRenderer.send('queryValues', ...withMultipleValues(markingInsertQuery, markingValues), 'seafreightMarkingInsertQuery');
        }
        else onSuccess();
      });
      ipcRenderer.send('queryValues', insertQuery, rawValues, 'seafreightInsertQuery');
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

  calculateMarkingValues() {
    const { markingData } = this.state;

    const totalQuantity = markingData.map(d => +d.qty).reduce((a, b) => a + b, 0) as number;
    this.totalQuantityRef.current?.setState({ value: totalQuantity || 0 });

    const totalVolumeList = markingData.map(d => +d['list[m3]']).reduce((a, b) => a + b, 0) as number;
    this.totalVolumeListRef.current?.setState({ value: totalVolumeList || 0 });

    const totalVolumeDList = markingData.map(d => +d['dlist[m3]']).reduce((a, b) => a + b, 0) as number;
    this.totalVolumeDListRef.current?.setState({ value: totalVolumeDList || 0 });

    const totalVolumeHb = markingData.map(d => +d['hb[m3]']).reduce((a, b) => a + b, 0) as number;
    this.totalVolumeHbRef.current?.setState({ value: totalVolumeHb || 0 });

    const totalVolumeCust = markingData.map(d => +d['cust[m3]']).reduce((a, b) => a + b, 0) as number;
    this.totalVolumeCustRef.current?.setState({ value: totalVolumeCust || 0 });

    const totalWeightList = markingData.map(d => +d['list[kg]']).reduce((a, b) => a + b, 0) as number;
    this.totalWeightListRef.current?.setState({ value: totalWeightList || 0 });

    const totalWeightDList = markingData.map(d => +d['dlist[kg]']).reduce((a, b) => a + b, 0) as number;
    this.totalWeightDListRef.current?.setState({ value: totalWeightDList || 0 });

    const totalWeightHb = markingData.map(d => +d['hb[kg]']).reduce((a, b) => a + b, 0) as number;
    this.totalWeightHbRef.current?.setState({ value: totalWeightHb || 0 });

    const totalWeightCust = markingData.map(d => +d['cust[kg]']).reduce((a, b) => a + b, 0) as number;
    this.totalWeightCustRef.current?.setState({ value: totalWeightCust || 0 });
  }
 
  render() {
    const { Item } = AntForm;
    const { entryId } = this.props;
    const { initialData: data, markingData, containerGroups, carriers, routes, handlers, currencies } = this.state;
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
        <MarkingTable
          data={markingData}
          setData={data => this.setState({ markingData: data })}
          onUpdate={() => this.calculateMarkingValues()} />
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