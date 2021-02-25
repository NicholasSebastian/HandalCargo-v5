import React, { Component, createContext } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Layout as AntLayout, Tabs, message, PageHeader } from 'antd';

import Header from './Header';
import Sidebar from './Sidebar';

import Dashboard from '../pages/Dashboard';
import Welcome from '../pages/Welcome';
import Profile from '../pages/Profile';
import AirCargo from '../pages/AirCargo';
import ContainerGroups from '../pages/ContainerGroups';
import Carriers from '../pages/Carriers';
import Routes from '../pages/Route';
import Handlers from '../pages/Handlers';
import Planes from '../pages/Planes';
import Currencies from '../pages/Currencies';
import ProductDetails from '../pages/ProductDetails';
import Staff from '../pages/Staff';
import StaffGroups from '../pages/StaffGroups';
import AccessLevels from '../pages/AccessLevels';
import Mail from '../pages/Mail';
  
const { Content } = AntLayout;
const { TabPane } = Tabs;

interface ILayoutState {
  activeTab: string
  tabs: Array<IPage>
  collapse: boolean // lifting state up from sidebar.
}

interface IPage {
  key: string
  title: string
  content: JSX.Element
}

const pages: Array<IPage> = [
  { key: 'dashboard', title: 'Dashboard', content: <Dashboard /> },
  { key: 'welcome', title: 'Welcome', content: <Welcome /> },
  { key: 'profile', title: 'Profile', content: <Profile /> },
  { key: 'airCargo', title: 'Air Cargo', content: <AirCargo /> },
  { key: 'containerGroups', title: 'Container Groups', content: <ContainerGroups /> },
  { key: 'carriers', title: 'Carriers', content: <Carriers /> },
  { key: 'routes', title: 'Routes', content: <Routes /> },
  { key: 'handlers', title: 'Handlers', content: <Handlers /> },
  { key: 'planes', title: 'Planes', content: <Planes /> },
  { key: 'currencies', title: 'Currencies', content: <Currencies /> },
  { key: 'productDetails', title: 'Product Details', content: <ProductDetails /> },
  { key: 'staff', title: 'Staff', content: <Staff /> },
  { key: 'staffGroups', title: 'Staff Groups', content: <StaffGroups /> },
  { key: 'accessLevels', title: 'Access Levels', content: <AccessLevels /> },
  { key: 'mail', title: 'Messages', content: <Mail /> }
];

const pageContext = createContext('');

class Layout extends Component<{}, ILayoutState> {
  constructor(props: {}) {
    super(props);

    const { level } = JSON.parse(window.sessionStorage.getItem('profile')!);
    const defaultPage = level > 1 ? pages[0] : pages[1];

    this.state = {
      activeTab: defaultPage.key,
      tabs: [defaultPage],
      collapse: false
    };
    
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.changeToPage = this.changeToPage.bind(this);
    this.handleTab = this.handleTab.bind(this);
    this.setActiveTab = this.setActiveTab.bind(this);
    this.addTab = this.addTab.bind(this);
    this.removeTab = this.removeTab.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('prompt', (event, text) => {
      message.error(text);
    });
  }

  toggleCollapse() {
    this.setState({ collapse: !this.state.collapse });
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
        <Sidebar collapse={this.state.collapse} activePage={this.state.activeTab} changeToPage={this.changeToPage} />
        <AntLayout>
          <Header collapse={this.state.collapse} toggleCollapse={this.toggleCollapse} changeToPage={this.changeToPage} />
          <Content>
            <Tabs type='editable-card' hideAdd
              activeKey={this.state.activeTab} onChange={this.setActiveTab}
              onEdit={this.handleTab}>
              {this.state.tabs.map(({ key, title, content }) => (
                <TabPane key={key} tab={title}>
                  <PageHeader ghost={false} title={title} />
                  <div>
                    <pageContext.Provider value={this.state.activeTab}>
                      {content}
                    </pageContext.Provider>
                  </div>
                </TabPane>
              ))}
            </Tabs>
          </Content>
        </AntLayout>
      </LayoutStyles>
    )
  }
}

export { pageContext };
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
          grid-template-rows: auto 1fr;

          > div:first-child { padding: 16px 20px; }

          > div:last-child { 
            padding: 20px; 
            overflow-x: hidden;
            overflow-y: scroll;
          }
        }
      }
    }
  }
`;
