import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Typography, Form as AntForm, FormInstance, Button, Input, DatePicker, Select, message } from 'antd';
import { Store } from 'antd/lib/form/interface';
import moment from 'moment';

import { IFormProps } from '../../components/TableTemplate';
import Loading from '../../components/Loading';
import MarkingTable from './MarkingTable';

import { objectDatesToMoment, objectMomentToDates } from '../../utils/momentConverter';
import scrollToTop from '../../utils/scrollModal';
import isEmpty from '../../utils/isEmptyObject';

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
    ipcRenderer.once('conGroupQuery', (event, containerGroups) => {
      ipcRenderer.once('carrierQuery', (event, carriers) => {
        ipcRenderer.once('routeQuery', (event, routes) => {
          ipcRenderer.once('handlerQuery', (event, handlers) => {
            ipcRenderer.once('currencyQuery', (event, currencies) => {
              const { entryId } = this.props;
              if (entryId) {
                // Initialize 'edit' form values.
                ipcRenderer.once('formQuery', (event, data) => {
                  ipcRenderer.once('markingTableQuery', (event, markingData: Array<object>) => {
                    this.setState({ 
                      initialData: data[0],
                      markingData: markingData.map((entry, i) => ({ key: i, ...entry })),
                      containerGroups, carriers, routes, handlers, currencies
                    });
                    this.formRef.current?.resetFields();
                    this.calculateValues();
                    this.calculateMarkingValues();
                  });
                  ipcRenderer.send('queryValues', markingTableQuery, [data[0].nocontainer], 'markingTableQuery');
                });
                ipcRenderer.send('queryValues', formQuery, [entryId], 'formQuery');
              }
              else {
                // Initialize 'add' form values.
                this.setState({ containerGroups, carriers, routes, handlers, currencies });
                this.formRef.current?.resetFields();
                this.calculateValues();
              }
            });
            ipcRenderer.send('query', currencies.tableQuery, 'currencyQuery');
          });
          ipcRenderer.send('query', handlers.tableQuery, 'handlerQuery');
        });
        ipcRenderer.send('query', routes.tableQuery, 'routeQuery');
      });
      ipcRenderer.send('query', carriers.tableQuery, 'carrierQuery');
    });
    ipcRenderer.send('query', containerGroup.tableQuery, 'conGroupQuery');
  }

  handleSubmit(values: any) {
    const { entryId, closeModal } = this.props;
    
    const formValues = Object.values(values);
    const rawValues = objectMomentToDates(formValues);

    const { markingData } = this.state;
    const markingValues = markingData.map(entry => {
      delete entry.key;
      return { nocontainer: entryId, ...entry };
    });

    const withMultipleValues = (insertQuery: string, queryValues: Array<object>) => {
      const from = insertQuery.lastIndexOf('(');
      const queryEnd = insertQuery.substring(from);

      let newInsertQuery = insertQuery;
      for (let i = 0; i < queryValues.length - 1; i++) {
        newInsertQuery += `,${queryEnd}`;
      }
      
      const flattenedValues = queryValues.map(entry => Object.values(entry)).flat();
      return [newInsertQuery, flattenedValues];
    }

    if (entryId) {
      // Edit form on submit.
      ipcRenderer.once('seafreightUpdateQuery', () => {
        ipcRenderer.once('seafreightMarkingDeleteQuery', () => {
          if (markingValues.length > 0) {
            ipcRenderer.once('seafreightMarkingInsertQuery', () => {
              message.success(`'${entryId}' successfully updated`);
              closeModal();
            });
            ipcRenderer.send('queryValues', ...withMultipleValues(markingInsertQuery, markingValues), 'seafreightMarkingInsertQuery');
          }
        });
        ipcRenderer.send('queryValues', markingDeleteQuery, [entryId], 'seafreightMarkingDeleteQuery');
      });
      ipcRenderer.send('queryValues', updateQuery, [...rawValues, entryId], 'seafreightUpdateQuery');
    }
    else {
      // Add form on submit.
      ipcRenderer.once('seafreightInsertQuery', () => {
        if (markingValues.length > 0) {
          ipcRenderer.once('seafreightMarkingInsertQuery', () => {
            message.success('Entry successfully added');
            closeModal();
          });
          ipcRenderer.send('queryValues', ...withMultipleValues(markingInsertQuery, markingValues), 'seafreightMarkingInsertQuery');
        }
      });
      ipcRenderer.send('queryValues', insertQuery, rawValues, 'seafreightInsertQuery');
    }
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
    const { entryId } = this.props;
    const { initialData: data, markingData, containerGroups, carriers, routes, handlers, currencies } = this.state;
    const initialValues = objectDatesToMoment(data);

    console.log(initialValues);

    const isLoading = entryId ? isEmpty(data) : false;
    return isLoading ? <Loading /> : (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} onFieldsChange={this.calculateValues}
        onFinishFailed={scrollToTop} initialValues={initialValues}>
          <Title level={4}>Sea Freight</Title>
        <DoubleColumns>
          <div>
            {/* here */}
          </div>
          <div>
            {/* here */}
          </div>
        </DoubleColumns>
        <MarkingTable
          data={markingData}
          setData={data => this.setState({ markingData: data })}
          onUpdate={this.calculateMarkingValues} />
        <DoubleColumns>
          <div>
            {/* here */}
          </div>
          <div>
            {/* here */}
          </div>
        </DoubleColumns>
        <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
      </FormStyles>
    );
  }
}

export default Form;

const FormStyles = styled(AntForm)`
  .ant-form-item {
    margin-bottom: 12px;
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