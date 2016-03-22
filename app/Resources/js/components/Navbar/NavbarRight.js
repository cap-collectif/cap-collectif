import React from 'react';
import { IntlMixin } from 'react-intl';
import RegistrationButton from '../User/Registration/RegistrationButton';
import LoginButton from '../User/Login/LoginButton';
import FeatureStore from '../../stores/FeatureStore';
import LoginStore from '../../stores/LoginStore';
import LoginActions from '../../actions/LoginActions';

const NavbarRight = React.createClass({
  mixins: [IntlMixin],

  logout() {
    LoginActions.logoutUser();
    window.location.href = window.location.protocol + '//' + window.location.host + '/logout';
  },

  render() {
    return (
      <div className="nav navbar-right">
        {
          FeatureStore.isActive('search')
          ? <a className="navbar__search" href="/search">
               <i className="cap cap-magnifier"></i> <span className="visible-xs">{ this.getIntlMessage('navbar.search') }</span>
           </a>
          : null
        }
        {
          LoginStore.isLoggedIn()
          ? <ul className="nav navbar-nav navbar-right">
               <li className="dropdown">
                   <a href="#" className="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" role="button" id="navbar-username">
                     { LoginStore.username }<span className="caret"></span>
                   </a>
                   <ul className="dropdown-menu" role="menu">
                       {
                         LoginStore.isAdmin()
                           ? <li role="menuitem"><a href="/admin">{ this.getIntlMessage('navbar.admin') }</a></li>
                           : null
                       }
                       <li role="menuitem"><a href="/profile">{ this.getIntlMessage('navbar.profile') }</a></li>
                       <li role="menuitem"><a href="/profile/edit-profile">{ this.getIntlMessage('navbar.user_settings') }</a></li>
                       <li className="divider" role="separator"></li>
                       <li role="menuitem" id="logout-button">
                        <a onClick={this.logout} role="button">{ this.getIntlMessage('global.logout') }</a>
                      </li>
                   </ul>
               </li>
           </ul>
         : <span>
            <RegistrationButton />
            { ' ' }
            <LoginButton />
           </span>
      }
    </div>
    );
  },

});

export default NavbarRight;
