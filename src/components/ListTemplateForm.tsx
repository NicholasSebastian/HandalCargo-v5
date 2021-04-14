import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import { FormInstance, Form as AntForm, Input, InputNumber, Button, message } from 'antd';
import { Store } from 'antd/lib/form/interface';

import { IQueries, IFormData } from './ListTemplate';
import Loading from './Loading';

import { query, simpleQuery } from '../utils/query';
import isEmpty from '../utils/isEmptyObject';

interface IFormItem {
  label: string
  key: string
}

interface IFormProps extends IFormData {
  closeModal: () => void
  queries: IQueries
  formItems: Array<IFormItem>
}

interface IFormState {
  initialValues: Store
}

class Form extends Component<IFormProps, IFormState> {
  formRef: React.RefObject<FormInstance>;

  constructor(props: IFormProps) {
    super(props);
    this.state = {
      initialValues: {}
    };
    this.formRef = createRef();
    this.initializeData = this.initializeData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.initializeData();
  }

  async initializeData() {
    const { entryId, queries } = this.props;
    const { formQuery } = queries;
    if (entryId) {
      // Initialize 'edit' form values.
      const data = await query(formQuery, [entryId]) as Array<any>;
      const entry = data[0];
      this.setState({ initialValues: entry });
      this.formRef.current?.resetFields();
    }
  }

  handleSubmit(values: any) {
    const { entryId, queries, closeModal } = this.props;
    const { insertQuery, updateQuery } = queries;
    const rawValues = Object.values(values);
    if (entryId) {
      // Edit form on submit.
      query(updateQuery, [...rawValues, entryId])
      .then(() => {
        message.success(`'${entryId}' successfully updated`);
        closeModal();
      })
      .catch(e => message.error(e.message));
    }
    else {
      // Add form on submit.
      query(insertQuery, rawValues)
      .then(() => {
        message.success('Entry successfully added');
        closeModal();
      })
      .catch(e => message.error(e.message));
    }
  }

  render() {
    const { Item } = AntForm;
    const { entryId, formItems } = this.props;
    const { initialValues } = this.state;
    const isLoading = entryId ? isEmpty(initialValues) : false;
    return isLoading ? <Loading /> : (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} initialValues={initialValues}>
        <Item label={formItems[0].label} name={formItems[0].key}
          rules={[{ required: true, message: `${formItems[0].label} is required` }]}>
          <InputNumber min={0} type='number' />
        </Item>
        <Item label={formItems[1].label} name={formItems[1].key}
          rules={[{ required: true, message: `${formItems[1].label} is required` }]}>
          <Input />
        </Item>
        {formItems[2] &&
          <Item label={formItems[2].label} name={formItems[2].key}>
            <Input />
          </Item>
        }
        <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
      </FormStyles>
    );
  }
}

export { IFormItem };
export default Form;

const FormStyles = styled(AntForm)`
  width: 500px;
  margin: 0 auto;

  > div:last-child {
    text-align: right;
  }
`;