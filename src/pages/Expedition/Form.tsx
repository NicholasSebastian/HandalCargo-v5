import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import { Form as AntForm, FormInstance, Input, Select, Button, message } from 'antd';
import { Store } from 'antd/lib/form/interface';

import { IFormProps } from '../../components/TableTemplate';
import Loading from '../../components/Loading';

import { query, simpleQuery } from '../../utils/query';
import scrollToTop from '../../utils/scrollModal';
import isEmpty from '../../utils/isEmptyObject';

import { expedition, routes } from '../../Queries.json';
const { formQuery, insertQuery, updateQuery } = expedition;
const { tableQuery: routeQuery } = routes;

interface IFormState {
  initialData: Store
  routes: Array<any>
}

class Form extends Component<IFormProps, IFormState> {
  formRef: React.RefObject<FormInstance>;

  constructor(props: IFormProps) {
    super(props);
    this.state = {
      initialData: {},
      routes: []
    };
    this.formRef = createRef();
    this.initializeData = this.initializeData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.initializeData();
  }

  async initializeData() {
    const { entryId } = this.props;
    const routes = await simpleQuery(routeQuery) as Array<any>;
    if (entryId) {
      // Initialize 'edit' form values.
      const data = await query(formQuery, [entryId]) as Array<any>;
      this.setState({ initialData: data[0], routes });
      this.formRef.current?.resetFields();
    }
    else {
      // Initialize 'add' form values.
      this.setState({ routes });
      this.formRef.current?.resetFields();
    }
  }

  handleSubmit(values: any) {
    const { entryId, closeModal } = this.props;
    const formValues = Object.values(values);
    if (entryId) {
      // Edit form on submit.
      query(updateQuery, [...formValues, entryId])
      .then(() => {
        message.success(`'${entryId}' successfully updated`);
        closeModal();
      })
      .catch(e => message.error(e.message));
    }
    else {
      // Add form on submit.
      query(insertQuery, formValues)
      .then(() => {
        message.success('Entry successfully added');
        closeModal();
      });
    }
  }

  render() {
    const { Item } = AntForm;
    const { TextArea } = Input;
    const { Option } = Select;
    const { entryId } = this.props;
    const { initialData, routes } = this.state;

    const isLoading = entryId ? isEmpty(initialData) : false;
    return isLoading ? <Loading /> : (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} onFinishFailed={scrollToTop} 
        initialValues={initialData}>
        <Item label="Expedition Code" name="expedisicode"
          rules={[{ required: true, message: `Expedition Code is required` }]}>
          <Input />
        </Item>
        <Item label="Name" name="expedisiname"
          rules={[{ required: true, message: `Expedition Name is required` }]}>
          <Input />
        </Item>
        <Item label="Route" name="ruteid">
          <Select>
            {routes.map(route => (
              <Option key={route.rutecode} value={route.rutecode}>{route.rutedesc}</Option>
            ))}
          </Select>
        </Item>
        <Item label="Address" name="alamat"><Input /></Item>
        <Item label="Phone 1" name="phone1"><Input /></Item>
        <Item label="Phone 2" name="phone2"><Input /></Item>
        <Item label="Fax" name="fax"><Input /></Item>
        <Item label="Description" name="keterangan"><TextArea /></Item>
        <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
      </FormStyles>
    );
  }
}

export default Form;

const FormStyles = styled(AntForm)`
  width: 500px;
  margin: 0 auto;

  > div:last-child {
    text-align: right;
  }
`;