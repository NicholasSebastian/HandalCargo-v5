import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Space, Statistic } from 'antd';
import { TeamOutlined, AppstoreOutlined } from '@ant-design/icons';
import { simpleQuery } from '../utils/query';

// https://charts.ant.design/

interface IDashboardState {
  // here
}

class Dashboard extends PureComponent<never, IDashboardState> {
  constructor(props: never) {
    super(props);
    this.state = {
      // here
    };
    this.initializeData = this.initializeData.bind(this);
    this.initializeData();
  }

  initializeData() {
    // here
  }

  render() {
    return (
      <DashboardStyles direction='vertical' size='large'>
        <StatisticsStyles>
          <Statistic title="Air Cargo Markings" value={100} prefix={<AppstoreOutlined />} />
          <Statistic title="Sea Freight Markings" value={100} prefix={<AppstoreOutlined />} />
          <Statistic title="Total Customers" value={100} prefix={<TeamOutlined />} />
        </StatisticsStyles>
        <Panel>Dashboard</Panel>
      </DashboardStyles>
    );
  }
}

export default Dashboard;

const DashboardStyles = styled(Space)`
  width: 100%;
`;

const StatisticsStyles = styled.div`
  background-color: #fff;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`;

const Panel = styled.div`
  background-color: #fff;
  padding: 20px;
`;
