import React, { FC, useState, useEffect } from 'react';

import { simpleQuery } from '../../utils/query';

import Template from '../../components/TableTemplate';
import Form from './Form';

import { expedition, routes } from '../../Queries.json';
const { tableQuery: routeQuery } = routes;

const Expedition: FC = () => {
  const [routes, setRoutes] = useState<Array<any> | null>(null);
  useEffect(() => {
    simpleQuery(routeQuery).then((routes: any) => setRoutes(routes));
  }, []);

  return (
    <Template width={600}
      pageKey="expeditions"
      primaryKey="expedisicode"
      queries={expedition}
      Form={Form}
      columns={[
        {
          title: "Expedition Code",
          dataIndex: "expedisicode",
          key: "expedisicode"
        },
        {
          title: "Name",
          dataIndex: "expedisiname",
          key: "expedisiname"
        },
        {
          title: "Route Name",
          dataIndex: "ruteid",
          key: "ruteid",
          render: (routeid: number) => routes?.find(route => route.rutecode === routeid)?.rutedesc
        },
        {
          title: "Address",
          dataIndex: "alamat",
          key: "alamat"
        },
        {
          title: "Phone 1",
          dataIndex: "phone1",
          key: "phone1"
        },
        {
          title: "Phone 2",
          dataIndex: "phone2",
          key: "phone2"
        },
        {
          title: "Fax",
          dataIndex: "fax",
          key: "fax"
        },
        {
          title: "Description",
          dataIndex: "keterangan",
          key: "keterangan"
        }
      ]} />
  );
}

export default Expedition;