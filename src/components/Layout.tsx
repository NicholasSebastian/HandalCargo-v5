import React, { Component } from 'react';
import styled from 'styled-components';
import { Layout as AntLayout, Tabs, message, Typography } from 'antd';

import Header from './Header';
import Sidebar from './Sidebar';

import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Staff from '../pages/Staff';

const { Title } = Typography;
const { Content } = AntLayout;
const { TabPane } = Tabs;

interface ILayoutState {
  activeTab: string
  tabs: Array<IPage>
}

interface IPage {
  key: string
  title: string
  content: JSX.Element
}

const pages: Array<IPage> = [
  { key: 'dashboard', title: 'Dashboard', content: <Dashboard /> },
  { key: 'profile', title: 'Profile', content: <Profile /> },
  { key: 'staff', title: 'Staff', content: <Staff /> }
];

class Layout extends Component<{}, ILayoutState> {
  constructor(props: {}) {
    super(props);
    const defaultPage = pages[0]
    this.state = {
      activeTab: defaultPage.key,
      tabs: [defaultPage]
    };
    this.changeToPage = this.changeToPage.bind(this);
    this.handleTab = this.handleTab.bind(this);
    this.setActiveTab = this.setActiveTab.bind(this);
    this.addTab = this.addTab.bind(this);
    this.removeTab = this.removeTab.bind(this);
  }

  changeToPage(targetKey: string) {
    const isInTabs = this.state.tabs.findIndex(tab => tab.key === targetKey) !== -1;
    if (isInTabs) {
      this.setActiveTab(targetKey.toString());
    }
    else {
      this.addTab(targetKey.toString());
    }
  }

  setActiveTab(activeKey: string) {
    this.setState({ activeTab: activeKey });
  }

  handleTab(targetKey: any, action: "add" | "remove") {
    switch(action) {
      case 'add':
        this.addTab(targetKey as string);
        break;
      case 'remove':
        this.removeTab(targetKey as string);
        break;
    }
  }

  addTab(targetKey: string) {
    const targetPage = pages.find(page => page.key === targetKey);
    if (targetPage) {
      this.setState({ 
        tabs: [...this.state.tabs, targetPage],
        activeTab: targetKey
      });
    }
  }

  removeTab(targetKey: string) {
    const tabs = this.state.tabs.filter(tab => tab.key !== targetKey);
    if (tabs.length === 0) {
      message.error('Must have at least 1 active tab');
      return;
    }

    const currentlyOpen = this.state.activeTab === targetKey;
    if (!currentlyOpen) {
      this.setState({ tabs });
    }
    else {
      const currentIndex = this.state.tabs.findIndex(tab => tab.key === this.state.activeTab);
      const activeTab = this.state.tabs[currentIndex === 0 ? currentIndex + 1 : currentIndex - 1].key;
      this.setState({ tabs, activeTab });
    }
  }

  render() {
    return (
      <LayoutStyles>
        <Header changeToPage={this.changeToPage} />
        <AntLayout>
          <Sidebar activePage={this.state.activeTab} changeToPage={this.changeToPage} />
          <Content>
            <Tabs type='editable-card' hideAdd
              activeKey={this.state.activeTab} onChange={this.setActiveTab}
              onEdit={this.handleTab}>
              {this.state.tabs.map(({ key, title, content }) => (
                <TabPane key={key} tab={title}>
                  <Title level={3}>{title}</Title>
                  <div>{content}</div>
                </TabPane>
              ))}
            </Tabs>
          </Content>
        </AntLayout>
      </LayoutStyles>
    )
  }
}

export default Layout;

const LayoutStyles = styled(AntLayout)`
  height: 100%;

  > section {
    height: 100%;

    > main > div {
      height: 100%;

      > div:first-child {
        margin-bottom: 0;
      }

      > div:last-child > div {
        height: 100%;

        > div {
          display: grid;
          grid-template-rows: 60px 1fr;

          > h3 {
            background-color: #fff;
            margin: 0;
            padding: 15px 20px;
          }

          > div {
            background-color: #fff;
            margin: 20px;
            padding: 20px;
          }
        }
      }
    }
  }
`;
