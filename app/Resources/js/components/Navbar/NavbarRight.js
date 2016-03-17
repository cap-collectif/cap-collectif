import React, { PropTypes } from 'react';
import RegistrationButton from '../User/Registration/RegistrationButton';
import LoginButton from '../User/Login/LoginButton';

var NavbarRight = React.createClass({

  render() {
    return (
      <div class="nav navbar-right">
        {FeatureStore.isActive('search')
          ? <a className="navbar__search" href="/search">
               <i className="cap cap-magnifier"></i> <span className="visible-xs">global.menu.search</span>
           </a>
          : null
        }
        {LoginStore.isLoggedIn()
         ? <ul className="nav navbar-nav navbar-right">
               <li className="dropdown">
                   <a href="#" className="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" role="button">
                     { LoginStore.username() }<span className="caret"></span>
                   </a>
                   <ul className="dropdown-menu" role="menu">
                       {LoginStore.isAdmin()
                           ? <li role="menuitem"><a href="/admin">header.administration</a></li>
                           : null
                         }
                       <li role="menuitem"><a href="/profile">header.profile</a></li>
                       <li role="menuitem"><a href="/profile/edit-profile">header.user_settings</a></li>
                       <li className="divider" role="separator"></li>
                       <li role="menuitem"><a href="/logout">layout.logout</a></li>
                   </ul>
               </li>
           </ul>
        : <span>
           <RegistrationButton />
           <LoginButton className="btn btn-darkest-gray navbar-btn btn--connection" />
          </span>
      }
    </div>
    );
  }

});

export default NavbarRight;
