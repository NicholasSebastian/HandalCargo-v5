import React, { FC, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FormInstance, Form as AntForm, Input, Button, message } from 'antd';

import { query } from '../../utils/query';
import fillEmptyValues from '../../utils/objectNulling';
import scrollToTop from '../../utils/scrollModal';

import { ICompanySettings } from './View';

import { companySetup } from '../../Queries.json';
const { updateQuery } = companySetup;

const { Item } = AntForm;

interface IFormProps {
  data: ICompanySettings | undefined
  closeModal: () => void
}

const Form: FC<IFormProps> = props => {
  const { data, closeModal } = props;

  const formRef = useRef<FormInstance>(null);
  useEffect(() => formRef.current?.resetFields(), [data]);

  function handleSubmit(formValues: any) {
    const values = fillEmptyValues(formValues);
    const rawValues = Object.values(values);
    query(updateQuery, rawValues)
    .then(() => {
      message.success(`Company Settings successfully updated`);
      closeModal();
    })
    .catch(e => message.error(e.message));
  }

  return (
    <FormStyles ref={formRef} labelCol={{ span: 6 }} initialValues={data}
      onFinish={handleSubmit} onFinishFailed={scrollToTop}>
      <Item label="Company Name" name="companyname"><Input /></Item>
      <Item label="Address" name="address"><Input /></Item>
      <Item label="City" name="city"><Input /></Item>
      <Item label="Phone" name="phone"><Input /></Item>
      <Item label="Zip Code" name="zipcode"><Input type='number' /></Item>
      <Item label="Fax" name="fax"><Input /></Item>
      <Item label="Email" name="email"><Input /></Item>
      <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
    </FormStyles>
  )
}

export default Form;

const FormStyles = styled(AntForm)`
  .ant-form-item {
    margin-bottom: 12px;
  }

  > div:last-child {
    text-align: right;
  }
`;