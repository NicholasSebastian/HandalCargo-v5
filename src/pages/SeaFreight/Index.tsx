import React, { Component } from 'react';

import Template from '../../components/TableTemplate';
import View from './View';
import Form from './Form';

import { seaFreight } from '../../Queries.json';

class SeaFreight extends Component {
  render() {
    return (
      <Template
        pageKey="seaFreight"
        dataKey="no"
        queries={seaFreight}
        View={View}
        Form={Form}
        columns={[ // TODO: sorter
          {
            title: "",
            dataIndex: "",
            key: ""
          },
          {
            title: "",
            dataIndex: "",
            key: ""
          },
          {
            title: "",
            dataIndex: "",
            key: ""
          },
          {
            title: "",
            dataIndex: "",
            key: ""
          },
          {
            title: "",
            dataIndex: "",
            key: ""
          },
          {
            title: "",
            dataIndex: "",
            key: ""
          },
          {
            title: "",
            dataIndex: "",
            key: ""
          }
        ]} />
    );
  }
}

export default SeaFreight;