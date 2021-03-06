import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Form, Typography, Input, DatePicker, FormInstance, Button, Select, Radio, RadioChangeEvent, Divider } from 'antd';

import Loading from '../../components/Loading';
import { simpleQuery, query } from '../../utils/query';
import print from '../../utils/print';
import scrollToTop from '../../utils/scrollModal';
import isEmptyObject from '../../utils/isEmptyObject';

import { seaFreight, routes, carriers, expedition } from '../../Queries.json';
const { 
  shippingQuery, shippingMarkingQuery, shippingCustomerQuery,
  shippingMarkingKgQuery, shippingMarkingM3Query
} = seaFreight;
const { tableQuery: routesQuery } = routes;
const { tableQuery: carriersQuery } = carriers;
const { tableQuery: expeditionsQuery } = expedition;

const { Item } = Form;
const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const dListKgQuery = shippingMarkingKgQuery.replace('|type|', 'dlist');
const dListM3Query = shippingMarkingM3Query.replace('|type|', 'dlist');
const hbKgQuery = shippingMarkingKgQuery.replace('|type|', 'hb');
const hbM3Query = shippingMarkingM3Query.replace('|type|', 'hb');
const custKgQuery = shippingMarkingKgQuery.replace('|type|', 'cust');
const custM3Query = shippingMarkingM3Query.replace('|type|', 'cust');

interface IValues { 
  'list[m3]': any
  'list[kg]': any
  'dist[m3]': any
  'dist[kg]': any
  'hb[m3]': any
  'hb[kg]': any
  'cust[m3]': any
  'cust[kg]': any
}

interface IAddresses {
  address1: string
  city1: string
  address2: string
  city2: string
}

interface IFormProps {
  containerNumber: number
  marking: string
  closeForm: () => void
}

interface IFormState {
  initialData: any
  routes: Array<any>
  shippers: Array<any>
  expeditions: Array<any>
  unit: string | null
}

class ShippingForm extends Component<IFormProps, IFormState> {
  formRef: React.RefObject<FormInstance>;
  valuesRef: React.MutableRefObject<IValues | null>;
  addressRef: React.MutableRefObject<IAddresses | null>;

  constructor(props: IFormProps) {
    super(props);
    this.state = {
      initialData: {},
      routes: [],
      shippers: [],
      expeditions: [],
      unit: null
    };

    this.formRef = createRef();
    this.valuesRef = createRef();
    this.addressRef = createRef();

    this.initializeData = this.initializeData.bind(this);
    this.setUnitValue = this.setUnitValue.bind(this);
    this.setAddress = this.setAddress.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.initializeData();
  }

  async initializeData() {
    const { containerNumber, marking } = this.props;

    const seafreightData = (await query(shippingQuery, [containerNumber]) as Array<any>)[0];
    const markingData = (await query(shippingMarkingQuery, [containerNumber, marking]) as Array<any>)[0];
    const customerData = (await query(shippingCustomerQuery, [marking]) as Array<any>)[0];

    const initialData = {
      marking,
      date: moment(),
      nocontainer: containerNumber,
      courierdesc: customerData.courierdesc,
      quantity: markingData.qty,
      rutecode: seafreightData.rute,
      shippercode: seafreightData.shipper,
      expedisicode: null,
      customer: customerData.customername,
      ukuran: null,
      ukuranvalue: 0,
      unit: 'colly',
      address: customerData.address1,
      city: customerData.city1,
      officephone: customerData.officephone1,
      mobilephone: customerData.mobilephone1
    };

    const routes = await simpleQuery(routesQuery) as Array<any>;
    const shippers = await simpleQuery(carriersQuery) as Array<any>;
    const expeditions = await simpleQuery(expeditionsQuery) as Array<any>;

    this.setState({ initialData, routes, shippers, expeditions });
    this.formRef.current?.resetFields();

    const markingDListKgData = await query(dListKgQuery, [markingData.no]) as Array<any>;
    const dListKg = markingDListKgData.map(d => d.berat * d.colly).reduce((a, b) => a + b, 0);

    const markingDListM3Data = await query(dListM3Query, [markingData.no]) as Array<any>;
    const dListM3 = markingDListM3Data.map(d => d.panjang * d.lebar * d.tinggi * d.colly).reduce((a, b) => a + b, 0);

    const markingHbKgData = await query(hbKgQuery, [markingData.no]) as Array<any>;
    const hbKg = markingHbKgData.map(d => d.berat * d.colly).reduce((a, b) => a + b, 0);

    const markingHbM3Data = await query(hbM3Query, [markingData.no]) as Array<any>;
    const hbM3 = markingHbM3Data.map(d => d.panjang * d.lebar * d.tinggi * d.colly).reduce((a, b) => a + b, 0);

    const markingCustKgData = await query(custKgQuery, [markingData.no]) as Array<any>;
    const custKg = markingCustKgData.map(d => d.berat * d.colly).reduce((a, b) => a + b, 0);

    const markingCustM3Data = await query(custM3Query, [markingData.no]) as Array<any>;
    const custM3 = markingCustM3Data.map(d => d.panjang * d.lebar * d.tinggi * d.colly).reduce((a, b) => a + b, 0);

    this.valuesRef.current = {
      'list[m3]': markingData['list[m3]'],
      'list[kg]': markingData['list[kg]'],
      'dist[m3]': dListM3,
      'dist[kg]': dListKg,
      'hb[m3]': hbM3,
      'hb[kg]': hbKg,
      'cust[m3]': custM3,
      'cust[kg]': custKg
    };

    this.addressRef.current = {
      address1: customerData.address1,
      city1: customerData.city1,
      address2: customerData.address2,
      city2: customerData.city2
    };
  }

