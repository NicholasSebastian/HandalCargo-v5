import React, { Component } from 'react';

import { simpleQuery } from '../../utils/query';

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

  async initializeData() {
    const routes = await simpleQuery(routeQuery) as Array<any>;
    const planes = await simpleQuery(planeQuery) as Array<any>;
    this.setState({ routes, planes });
  }

	render() {
    const { routes, planes } = this.state;
		return (
			<Template 
        pageKey="airCargo" 
        primaryKey="no"
        queries={airCargo} 
        View={View}
        Form={Form}
        extraDelete={['markingDeleteQuery']}
        columns={[
          {
            title: 'Arrival Date',
            dataIndex: 'tgltiba',
            render: (date: Date) => date?.toDateString(),
            sorter: (a: any, b: any) => a.tgltiba - b.tgltiba
          },
          {
            title: 'Airway Bill Number',
            dataIndex: 'no',
            sorter: (a: any, b: any) => (a.no as string).localeCompare(b.no)
          },
          {
            title: 'Item Code',
            dataIndex: 'kode',
            sorter: (a: any, b: any) => (a.kode as string).localeCompare(b.kode)
          },
          {
            title: 'Route Description',
            dataIndex: 'rute',
            render: (routeId) => routes.find(route => route.rutecode === routeId)?.rutedesc,
            sorter: (a: any, b: any) => a.rute - b.rute
          },
          {
            title: 'Airplane',
            dataIndex: 'pesawat',
            render: (planeId) => planes.find(plane => plane.pesawatcode === planeId)?.pesawatdesc,
            sorter: (a: any, b: any) => a.pesawat - b.pesawat
          }
        ]} />
		);
	}
}

export default AirCargo;
