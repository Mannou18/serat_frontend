import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { Switch, Route } from 'react-router-dom';
import AuthLayout from '../container/profile/authentication/Index';
import PublicRoute from '../components/utilities/PublicRoute';

const Login = lazy(() => import('../container/profile/authentication/overview/SignIn'));
const FbLogin = lazy(() => import('../container/profile/authentication/overview/FbSignIn'));
const ForgotPass = lazy(() => import('../container/profile/authentication/overview/ForgotPassword'));
const NotFound = () => <div>404 - Not Found</div>;

function FrontendRoutes() {
  return (
    <Switch>
      <Suspense
        fallback={
          <div className="spin">
            <Spin />
          </div>
        }
      >
        <PublicRoute exact path="/forgotPassword" component={ForgotPass} />
        <PublicRoute exact path="/" component={Login} />
        <Route exact path="/fbSignIn" component={FbLogin} />
        <Route exact path="*" component={NotFound} />
      </Suspense>
    </Switch>
  );
}

export default AuthLayout(FrontendRoutes);
