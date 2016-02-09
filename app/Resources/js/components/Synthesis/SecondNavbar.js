import React from 'react';
import { IntlMixin } from 'react-intl';
import { Nav, Navbar } from 'react-bootstrap';
import { NavItemLink } from 'react-router';

const SecondNavbar = React.createClass({
  mixins: [IntlMixin],

  render() {
    return (
      <Navbar fixedTop fluid className="synthesis__second-navbar" brand={this.getIntlMessage('edition.navbar.second.brand')}>
        <Nav right>
          <NavItemLink to={'preview'}>
            {this.getIntlMessage('edition.navbar.second.preview')}
          </NavItemLink>
        </Nav>
      </Navbar>
    );
  },

});

export default SecondNavbar;
