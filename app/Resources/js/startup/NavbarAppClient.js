/* @flow */
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import Navbar from '../components/Navbar/Navbar';
import NavbarRight from '../components/Navbar/NavbarRight';

const NavbarAppClient = (props: Object) => {
  const store = ReactOnRails.getStore('appStore');

  // NOTE: maybe use later global variable instead of Redux store to get theme colors
  const state = store.getState();

  const theme = {
    mainNavbarBg: state.default.parameters['color.main_menu.bg'],
    mainNavbarBgActive: state.default.parameters['color.main_menu.bg_active'],
    mainNavbarText: state.default.parameters['color.main_menu.text'],
    mainNavbarTextHover: state.default.parameters['color.main_menu.text_hover'],
    mainNavbarTextActive: state.default.parameters['color.main_menu.text_active'],
  };

  console.log(theme);

  return (
    <Provider store={store}>
      <IntlProvider>
        <div id="main-navbar" className="navbar-fixed-top">
          <div className="container">
            <ThemeProvider theme={theme}>
              <Navbar {...props} contentRight={<NavbarRight />} />
            </ThemeProvider>
          </div>
        </div>
      </IntlProvider>
    </Provider>
  );
};

export default NavbarAppClient;
