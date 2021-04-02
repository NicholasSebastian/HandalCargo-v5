import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Form as AntForm, FormInstance, Input, Button } from 'antd';
import { Store } from 'antd/lib/form/interface';

import { IFormProps } from '../../components/TableTemplate';

import scrollToTop from '../../utils/scrollModal';

import { expedition } from '../../Queries.json';
const { formQuery, insertQuery, updateQuery } = expedition;

const { TextArea } = Input;

interface IFormState {
  initialData: Store
}

class Form extends Component<IFormProps, IFormState> {
  formRef: React.RefObject<FormInstance>;

  constructor(props: IFormProps) {
    super(props);
    this.state = {
      initialData: {}
    };
    this.formRef = createRef();
    this.initializeData = this.initializeData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.initializeData();
  }

  initializeData() {
    const { entryId } = this.props;
    if (entryId) {
      // Initialize 'edit' form values.
      ipcRenderer.once('formQuery', (event, data) => {
        this.setState({ initialData: data });
        this.formRef.current?.resetFields();
      });
      ipcRenderer.send('queryValues', formQuery, [entryId], 'formQuery');
    }
  }

  handleSubmit(values: any) {
    // TODO: Submit values to database here.
  }

  render() {
    const { Item } = AntForm;
    const { initialData } = this.state;

    return (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} onFinishFailed={scrollToTop} 
        initialValues={initialData}>
        {/* TODO: here */}
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