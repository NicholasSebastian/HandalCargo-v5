import React, { Component } from 'react';

import Template from '../../components/TableTemplate';
import View from './View';
import Form from './Form';

import { airCargo } from '../../Queries.json';

class AirCargo extends Component {
	render() {
		return (
			<Template 
        pageKey="airCargo" 
        dataKey="no"
        queries={airCargo} 
        View={View}
        Form={Form}
        columns={[ // TODO: sorter
          {
            title: 'Arrival Date',
            dataIndex: 'tgltiba',
            key: 'tgltiba'
          },
          {
            title: 'Airway Bill Number',
            dataIndex: 'no',
            key: 'no'
          },
          {
            title: 'Item Code',
            dataIndex: 'kode',
            key: 'kode'
          },
          {
            title: 'Route Description',
            dataIndex: 'rute',
            key: 'rute'
          },
          {
            title: 'Airplane',
            dataIndex: 'pesawat',
            key: 'pesawat'
          },
          {
            title: 'Total Payload',
            dataIndex: 'totalmuatan',
            key: 'totalmuatan'
          },
          {
            title: 'Total Weight',
            dataIndex: 'totalberat[hb]',
            key: 'totalberat[hb]'
          }
        ]} />
		);
	}
}

export default AirCargo;
