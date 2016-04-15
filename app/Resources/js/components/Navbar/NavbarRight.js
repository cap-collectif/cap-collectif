import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Nav, NavDropdown, MenuItem, NavItem } from 'react-bootstrap';
import RegistrationButton from '../User/Registration/RegistrationButton';
import LoginButton from '../User/Login/LoginButton';
import LoginActions from '../../actions/LoginActions';

const NavbarRight = React.createClass({
  propTypes: {
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  logout() {
    LoginActions.logoutUser();
    window.location.href = window.location.protocol + '//' + window.location.host + '/logout';
  },

  render() {
    const { user, features } = this.props;
    return (
      <Nav pullRight>
        {
          features.search
          ? <NavItem eventKey={1} className="navbar__search" href="/search">
              <i className="cap cap-magnifier"></i> <span className="visible-xs">{ this.getIntlMessage('navbar.search') }</span>
            </NavItem>
          : null
        }
        {
          user
          ? <NavDropdown eventKey={3} title={
              <span>{user.username} <span className="caret" />
              </span>
            } id="navbar-username">
              {
                user.isAdmin
                ? <MenuItem eventKey={3.1} href="/admin">
                    { this.getIntlMessage('navbar.admin') }
                  </MenuItem>
                : null
              }
              <MenuItem eventKey={3.2}>
                <a href="/profile">{ this.getIntlMessage('navbar.profile') }</a>
              </MenuItem>
              <MenuItem eventKey={3.3}>
                <a href="/profile/edit-profile">{ this.getIntlMessage('navbar.user_settings') }</a>
              </MenuItem>
              <MenuItem divider />
              <MenuItem eventKey={3.3} id="logout-button">
                <a onClick={this.logout} role="button">
                  { this.getIntlMessage('global.logout') }
                </a>
              </MenuItem>
            </NavDropdown>
          : <span>
              <RegistrationButton />
              { ' ' }
              <LoginButton />
            </span>
        }
      </Nav>
    );
  },

});

export default NavbarRight;
