import React, { FC } from 'react';
import { Descriptions, Divider } from 'antd';

import { IViewProps } from '../../components/TableTemplate';

const View: FC<IViewProps> = (props) => {
  const { data } = props;
  const { Item } = Descriptions;

  // TODO: Change this to display the UI nicely.

  const processedData = {
    ...data,
    tglmuat: data['tglmuat'].toString().substr(4, 11),
    tgltiba: data['tgltiba'].toString().substr(4, 11)
  };

  return (
    <Descriptions labelStyle={{ fontWeight: 500 }}>
      {Object.entries(processedData).map(([key, value]) => (
        <Item label={key} key={key}>{value}</Item>
      ))}
    </Descriptions>
  );
}

export default View;