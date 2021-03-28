import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { FormInstance, Form as AntForm, Input, InputNumber, Button, message } from 'antd';
import { Store } from 'antd/lib/form/interface';

import scrollToTop from '../utils/scrollModal';
import { IQueries, IFormData } from './ListTemplate';

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
    this.initializeData();

    this.formRef = createRef();

    this.initializeData = this.initializeData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  initializeData() {
    const { entryId, queries } = this.props;
    const { formQuery } = queries;
    if (entryId) {
      // Initialize 'edit' form values.
      ipcRenderer.once('listFormQuery', (event, data) => {
        this.setState({ initialValues: { ...data[0] } });
        this.formRef.current?.resetFields();
      });
      ipcRenderer.send('queryValues', formQuery, [entryId], 'listFormQuery');
    }
    else {
      // Initialize 'add' form values.
      this.setState({ initialValues: {} });
      this.formRef.current?.resetFields();
    }
  }

  handleSubmit(values: any) {
    const { entryId, queries, closeModal } = this.props;
    const { insertQuery, updateQuery } = queries;
    const rawValues = Object.values(values);
    if (entryId) {
      // Edit form on submit.
      ipcRenderer.once('listUpdateQuery', () => {
        message.success(`'${rawValues[1]}' successfully updated`);
        closeModal();
      });
      ipcRenderer.send('queryValues', updateQuery, [...rawValues, entryId], 'listUpdateQuery');
    }
    else {
      // Add form on submit.
      ipcRenderer.once('listInsertQuery', () => {
        message.success('Entry successfully added');
        closeModal();
      });
      ipcRenderer.send('queryValues', insertQuery, rawValues, 'listInsertQuery');
    }
  }

  render() {
    const { Item } = AntForm;
    return (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} initialValues={this.state.initialValues}>
        <Item label={this.props.formItems[0].label} name={this.props.formItems[0].key}
          rules={[{ required: true, message: `${this.props.formItems[0].label} is required` }]}>
          <InputNumber min={0} />
        </Item>
        <Item label={this.props.formItems[1].label} name={this.props.formItems[1].key}
          rules={[{ required: true, message: `${this.props.formItems[1].label} is required` }]}>
          <Input />
        </Item>
        {this.props.formItems[2] &&
          <Item label={this.props.formItems[2].label} name={this.props.formItems[2].key}>
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