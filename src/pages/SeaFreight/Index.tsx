import React, { Component } from 'react';

import { simpleQuery } from '../../utils/query';

import Template from '../../components/TableTemplate';
import View from './View';
import Form from './Form';

import { seaFreight, routes, handlers, carriers, containerGroup } from '../../Queries.json';
const { tableQuery: routeQuery } = routes;
const { tableQuery: handlerQuery } = handlers;
const { tableQuery: carrierQuery } = carriers;
const { tableQuery: containerGroupQuery } = containerGroup;

interface ISeaFreightState {
  routes: Array<any>
  handlers: Array<any>
  carriers: Array<any>
  containerGroups: Array<any>
}

class SeaFreight extends Component<never, ISeaFreightState> {
  constructor(props: never) {
    super(props);
    this.state = {
      routes: [],
      handlers: [],
      carriers: [],
      containerGroups: []
    };
    this.initializeData = this.initializeData.bind(this);
    this.initializeData();
  }

  async initializeData() {
    const routes = await simpleQuery(routeQuery) as Array<any>;
    const handlers = await simpleQuery(handlerQuery) as Array<any>;
    const carriers = await simpleQuery(carrierQuery) as Array<any>;
    const containerGroups = await simpleQuery(containerGroupQuery) as Array<any>;
    this.setState({ routes, handlers, carriers, containerGroups });
  }

  render() {
    const { routes, handlers, carriers, containerGroups } = this.state;
    return (
      <Template
        pageKey="seaFreight"
        primaryKey="nocontainer"
        queries={seaFreight}
        View={View}
        Form={Form}
        extraData={data => data.map(entry => {
          const timeDifference = Math.abs(entry.tgltiba - entry.tglmuat);
          const dateDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
          return { ...entry, lamatiba: dateDifference };
        })}
        columns={[
          {
            title: "Arrival Date",
            dataIndex: "tgltiba",
            render: (date: Date) => date?.toDateString(),
            sorter: (a: any, b: any) => a.tgltiba - b.tgltiba
          },
          {
            title: "Container Number",
            dataIndex: "nocontainer",
            sorter: (a: any, b: any) => (a.nocontainer as string).localeCompare(b.nocontainer)
          },
          {
            title: "Route Description",
            dataIndex: "rute",
            render: (routeId) => routes.find(route => route.rutecode === routeId)?.rutedesc,
            sorter: (a: any, b: any) => a.rute - b.rute
          },
          {
            title: "Handler",
            dataIndex: "pengurus",
            render: (handlerId) => handlers.find(handler => handler.penguruscode === handlerId)?.pengurusname,
            sorter: (a: any, b: any) => a.pengurus - b.pengurus
          },
          {
            title: "Carrier",
            dataIndex: "shipper",
            render: (shipperId) => carriers.find(carrier => carrier.shippercode === shipperId)?.name,
            sorter: (a: any, b: any) => a.shipper - b.shipper
          },
          {
            title: "Container Group",
            dataIndex: "kelcontainer",
            render: (containerId) => containerGroups.find(group => group.containercode === containerId)?.containerdesc,
            sorter: (a: any, b: any) => a.kelcontainer - b.kelcontainer
          },
          {
            title: "Days to Ship",
            dataIndex: "lamatiba",
            sorter: (a: any, b: any) => a.lamatiba - b.lamatiba
          }
        ]} />
    );
  }
}

export default SeaFreight;