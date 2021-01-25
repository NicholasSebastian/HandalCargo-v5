import React, { Component } from 'react';
import styled from 'styled-components';
import { Layout, Menu, Button } from 'antd';
import { 
  DropboxOutlined, WindowsOutlined, CopyOutlined, UserOutlined, SettingOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { SubMenu, Item } = Menu;

interface ISidebarProps {
  activePage: string
  changeToPage: (targetKey: string) => void
}

interface ISidebarState {
  collapse: boolean
  currentlyOpen: Array<string>
}

class Sidebar extends Component<ISidebarProps, ISidebarState> {
  constructor(props: ISidebarProps) {
    super(props);
    this.state = {
      collapse: false,
      currentlyOpen: []
    }
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.handleSubMenuOpen = this.handleSubMenuOpen.bind(this);
  }

  toggleCollapse() {
    this.setState({ collapse: !this.state.collapse });
  }

  handleSubMenuOpen(openKeys: React.ReactText[]) {
    if (openKeys.length > 1) {
      this.setState({ currentlyOpen: openKeys.slice(openKeys.length - 1) as Array<string> });
    }
    else {
      this.setState({ currentlyOpen: openKeys as Array<string> });
    }
  }

  render() {
    return (
      <SidebarStyles width={250} theme="light" collapsed={this.state.collapse}>
        <Menu mode="inline" 
          selectedKeys={[this.props.activePage]}
          openKeys={this.state.currentlyOpen} 
          onOpenChange={this.handleSubMenuOpen}
          onClick={({ key }) => this.props.changeToPage(key.toString())}>
          <SubMenu icon={<DropboxOutlined/>} title="Shipping">
            <Item key="airFreight">Air Freight</Item>
            <Item key="seaCargo">Sea Cargo</Item>
            <Item key="invoiceEntry">Invoice Entry</Item>
            <Item key="payment">Payment</Item>
            <Item key="customers">Customers</Item>
          </SubMenu>
          <SubMenu icon={<WindowsOutlined/>} title="References">
            <Item key="containerGroups">Container Groups</Item>
            <Item key="carriers">Carriers</Item>
            <Item key="routes">Routes</Item>
            <Item key="handlers">Handlers</Item>
            <Item key="planes">Planes</Item>
            <Item key="currencies">Currencies</Item>
            <Item key="productDetails">Product Details</Item>
            <Item key="expeditions">Expeditions</Item>
          </SubMenu>
          <SubMenu icon={<CopyOutlined/>} title="Reports">
            <Item key="dashboard">Dashboard</Item>
            <Item key="payroll">Payroll</Item>
          </SubMenu>
          <SubMenu icon={<UserOutlined />} title="Master">
            <Item key="staff">Staff</Item>
            <Item key="staffGroup">Staff Groups</Item>
            <Item key="accessLevels">Access Levels</Item>
            <Item key="companySetup">Company Setup</Item>
          </SubMenu>
          <SubMenu icon={<SettingOutlined/>} title="Settings">
            <Item key="databaseSetup">Database Setup</Item>
            <Item key="backupRestore">Backup and Restore</Item>
          </SubMenu>
        </Menu>
        <Button shape="circle" 
          onClick={this.toggleCollapse}
          icon={this.state.collapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} />
      </SidebarStyles>
    );
  }
}

export default Sidebar;

const SidebarStyles = styled(Sider)`
  > div {
    position: relative;

    > ul {
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
    }

    > button {
      position: absolute;
      left: 10px;
      bottom: 10px;
    }
  }
`;
