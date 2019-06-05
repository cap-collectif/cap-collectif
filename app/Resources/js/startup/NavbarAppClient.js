/* @flow */
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import Navbar from '../components/Navbar/Navbar';
import NavbarRight from '../components/Navbar/NavbarRight';

const NavbarAppClient = (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <div id="main-navbar" className="navbar-fixed-top">
        <div className="container">
          <Navbar {...props} contentRight={<NavbarRight />} />
        </div>
      </div>
    </IntlProvider>
  </Provider>
);

export default NavbarAppClient;
