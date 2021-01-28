import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Statistic } from 'antd';

const { Item } = List;

class Template extends Component {
  render() {
    return (
      <TemplateStyles>
        <div>Statistics</div>
        <div>
          Stuff
          <List>
            <Item>test</Item>
          </List>
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
