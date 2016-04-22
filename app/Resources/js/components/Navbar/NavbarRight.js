import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin } from 'react-intl';
import { Nav, NavDropdown, MenuItem, NavItem } from 'react-bootstrap';
import RegistrationButton from '../User/Registration/RegistrationButton';
import LoginButton from '../User/Login/LoginButton';
import LoginActions from '../../actions/LoginActions';
import UserAvatar from '../User/UserAvatar';

const NavbarRight = React.createClass({
  propTypes: {
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  logout() {
    // suppress jwt
    LoginActions.logoutUser();
    // We redirect to /logout page to invalidate session on the server
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
          ? <NavDropdown
              eventKey={3}
              title={
                <span>
                  <UserAvatar user={user} size={34} style={{ marginRight: '10px' }} anchor={false} />
                  <span className="hidden-xs">
                    { user.username }
                  </span>
                </span>
              }
              className="navbar__dropdown"
              id="navbar-username"
            >
              {
                user.isAdmin
                ? <MenuItem key={3.1} eventKey={3.1} href="/admin">
                    { this.getIntlMessage('navbar.admin') }
                  </MenuItem>
                : null
              }
              <MenuItem key={3.2} eventKey={3.2} href="/profile">
                { this.getIntlMessage('navbar.profile') }
              </MenuItem>
              <MenuItem key={3.3} eventKey={3.3} href="/profile/edit-profile">
                { this.getIntlMessage('navbar.user_settings') }
              </MenuItem>
              <MenuItem key={3.4} divider />
              <MenuItem key={3.5} eventKey={3.5} id="logout-button" onClick={this.logout}>
                  { this.getIntlMessage('global.logout') }
              </MenuItem>
            </NavDropdown>
          : <span>
              <RegistrationButton />
              { ' ' }
              <LoginButton className="btn-darkest-gray navbar-btn btn--connection" />
            </span>
        }
      </Nav>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.features,
    user: state.user,
  };
};

export default connect(mapStateToProps)(NavbarRight);
