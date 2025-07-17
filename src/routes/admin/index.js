import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

import Dashboard from './dashboard';

import withAdminLayout from '../../layout/withAdminLayout';
import ClientList from '../../container/pages/client/ClientList';
import CarBrandsList from '../../container/pages/client/CarBrandsList';


const ClientProfile = lazy(() => import('../../container/pages/client/profile/ClientProfile'));

const ProductList = lazy(() => import('../../container/pages/product/ProductList'));
const CategoryList = lazy(() => import('../../container/pages/category/CategoryList'));

// New business modules
const SalesList = lazy(() => import('../../container/pages/sales/SalesList'));
const ServicesList = lazy(() => import('../../container/pages/services/ServicesList'));
const StockManagement = lazy(() => import('../../container/pages/stock/StockManagement'));
const NeotrackList = lazy(() => import('../../container/pages/neotrack/NeotrackList'));

function Admin() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Suspense
        fallback={
          <div className="spin">
            <Spin />
          </div>
        }
      >
        {/* Client routes */}
        <Route path={`${path}/clients/profile/:id`} component={ClientProfile} />
        <Route path={`${path}/clients/list`} component={ClientList} />
        <Route path={`${path}/clients/car-brands`} component={CarBrandsList} />

        {/* Sales routes */}
        <Route path={`${path}/sales/list`} component={SalesList} />
        <Route path={`${path}/sales/add`} component={SalesList} />
        <Route path={`${path}/sales/reports`} component={SalesList} />

        {/* Services routes */}
        <Route path={`${path}/services/list`} component={ServicesList} />
        <Route path={`${path}/services/add`} component={ServicesList} />
        <Route path={`${path}/services/stats`} component={ServicesList} />
        <Route exact path={`${path}/services`} component={ServicesList} />

        {/* Stock routes */}
        <Route path={`${path}/stock/management`} component={StockManagement} />
        <Route path={`${path}/stock/alerts`} component={StockManagement} />

        {/* Neotrack routes */}
        <Route path={`${path}/neotrack`} component={NeotrackList} />

        {/* Product routes */}
        <Route path={`${path}/product-list`} component={ProductList} />
        <Route path={`${path}/categories`} component={CategoryList} />

        {/* Existing routes */}
        <Route path={path} component={Dashboard} />
      </Suspense>
    </Switch>
  );
}

export default withAdminLayout(Admin);
