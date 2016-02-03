import React from 'react';
import { IntlMixin } from 'react-intl';
import { Nav, Navbar, NavBrand, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const SecondNavbar = React.createClass({
  mixins: [IntlMixin],

  render() {
    return (
      <Navbar fixedTop fluid className="synthesis__second-navbar">
        <NavBrand>
          {this.getIntlMessage('edition.navbar.second.brand')}
        </NavBrand>
        <Nav right>
          <LinkContainer to={'/preview'}>
            <NavItem>
              {this.getIntlMessage('edition.navbar.second.preview')}
            </NavItem>
          </LinkContainer>
        </Nav>
      </Navbar>
    );
  },

});

export default SecondNavbar;
