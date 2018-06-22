import React from 'react';
import { Navbar } from 'react-bootstrap';
import MainNavbarHeader from './MainNavbarHeader';
import MainNavbarUser from './MainNavbarUser';
import MainNavbarSearch from './MainNavbarSearch';

class MainNavbar extends React.Component {
  static displayName = 'MainNavbar';

  render() {
    return (
      <Navbar fixedTop fluid className="synthesis__main-navbar">
        <MainNavbarHeader />
        <MainNavbarUser />
        <MainNavbarSearch />
      </Navbar>
    );
  }
}

export default MainNavbar;
