import React, { Component } from 'react';
import { ipcRenderer } from 'electron';

import Template from '../../components/TableTemplate';
import View from './View';
import Form from './Form';

import { airCargo, routes, planes } from '../../Queries.json';
const { tableQuery: routeQuery } = routes;
const { tableQuery: planeQuery } = planes;

interface IAirCargoState {
  routes: Array<any>
  planes: Array<any>
}

class AirCargo extends Component<never, IAirCargoState> {
  constructor(props: never) {
    super(props);
    this.state = {
      routes: [],
      planes: []
    };
    this.initializeData = this.initializeData.bind(this);
    this.initializeData();
  }

  initializeData() {
    ipcRenderer.once('routeQuery', (event, routes) => {
      ipcRenderer.once('planeQuery', (event, planes) => {
        this.setState({ routes, planes });
      });
      ipcRenderer.send('query', planeQuery, 'planeQuery');
    });
    ipcRenderer.send('query', routeQuery, 'routeQuery');
  }

	render() {
    const { routes, planes } = this.state;
		return (
			<Template 
        pageKey="airCargo" 
        dataKey="no"
        queries={airCargo} 
        View={View}
        Form={Form}
        columns={[
          {
            title: 'Arrival Date',
            dataIndex: 'tgltiba',
            key: 'tgltiba',
            render: (date: Date) => date?.toDateString(),
            sorter: (a: any, b: any) => a.tgltiba - b.tgltiba
          },
          {
            title: 'Airway Bill Number',
            dataIndex: 'no',
            key: 'no',
            sorter: (a: any, b: any) => (a.no as string).localeCompare(b.no)
          },
          {
            title: 'Item Code',
            dataIndex: 'kode',
            key: 'kode',
            sorter: (a: any, b: any) => (a.kode as string).localeCompare(b.kode)
          },
          {
            title: 'Route Description',
            dataIndex: 'rute',
            key: 'rute',
            render: (routeId) => routes.find(route => route.rutecode === routeId)?.rutedesc,
            sorter: (a: any, b: any) => a.rute - b.rute
          },
          {
            title: 'Airplane',
            dataIndex: 'pesawat',
            key: 'pesawat',
            render: (planeId) => planes.find(plane => plane.pesawatcode === planeId)?.pesawatdesc,
            sorter: (a: any, b: any) => a.pesawat - b.pesawat
          }
        ]} />
		);
	}
}

export default AirCargo;
