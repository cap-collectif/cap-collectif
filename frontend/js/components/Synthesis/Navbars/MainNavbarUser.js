import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Nav, NavDropdown, MenuItem } from 'react-bootstrap';
import UserAvatarDeprecated from '../../User/UserAvatarDeprecated';

type Props = {
  user: Object,
  features: Object,
};

export class MainNavbarUser extends React.Component<Props> {
  static displayName = 'MainNavbarUser';

  static defaultProps = {
    user: null,
  };

  render() {
    const { user, features } = this.props;
    if (user) {
      const dropdownTitle = (
        <span>
          <UserAvatarDeprecated
            user={user}
            size={34}
            style={{ marginRight: '10px' }}
            anchor={false}
          />
          <span className="hidden-xs">{user.displayName}</span>
        </span>
      );
      return (
        <Nav navbar pullRight>
          <NavDropdown
            id="main-menu-user-dropdown"
            eventKey={2}
            title={dropdownTitle}
            className="navbar__dropdown">
            {user.isAdmin ? (
              <MenuItem eventKey="1" href="/admin">
                {<FormattedMessage id='global.administration' />}
              </MenuItem>
            ) : null}
            {features.profiles ? (
              <MenuItem eventKey="2" href="/profile">
                {<FormattedMessage id='user.my.profile' />}
              </MenuItem>
            ) : null}
            <MenuItem eventKey="3" href="/profile/edit-profile">
              {<FormattedMessage id='global.params' />}
            </MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="4" href="/logout">
              {<FormattedMessage id='global.logout' />}
            </MenuItem>
          </NavDropdown>
        </Nav>
      );
    }
    return null;
  }
}

const mapStateToProps = state => {
  return {
    user: state.user.user,
    features: state.default.features,
  };
};

export default connect(mapStateToProps)(MainNavbarUser);
