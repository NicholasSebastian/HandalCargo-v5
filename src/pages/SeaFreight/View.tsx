import React, { FC } from 'react';
import { Descriptions, Divider } from 'antd';

import { IViewProps } from '../../components/TableTemplate';

const View: FC<IViewProps> = (props) => {
  const { data } = props;
  const { Item } = Descriptions;

  // TODO: Change this to display the UI nicely.

  return (
    <Descriptions labelStyle={{ fontWeight: 500 }}>
      {}
    </Descriptions>
  );
}

export default View;