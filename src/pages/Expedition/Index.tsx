import React, { FC } from 'react';

import Template from '../../components/TableTemplate';
import Form from './Form';

import { expedition } from '../../Queries.json';

const Expedition: FC = () => {
  return (
    <Template width={600}
      pageKey="expeditions"
      dataKey="expedisicode"
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
          dataIndex: "rutename",
          key: "rutename"
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