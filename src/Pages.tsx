import React from 'react';
import { IPage } from './components/Layout';

import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import Profile from './pages/Profile';
import AirCargo from './pages/AirCargo/Index';
import SeaFreight from './pages/SeaFreight/Index';
import ContainerGroups from './pages/ContainerGroups';
import Carriers from './pages/Carriers';
import Routes from './pages/Route';
import Handlers from './pages/Handlers';
import Planes from './pages/Planes';
import Currencies from './pages/Currencies';
import ProductDetails from './pages/ProductDetails';
import Staff from './pages/Staff/Index';
import StaffGroups from './pages/StaffGroups';
import AccessLevels from './pages/AccessLevels';
import Mail from './pages/Mail';

const pages: Array<IPage> = [
  { key: 'dashboard', title: 'Dashboard', content: <Dashboard /> },
  { key: 'welcome', title: 'Welcome', content: <Welcome /> },
  { key: 'profile', title: 'Profile', content: <Profile /> },
  { key: 'airCargo', title: 'Air Cargo', content: <AirCargo /> },
  { key: 'seaFreight', title: 'Sea Freight', content: <SeaFreight /> },
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

export default pages;