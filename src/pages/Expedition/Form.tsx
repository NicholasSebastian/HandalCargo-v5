import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Form as AntForm, FormInstance, Input, Select, Button, message } from 'antd';
import { Store } from 'antd/lib/form/interface';

import { IFormProps } from '../../components/TableTemplate';
import scrollToTop from '../../utils/scrollModal';

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

  initializeData() {
    const { entryId } = this.props;
    if (entryId) {
      // Initialize 'edit' form values.
      ipcRenderer.once('formQuery', (event, data) => {
        ipcRenderer.once('routeQuery', (event, routes) => {
          this.setState({ initialData: data[0], routes });
          this.formRef.current?.resetFields();
        });
        ipcRenderer.send('query', routeQuery, 'routeQuery');
      });
      ipcRenderer.send('queryValues', formQuery, [entryId], 'formQuery');
    }
  }

  handleSubmit(values: any) {
    const { entryId, closeModal } = this.props;
    const formValues = Object.values(values);
    if (entryId) {
      // Edit form on submit.
      ipcRenderer.once('expeditionUpdateQuery', () => {
        message.success(`'${entryId}' successfully updated`);
        closeModal();
      });
      ipcRenderer.send('queryValues', updateQuery, [...formValues, entryId], 'expeditionUpdateQuery');
    }
    else {
      // Add form on submit.
      ipcRenderer.once('expeditionInsertQuery', () => {
        message.success('Entry successfully added');
        closeModal();
      });
      ipcRenderer.send('queryValues', insertQuery, formValues, 'expeditionInsertQuery');
    }
  }

  render() {
    const { Item } = AntForm;
    const { TextArea } = Input;
    const { Option } = Select;
    const { initialData, routes } = this.state;

    return (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} onFinishFailed={scrollToTop} 
        initialValues={initialData}>
        <Item label="Expedition Code" name="expedisicode"><Input /></Item>
        <Item label="Name" name="expedisiname"><Input /></Item>
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