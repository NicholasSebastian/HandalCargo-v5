import React, { Component } from 'react';
import styled from 'styled-components';
import { Table, Statistic } from 'antd';

class Template extends Component {
  // columns using colSpan

  render() {
    return (
      <TemplateStyles>
        <div>Statistics</div>
        <div>
          Stuff
          <Table dataSource={} columns={} /* Filter and Sorter, Fixed Header, No Data */ />
        </div>
      </TemplateStyles>
    );
  }
}

export default Template;

const TemplateStyles = styled.div`
  display: grid;
  grid-template-rows: 100px 1fr;
  row-gap: 20px;

  > div {
    background-color: #fff;
  }
`;
