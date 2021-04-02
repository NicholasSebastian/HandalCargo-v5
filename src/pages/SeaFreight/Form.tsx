import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Typography, Form as AntForm, Button, Input, DatePicker, Select, FormInstance } from 'antd';
import { Store } from 'antd/lib/form/interface';
import moment from 'moment';

import { IFormProps } from '../../components/TableTemplate';
import MarkingTable from './MarkingTable';

import { objectDatesToMoment, objectMomentToDates } from '../../utils/momentConverter';
import scrollToTop from '../../utils/scrollModal';

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
  // TODO: Declare Refs here
  formRef: React.RefObject<FormInstance>;

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

    // TODO: Define Refs here
    this.formRef = createRef();

    this.initializeData = this.initializeData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.calculateValues = this.calculateValues.bind(this);
    this.calculateMarkingValues = this.calculateMarkingValues.bind(this);

    this.initializeData();
  }

  initializeData() {
    // TODO: Initialize state values.
  }

  handleSubmit(values: any) {
    // TODO: Submit values to database here.
  }

  calculateValues() {
    // TODO: Calculate Days to Ship
    // TODO: Calculate Total Fees
  }

  calculateMarkingValues() {
    // TODO: Calculate Marking Values Totals
  }

  render() {
    const { Item } = AntForm;
    const { initialData: data, containerGroups, carriers, routes, handlers, currencies } = this.state;
    const initialValues = objectDatesToMoment(data);

    return (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} onFieldsChange={this.calculateValues}
        onFinishFailed={scrollToTop} initialValues={initialValues}>
        {/* here */}
        <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
      </FormStyles>
    );
  }
}

export default Form;

const FormStyles = styled(AntForm)`
  // TODO: Here

  > div:last-child {
    text-align: right;
  }
`;