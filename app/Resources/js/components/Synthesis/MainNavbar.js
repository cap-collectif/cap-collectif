import React from 'react';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../stores/LoginStore';
import UserAvatar from '../User/UserAvatar';
import { Navbar, Nav, NavBrand, NavItem, DropdownButton, MenuItem, Input, Button } from 'react-bootstrap';
import DeepLinkStateMixin from '../../utils/DeepLinkStateMixin';

const MainNavbar = React.createClass({
  mixins: [IntlMixin, DeepLinkStateMixin],

  getInitialState() {
    return {
      searchTerm: '',
    };
  },

  search() {
    if (this.state.searchTerm !== '') {
      this.transitionTo('search', { 'term': this.state.searchTerm });
    }
  },

  renderBrand() {
    return (
      <a href="/">
          <span style={{ color: '#A94442 !important' }}>Cap</span> <span style={{ color: '#000 !important' }}>Collectif</span>
      </a>
    );
  },

  renderSearchForm() {
    const searchButton = <Button onClick={this.search.bind(null, this)} style={{ paddingTop: '7px' }} className="btn-gray" ><i className="cap cap-magnifier"></i></Button>;
    return (
      <form className="navbar-form navbar-right" style={{ marginRight: '15px', paddingRight: 0 }} onSubmit={this.search.bind(null, this)} >
        <Input type="text" placeholder={this.getIntlMessage('edition.navbar.search')} buttonAfter={searchButton} valueLink={this.linkState('searchTerm')} />
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
        <UserAvatar user={LoginStore.user} size={34} style={{ marginRight: '10px' }} anchor={false} />
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
      <Navbar fixedTop fluid navExpanded className="synthesis__main-navbar">
        <NavBrand>
          {this.renderBrand()}
        </NavBrand>
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
