import React, { Component } from 'react';

import Template from '../../components/TableTemplate';
import View from './View';
import Form from './Form';

import { customers } from '../../Queries.json';

class Customers extends Component {
  render() {
    return (
      <Template
        pageKey='customers'
        primaryKey='marking'
        secondaryKey='customerid'
        searchKey='customername'
        queries={customers}
        View={View}
        Form={Form}
        columns={[
          {
            title: 'ID',
            dataIndex: 'customerid',
            sorter: (a: any, b: any) => (a.no as string).localeCompare(b.no)
          },
          {
            title: 'Customer',
            dataIndex: 'customername',
            sorter: (a: any, b: any) => (a.no as string).localeCompare(b.no)
          },
          {
            title: 'Marking',
            dataIndex: 'marking',
            sorter: (a: any, b: any) => (a.no as string).localeCompare(b.no)
          },
          {
            title: 'Company',
            dataIndex: 'company',
            sorter: (a: any, b: any) => (a.no as string).localeCompare(b.no)
          },
          {
            title: 'Phone 1',
            dataIndex: 'officephone1',
          },
          {
            title: 'Phone 2',
            dataIndex: 'officephone2',
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (value) => value ? 
              <span style={{ color: 'green' }}>Active</span> : 
              <span style={{ color: 'red' }}>Inactive</span>
          }
        ]} />
    );
  }
}

export default Customers;