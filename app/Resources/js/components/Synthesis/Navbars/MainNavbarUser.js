import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Nav, NavDropdown, MenuItem } from 'react-bootstrap';
import UserAvatar from '../../User/UserAvatar';

export const MainNavbarUser = React.createClass({
  displayName: 'MainNavbarUser',
  propTypes: {
    user: PropTypes.object,
    features: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  render() {
    const { user, features } = this.props;
    if (user) {
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
                {this.getIntlMessage('synthesis.edition.navbar.user.admin')}
              </MenuItem>
              : null
            }
            {
              features.profiles
              ? <MenuItem eventKey="2" href="/profile">
                {this.getIntlMessage('synthesis.edition.navbar.user.profile')}
              </MenuItem>
              : null
            }
            <MenuItem eventKey="3" href={`/profile/${features.profiles ? 'edit-profile' : 'edit-account'}`}>
              {this.getIntlMessage('synthesis.edition.navbar.user.settings')}
            </MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="4" href="/logout">
              {this.getIntlMessage('synthesis.edition.navbar.user.logout')}
            </MenuItem>
          </NavDropdown>
        </Nav>
      );
    }
    return null;
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
    features: state.default.features,
  };
};

export default connect(mapStateToProps)(MainNavbarUser);
