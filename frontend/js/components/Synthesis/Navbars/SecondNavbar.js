import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Nav, Navbar, NavbarBrand, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

class SecondNavbar extends React.Component {
  render() {
    return (
      <Navbar fixedTop fluid className="synthesis__second-navbar">
        <NavbarBrand>{<FormattedMessage id="synthesis.edition.navbar.second.brand" />}</NavbarBrand>
        <Nav pullRight>
          <LinkContainer to={'/inbox'}>
            <NavItem>{<FormattedMessage id="synthesis.edition.navbar.second.inbox" />}</NavItem>
          </LinkContainer>
          <LinkContainer to={'/preview'}>
            <NavItem>{<FormattedMessage id="synthesis.edition.navbar.second.preview" />}</NavItem>
          </LinkContainer>
          <LinkContainer to={'/settings'}>
            <NavItem>
              <i className="cap cap-setting-gear" />
            </NavItem>
          </LinkContainer>
        </Nav>
      </Navbar>
    );
  }
}

export default SecondNavbar;