  setUnitValue(selectedUnit: string) {
    const values = this.valuesRef.current;
    const value = values![selectedUnit as never];
    const unit = selectedUnit.substr(-3, 2).toUpperCase();

    this.formRef.current?.setFieldsValue({ ukuranvalue: value || 0 });
    this.setState({ unit });
  }

  setAddress(e: RadioChangeEvent) {
    const selectedAddress = e.target.value;
    const addresses = this.addressRef.current;

    if (selectedAddress === 1) {
      this.formRef.current?.setFieldsValue({
        address: addresses?.address1,
        city: addresses?.city1
      });
    }
    else if (selectedAddress === 2) {
      this.formRef.current?.setFieldsValue({
        address: addresses?.address2,
        city: addresses?.city2
      });
    }
  }

  handleSubmit(values: any) {
    console.log(values);
    // print(values);
    // this.props.closeForm();
  }

  render() {
    const { initialData, routes, shippers, expeditions, unit } = this.state;

    if (isEmptyObject(initialData)) {
      return <Loading />
    }
    return (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} onFinishFailed={scrollToTop}
        initialValues={initialData}>
        <Title level={3}>Surat Jalan Sea Freight</Title>
        <DoubleColumns>
          <div>
            <Item label="Marking" name="marking">
              <Input disabled />
            </Item>
            <Item label="Tanggal" name="date">
              <DatePicker />
            </Item>
            <Item label="No. Container" name="nocontainer">
              <Input disabled />
            </Item>
            <Item label="Keterangan Kirim" name="courierdesc">
              <Input disabled />
            </Item>
            <Item label="Quantity Kirim" name="quantity">
              <Input type='number' />
            </Item>
            <Item label="Rute" name='rutecode'>
              <Select>
                {routes.map(route => (
                  <Option key={route.rutecode} value={route.rutecode}>{route.rutedesc}</Option>
                ))}
              </Select>
            </Item>
            <Item label="Shipper" name='shippercode'>
              <Select>
                {shippers.map(shipper => (
                  <Option key={shipper.shippercode} value={shipper.shippercode}>{shipper.name}</Option>
                ))}
              </Select>
            </Item>
            <Item label="Expedisi" name='expedisicode'>
              <Select>
                {expeditions.map(expedition => (
                  <Option key={expedition.expedisicode} value={expedition.expedisicode}>{expedition.expedisiname}</Option>
                ))}
              </Select>
            </Item>
            <Item label="Customer" name="customer">
              <Input />
            </Item>
          </div>
          <div>
            <Item label="Pilihan Ukuran" name="ukuran">
              <Select onChange={this.setUnitValue}>
                <Option value="list[m3]">List M3</Option>
                <Option value="list[kg]">List Kg</Option>
                <Option value="dlist[m3]">DList M3</Option>
                <Option value="dlist[kg]">DList Kg</Option>
                <Option value="hb[m3]">HB M3</Option>
                <Option value="hb[kg]">HB Kg</Option>
                <Option value="cust[m3]">Cust M3</Option>
                <Option value="cust[kg]">Cust Kg</Option>
              </Select>
            </Item>
            <Item label="Jumlah" name="ukuranvalue">
              <Input addonAfter={unit} />
            </Item>
            <Item label="Satuan" name="unit">
              <Select>
                <Option value="colly">Colly</Option>
                <Option value="ball">Ball</Option>
                <Option value="roll">Roll</Option>
                <Option value="kardus">Kardus</Option>
                <Option value="pcs">Pcs</Option>
                <Option value="Kodi">Kodi</Option>
                <Option value="Lusin">Lusin</Option>
              </Select>
            </Item>
            <Divider />
            <Item label="Pilihan Alamat">
              <Radio.Group onChange={this.setAddress} defaultValue={1}>
                <Radio.Button value={1}>Address 1</Radio.Button>
                <Radio.Button value={2}>Address 2</Radio.Button>
              </Radio.Group>
            </Item>
            <Item label="Alamat" name="address">
              <TextArea />
            </Item>
            <Item label="Kota" name="city">
              <Input />
            </Item>
            <Item label="Telepon" name="officephone">
              <Input />
            </Item>
            <Item label="Handphone" name="mobilephone">
              <Input />
            </Item>
          </div>
        </DoubleColumns>
        <Item><Button type="primary" htmlType="submit">Print</Button></Item>
      </FormStyles>
    );
  }
}

export default ShippingForm;

const FormStyles = styled(Form)`
  .ant-form-item {
    margin-bottom: 12px;

    .ant-form-item-control-input-content:not(:last-of-type) {
      text-align: left;
    }
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