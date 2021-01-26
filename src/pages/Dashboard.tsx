import React, { PureComponent } from 'react';
import styled from 'styled-components';

class Dashboard extends PureComponent {
  render() {
    return (
      <DashboardStyles>
        <Panel>Dashboard</Panel>
        <Panel>Dashboard</Panel>
        <Panel>Dashboard</Panel>
      </DashboardStyles>
    );
  }
}

export default Dashboard;

const DashboardStyles = styled.div`
  // here
`;

const Panel = styled.div`
  background-color: #fff;
  padding: 20px;
`;
