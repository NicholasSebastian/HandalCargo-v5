import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Typography, Layout, Menu } from 'antd';

const { Header: AntHeader } = Layout;
const { Title } = Typography;
const { Item } = Menu;

interface IHeaderProps {
  changeToPage: (targetKey: string) => void
}

class Header extends PureComponent<IHeaderProps, {}> {
  render() {
    return (
      <HeaderStyles>
        <Title level={3}>Handal Cargo</Title>
        <Menu theme="dark" mode="horizontal" >
          <Item>A</Item>
          <Item>B</Item>
          <Item>C</Item>
          <Item onClick={() => this.props.changeToPage('profile')}>Profile</Item>
        </Menu>
      </HeaderStyles>
    );
  }
}

export default Header;

const HeaderStyles = styled(AntHeader)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  > h3 {
    color: #fff;
    margin-bottom: 5px;
  }
`;
