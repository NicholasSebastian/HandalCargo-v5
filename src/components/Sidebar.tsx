import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import { Typography, Layout, Menu, Modal, Input, Space, message } from 'antd';
import { 
  DropboxOutlined, AppstoreAddOutlined, CopyOutlined, UserOutlined, SettingOutlined, 
  CloseCircleOutlined, KeyOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Sider } = Layout;
const { SubMenu, Item } = Menu;
const { confirm } = Modal;
const { Password } = Input;

interface ISidebarProps {
  collapse: boolean
  activePage: string
  changeToPage: (targetKey: string) => void
}

interface ISidebarState {
  currentlyOpen: Array<string>
}

class Sidebar extends Component<ISidebarProps, ISidebarState> {
  constructor(props: ISidebarProps) {
    super(props);
    this.state = {
      currentlyOpen: [],
    }
    this.handleSubMenuOpen = this.handleSubMenuOpen.bind(this);
    this.openSubMenu = this.openSubMenu.bind(this);
  }

  handleSubMenuOpen(openKeys: React.ReactText[]) {
    const isClosing = openKeys.length === 0;
    if (isClosing) {
      this.setState({ currentlyOpen: [] });
    }
    else {
      const newTab = openKeys[openKeys.length - 1] as string;
      this.openSubMenu(newTab);
    }
  }

  openSubMenu(newTab: string) {
    const { level } = JSON.parse(window.sessionStorage.getItem('profile')!);

    const level2Restriction = (newTab === 'item_2');
    const level3Restriction = (newTab === 'item_3' || newTab === 'item_4');

    if ((level3Restriction && level < 3) || (level2Restriction && level < 2)) {
      this.promptAccess(() => this.setState({ currentlyOpen: [newTab as string] }));
    }
    else {
      this.setState({ currentlyOpen: [newTab as string] });
    }
  }

  promptAccess(callback: () => void) {
    const passwordRef = createRef<any>();
    const content = (
      <Space direction="vertical">
        <Text>You do not have permission to access this section.</Text>
        <Password ref={passwordRef} placeholder="Master Key" 
          prefix={<KeyOutlined style={{ color: 'gray' }} />} />
      </Space>
    );

    confirm({
      title: 'Account Access Denied',
      icon: <CloseCircleOutlined />,
      content,
      okText: 'Unlock',
      okType: 'danger',
      cancelText: 'Back',
      maskClosable: true,
      onOk() {
        const enteredPassword = passwordRef.current!.state.value as string;
        if (enteredPassword === 'test') { // temporary password
          message.success('Access Granted');
          callback();
        }
        else {
          message.error('Invalid Password');
        }
      }
    });
  }

  render() {
    const { collapse, activePage, changeToPage } = this.props;
    const { currentlyOpen } = this.state;
    return (
      <SidebarStyles width={250} collapsed={collapse}>
        <Title level={3}>{collapse ? 'HC' : 'Handal Cargo'}</Title>
        <Menu mode="inline" theme="dark"
          selectedKeys={[activePage]}
          openKeys={currentlyOpen} 
          onOpenChange={this.handleSubMenuOpen}
          onClick={({ key }) => changeToPage(key.toString())}>
          <SubMenu icon={<DropboxOutlined/>} title="Shipping">
            <Item key="airCargo">Air Cargo</Item>
            <Item key="seaFreight">Sea Freight</Item>
            <Item key="invoiceEntry">Invoice Entry</Item>
            <Item key="payment">Payment</Item>
            <Item key="customers">Customers</Item>
          </SubMenu>
          <SubMenu icon={<AppstoreAddOutlined/>} title="References">
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
            <Item key="staffGroups">Staff Groups</Item>
            <Item key="accessLevels">Access Levels</Item>
            <Item key="companySetup">Company Setup</Item>
          </SubMenu>
          <SubMenu icon={<SettingOutlined/>} title="Settings">
            <Item key="backupRestore">Backup and Restore</Item>
          </SubMenu>
        </Menu>
      </SidebarStyles>
    );
  }
}

export default Sidebar;

const SidebarStyles = styled(Sider)`
  > div {
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;

    > h3 {
      color: #fff;
      text-align: center;
      margin: 20px 0;
    }

    > button {
      position: absolute;
      left: 10px;
      bottom: 10px;
    }
  }
`;
