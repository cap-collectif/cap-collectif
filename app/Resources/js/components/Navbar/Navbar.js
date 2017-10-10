import React, { PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Navbar as Navigation, Nav } from 'react-bootstrap';
import NavbarRight from './NavbarRight';
import NavbarItem from './NavbarItem';

const Navbar = React.createClass({
  propTypes: {
    intl: intlShape.isRequired,
    logo: PropTypes.string,
    items: PropTypes.array.isRequired,
  },

  getDefaultProps() {
    return {
      logo: null,
    };
  },

  getInitialState() {
    const { items } = this.props;
    return {
      items,
      moreItems: [],
    };
  },

  render() {
    const { logo, intl } = this.props;
    const { items } = this.state;

    const navbarLgSize = (
      <Nav id="navbar-content" className="visible-lg-block">
        {items.filter((item, index) => index < 5).map((header, index) => {
          return (
            <NavbarItem key={index} item={header} ref={c => (this[`item-${header.id}`] = c)} />
          );
        })}
        {items.length > 5 && (
          <NavbarItem
            item={{
              id: 'see-more',
              title: intl.formatMessage({ id: 'global.navbar.see_more' }),
              hasEnabledFeature: true,
              children: items.filter((item, index) => index >= 5),
            }}
            ref={c => (this.seeMoreDropdown = c)}
            className="navbar-dropdown-more"
          />
        )}
      </Nav>
    );

    const navbarMdSize = (
      <Nav id="navbar-content" className="visible-md-block">
        {items.filter((item, index) => index < 3).map((header, index) => {
          return (
            <NavbarItem key={index} item={header} ref={c => (this[`item-${header.id}`] = c)} />
          );
        })}
        {items.length > 3 && (
          <NavbarItem
            item={{
              id: 'see-more',
              title: intl.formatMessage({ id: 'global.navbar.see_more' }),
              hasEnabledFeature: true,
              children: items.filter((item, index) => index >= 3),
            }}
            ref={c => (this.seeMoreDropdown = c)}
            className="navbar-dropdown-more"
          />
        )}
      </Nav>
    );

    const navbarSmSize = (
      <Nav id="navbar-content" className="visible-sm-block">
        {items.filter((item, index) => index < 2).map((header, index) => {
          return (
            <NavbarItem key={index} item={header} ref={c => (this[`item-${header.id}`] = c)} />
          );
        })}
        {items.length > 2 && (
          <NavbarItem
            item={{
              id: 'see-more',
              title: intl.formatMessage({ id: 'global.navbar.see_more' }),
              hasEnabledFeature: true,
              children: items.filter((item, index) => index >= 2),
            }}
            ref={c => (this.seeMoreDropdown = c)}
            className="navbar-dropdown-more"
          />
        )}
      </Nav>
    );

    const navbarXsSize = (
      <Nav id="navbar-content" className="visible-xs-block">
        {items.map((header, index) => {
          return (
            <NavbarItem key={index} item={header} ref={c => (this[`item-${header.id}`] = c)} />
          );
        })}
      </Nav>
    );

    return (
      <Navigation id="main-navbar" className="navbar navbar-default navbar-fixed-top">
        <div className="skip-links js-skip-links" role="banner">
          <div className="skip-links-container">
            <div className="container">
              <ul className="skip-links-list clearfix">
                <li>
                  <a href="#navbar">
                    <FormattedMessage id="navbar.skip_links.menu" />
                  </a>
                </li>
                <li>
                  <a href="#main">
                    <FormattedMessage id="navbar.skip_links.content" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container" ref={c => (this.container = c)}>
          <Navigation.Header>
            <Navigation.Brand href="/" id="home" ref={c => (this.header = c)}>
              <a href="/">
                <img
                  src={logo}
                  title={intl.formatMessage({ id: 'navbar.homepage' })}
                  alt={intl.formatMessage({ id: 'navbar.homepage' })}
                />
              </a>
            </Navigation.Brand>
            <Navigation.Toggle />
          </Navigation.Header>
          <Navigation.Collapse>
            {navbarLgSize}
            {navbarMdSize}
            {navbarSmSize}
            {navbarXsSize}
            <NavbarRight ref={c => (this.navright = c)} />
          </Navigation.Collapse>
        </div>
      </Navigation>
    );
  },
});

export default injectIntl(Navbar);
