import React from 'react';
import { IntlMixin } from 'react-intl';
import { Nav, Navbar, NavbarBrand, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const SecondNavbar = React.createClass({
  mixins: [IntlMixin],

  render() {
    return (
      <Navbar fixedTop fluid className="synthesis__second-navbar">
        <NavbarBrand>
          {this.getIntlMessage('synthesis.edition.navbar.second.brand')}
        </NavbarBrand>
        <Nav pullRight>
          <LinkContainer to={'/inbox'}>
            <NavItem>
              {this.getIntlMessage('synthesis.edition.navbar.second.inbox')}
            </NavItem>
          </LinkContainer>
          <LinkContainer to={'/preview'}>
            <NavItem>
              {this.getIntlMessage('synthesis.edition.navbar.second.preview')}
            </NavItem>
          </LinkContainer>
          <LinkContainer to={'/settings'}>
            <NavItem>
              <i className="cap cap-setting-gear"></i>
            </NavItem>
          </LinkContainer>
        </Nav>
      </Navbar>
    );
  },

});

export default SecondNavbar;
