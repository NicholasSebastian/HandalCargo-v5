import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Form, Typography, Input, DatePicker, FormInstance, Button, Select, Radio, RadioChangeEvent, Divider, Switch } from 'antd';

import Loading from '../../components/Loading';
import { simpleQuery, query } from '../../utils/query';
import print from '../../utils/print';
import scrollToTop from '../../utils/scrollModal';
import isEmptyObject from '../../utils/isEmptyObject';

import { airCargo, routes, expedition } from '../../Queries.json';
const { shippingQuery, shippingMarkingQuery, shippingCustomerQuery } = airCargo;
const { tableQuery: routesQuery } = routes;
const { tableQuery: expeditionsQuery } = expedition;

const { Item } = Form;
const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface IValues { 
  'list[kg]': any
  'hb[kg]': any
}

interface IAddresses {
  address1: string
  city1: string
  address2: string
  city2: string
}

interface IFormProps {
  airwayNumber: number
  marking: string
  closeForm: () => void
}

interface IFormState {
  initialData: any
  routes: Array<any>
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
    const { airwayNumber, marking } = this.props;

    const aircargoData = (await query(shippingQuery, [airwayNumber]) as Array<any>)[0];
    const markingData = (await query(shippingMarkingQuery, [airwayNumber, marking]) as Array<any>)[0];
    const customerData = (await query(shippingCustomerQuery, [marking]) as Array<any>)[0];

    const initialData = {
      marking,
      date: moment(),
      no: airwayNumber,
      courierdesc: customerData.courierdesc,
      quantity: markingData.qty,
      rutecode: aircargoData.rute,
      expedisicode: null,
      customer: customerData.customername,
      ukuran: null,
      ukuranvalue: 0,
      unit: 'colly',
      address: customerData.address1,
      city: customerData.city1,
      officephone: customerData.officephone1,
      mobilephone: customerData.mobilephone1,
      ringkasan: true
    };

    const routes = await simpleQuery(routesQuery) as Array<any>;
    const expeditions = await simpleQuery(expeditionsQuery) as Array<any>;

    this.setState({ initialData, routes, expeditions });
    this.formRef.current?.resetFields();

    this.valuesRef.current = {
      'list[kg]': markingData['list[kg]'],
      'hb[kg]': markingData['hb[kg]']
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
    const { initialData, routes, expeditions, unit } = this.state;

    if (isEmptyObject(initialData)) {
      return <Loading />
    }
    return (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} onFinishFailed={scrollToTop}
        initialValues={initialData}>
        <Title level={3}>Surat Jalan Air Cargo</Title>
        <DoubleColumns>
          <div>
            <Item label="Marking" name="marking">
              <Input disabled />
            </Item>
            <Item label="Tanggal" name="date">
              <DatePicker />
            </Item>
            <Item label="No. Pesawat" name="no">
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
                <Option value="list[kg]">List Kg</Option>
                <Option value="hb[kg]">HB Kg</Option>
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
            <Item label="Ringkasan" name="ringkasan" valuePropName='checked'>
              <Switch />
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