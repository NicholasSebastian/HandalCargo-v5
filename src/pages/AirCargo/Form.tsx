import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import { Typography, FormInstance, Form as AntForm, Button, Input } from 'antd'

import { IFormProps } from '../../components/TableTemplate';

const { Title } = Typography;

class Form extends Component<IFormProps, {}> {
  formRef: React.RefObject<FormInstance>;

  constructor(props: IFormProps) {
    super(props);
    this.formRef = createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(values: any) {
    const rawValues = Object.values(values);
    if (this.props.data) {
      // Edit form on submit.
      console.log('Editing', rawValues);
    }
    else {
      // Add form on submit.
      console.log('Adding', rawValues);
    }
    this.props.closeModal();
  }

  render() {
    const { Item } = AntForm;

    console.log(this.props.data);

    return (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} /* onFinishFailed={() => something} // TODO: scroll to top on fail */
        initialValues={this.props.data}>
        <Title level={4}>Uhhh stuff</Title>
        <Item label="Airway Bill No" name='no'
          rules={[{ required: true, message: `Airway Bill Number is required` }]}>
          <Input />
        </Item>
        <Item label="Item Code" name='kode'><Input /></Item>
        {/* here */}
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