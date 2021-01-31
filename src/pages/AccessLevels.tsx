import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Typography, Tag, Divider } from 'antd';

const { Title, Text } = Typography;

class AccessLevels extends PureComponent {
  render() {
    return (
      <AccessLevelStyles>
        <Title level={5}>Users are feature restricted by their access level in accordance to the following:</Title>
        <Text>This is non-editable.</Text>
        <div><span>Level 3</span><Title level={4}>Master</Title></div>
        <div>
          <Tag color ='blue'>Shipping</Tag>
          <Tag color ='geekblue'>References</Tag>
          <Tag color ='purple'>Reports</Tag>
          <Tag color ='magenta'>Master</Tag>
          <Tag color ='red'>Settings</Tag>
        </div>
        <Divider orientation='left' />
        <div><span>Level 2</span><Title level={4}>Manager</Title></div>
        <div>
          <Tag color ='blue'>Shipping</Tag>
          <Tag color ='geekblue'>References</Tag>
          <Tag color ='purple'>Reports</Tag>
        </div>
        <Divider orientation='left' />
        <div><span>Level 1</span><Title level={4}>Employee</Title></div>
        <div>
          <Tag color ='blue'>Shipping</Tag>
          <Tag color ='geekblue'>References</Tag>
        </div>
      </AccessLevelStyles>
    );
  }
}

export default AccessLevels;

const AccessLevelStyles = styled.div`
  background-color: #fff;
  padding: 20px 20px 40px 20px;

  > h5 { margin-bottom: 0; }
  > span:first-of-type {
    display: block;
    margin-bottom: 20px;
    font-size: small;
  }

  h4 { 
    display: inline-block; 
    margin-left: 10px;
  }
`;