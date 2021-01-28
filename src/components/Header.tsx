import React, { PureComponent } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Layout, Button, Tooltip, Dropdown, Menu, Modal, Avatar } from 'antd';
import { 
  MenuFoldOutlined, MenuUnfoldOutlined, OrderedListOutlined, CalculatorOutlined, MailOutlined,
  UserOutlined, TranslationOutlined, LogoutOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Item } = Menu;
const { confirm } = Modal;

interface IHeaderProps {
  collapse: boolean
  toggleCollapse: () => void
  changeToPage: (targetKey: string) => void
}

class Header extends PureComponent<IHeaderProps, {}> {

  handleLogout() {
    confirm({
      title: 'Log Out and Exit',
      icon: <ExclamationCircleOutlined />,
      content: 'This will close the application and its connection to the database.',
      maskClosable: true,
      onOk() {
        ipcRenderer.send('logout');
      }
    });
  }

  render() {
    const profile = JSON.parse(window.sessionStorage.getItem('profile')!);

    const overlay = (
      <Menu>
        <Item onClick={() => this.props.changeToPage('profile')} icon={<UserOutlined/>}>Profile</Item>
        <Item /* onClick={} */ icon={<TranslationOutlined/>}>Language</Item>
        <Item onClick={this.handleLogout} icon={<LogoutOutlined/>}>Log Out and Exit</Item>
      </Menu>
    );

    return (
      <HeaderStyles>
        <Button
          onClick={this.props.toggleCollapse}
          icon={this.props.collapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} />
        <div>
          <Tooltip title="Notes"><Button type="text" icon={<OrderedListOutlined />} /></Tooltip>
          <Tooltip title="Calculator"><Button type="text" icon={<CalculatorOutlined />} /></Tooltip>
          <Tooltip title="Mail"><Button type="text" icon={<MailOutlined />} /></Tooltip>
          <Dropdown overlay={overlay} placement="bottomRight">
            <Button type="text">
              <Avatar size={28} icon={<UserOutlined />} /* TODO: images */ />
              {profile.staffname}
            </Button>
          </Dropdown>
        </div>
      </HeaderStyles>
    );
  }
}

export default Header;

const HeaderStyles = styled(AntHeader)`
  background-color: #fff;
  height: 50px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  > div > button:last-child {
    > span:first-child {
      margin-top: -3px;
      margin-right: 7px;
    }
  }
`;
