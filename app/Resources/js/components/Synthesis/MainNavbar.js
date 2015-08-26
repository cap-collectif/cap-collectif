import LoginStore from '../../stores/LoginStore';
import UserAvatar from '../User/UserAvatar';

const Navbar = ReactBootstrap.Navbar;
const Nav = ReactBootstrap.Nav;
const NavItem = ReactBootstrap.NavItem;
const DropdownButton = ReactBootstrap.DropdownButton;
const MenuItem = ReactBootstrap.MenuItem;
const Input = ReactBootstrap.Input;
const Button = ReactBootstrap.Button;

const MainNavbar = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  renderBrand() {
    return (
      <a href="/">
          <span style={{color: '#A94442 !important'}}>Cap</span> <span style={{color: '#000 !important'}}>Collectif</span>
      </a>
    );
  },

  renderSearchForm() {
    const searchButton = <Button style={{paddingTop: '7px'}} className="btn-gray" ><i className="cap cap-magnifier"></i></Button>;
    return (
      <form className="navbar-form navbar-right" style={{marginRight: '15px', paddingRight: 0}} >
        <Input type="text" placeholder={this.getIntlMessage('edition.navbar.search')} buttonAfter={searchButton} />
      </form>
    );
  },

  renderNotifications() {
    return (
      <NavItem eventKey={1} className="navbar__icon-menu" >
        <i className="cap cap-bell-1"></i>
      </NavItem>
    );
  },

  renderUserButtonTitle() {
    return (
      <span>
        <UserAvatar user={LoginStore.user} size={34} style={{marginRight: '10px'}} anchor={false} />
        <span className="hidden-xs">{LoginStore.user.displayName}</span>
      </span>
    );
  },

  renderAdminMenuItem() {
    if (LoginStore.user.isAdmin) {
      return (
        <MenuItem eventKey="1" href="/admin">{this.getIntlMessage('edition.navbar.user.admin')}</MenuItem>
      );
    }
  },

  renderUser() {
    if (LoginStore.isLoggedIn()) {
      return (
        <DropdownButton eventKey={2} title={this.renderUserButtonTitle()} className="navbar__dropdown" >
          {this.renderAdminMenuItem()}
          <MenuItem eventKey="2" href={LoginStore.user._links.profile}>{this.getIntlMessage('edition.navbar.user.profile')}</MenuItem>
          <MenuItem eventKey="3" href={LoginStore.user._links.settings}>{this.getIntlMessage('edition.navbar.user.settings')}</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey="4" href="/logout">{this.getIntlMessage('edition.navbar.user.logout')}</MenuItem>
        </DropdownButton>
      );
    }
    return null;
  },

  render() {
    return (
      <Navbar fixedTop fluid navExpanded={true} className="synthesis__main-navbar" brand={this.renderBrand()}>
        <Nav navbar right>
          {this.renderNotifications()}
          {this.renderUser()}
        </Nav>
        {this.renderSearchForm()}
      </Navbar>
    );
  },

});

export default MainNavbar;

