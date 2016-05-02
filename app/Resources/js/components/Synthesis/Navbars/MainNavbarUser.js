import React from 'react';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../../stores/LoginStore';
import UserAvatar from '../../User/UserAvatar';
import { Nav, NavDropdown, MenuItem } from 'react-bootstrap';

const MainNavbarUser = React.createClass({
  displayName: 'MainNavbarUser',
  mixins: [IntlMixin],

  render() {
    if (LoginStore.isLoggedIn()) {
      const user = LoginStore.user;
      const dropdownTitle = (
        <span>
          <UserAvatar user={user} size={34} style={{ marginRight: '10px' }} anchor={false} />
          <span className="hidden-xs">
            {user.displayName}
          </span>
        </span>
      );
      return (
        <Nav navbar pullRight >
          <NavDropdown
            id="main-menu-user-dropdown"
            eventKey={2}
            title={dropdownTitle}
            className="navbar__dropdown"
          >
            {
              user.isAdmin
              ? <MenuItem eventKey="1" href="/admin">
                {this.getIntlMessage('edition.navbar.user.admin')}
              </MenuItem>
              : null
            }
            <MenuItem eventKey="2" href={user._links.profile}>
              {this.getIntlMessage('edition.navbar.user.profile')}
            </MenuItem>
            <MenuItem eventKey="3" href={user._links.settings}>
              {this.getIntlMessage('edition.navbar.user.settings')}
            </MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="4" href="/logout">
              {this.getIntlMessage('edition.navbar.user.logout')}
            </MenuItem>
          </NavDropdown>
        </Nav>
      );
    }
    return null;
  },

});

export default MainNavbarUser;
