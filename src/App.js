import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router } from 'react-router-dom';
import { ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { ConfigProvider } from 'antd';
import store, { rrfProps } from './redux/store';
import Admin from './routes/admin';
import Auth from './routes/auth';
import './static/css/style.css';
import config from './config/config';
import PrivateRoute from './components/utilities/PrivateRoute';
import PublicRoute from './components/utilities/PublicRoute';
import 'antd/dist/antd.less';

const { theme } = config;

function App() {
  const { rtl, topMenu, darkMode } = useSelector(state => {
    return {
      darkMode: state.ChangeLayoutMode.data,
      rtl: state.ChangeLayoutMode.rtlData,
      topMenu: state.ChangeLayoutMode.topMenu,
    };
  });

  return (
    <ConfigProvider direction={rtl ? 'rtl' : 'ltr'}>
      <ThemeProvider theme={{ ...theme, rtl, topMenu, darkMode }}>
        <Router>
          <PublicRoute exact path="/" component={Auth} />
          <PrivateRoute path="/dashboard" component={Admin} />
        </Router>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default function Root() {
  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <App />
      </ReactReduxFirebaseProvider>
    </Provider>
  );
}
