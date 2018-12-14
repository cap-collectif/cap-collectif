// @flow
import * as React from 'react';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';
import { Navbar as Navigation, Nav } from 'react-bootstrap';
import NavbarRight from './NavbarRight';
import NavbarItem from './NavbarItem';

type Props = {
  intl: IntlShape,
  logo?: ?string,
  items: Array<Object>,
  siteName: ?string,
};

class Navbar extends React.Component<Props> {
  render() {
    const { logo, intl, items, siteName } = this.props;

    const navbarLgSize = (
      <Nav id="navbar-content" className="visible-lg-block">
        {items.filter((item, index) => index < 6).map((header, index) => (
          <NavbarItem key={index} item={header} />
        ))}
        {items.length > 6 && (
          <NavbarItem
            item={{
              id: 'see-more',
              title: intl.formatMessage({ id: 'global.navbar.see_more' }),
              hasEnabledFeature: true,
              children: items.filter((item, index) => index >= 6),
            }}
            className="navbar-dropdown-more"
          />
        )}
      </Nav>
    );

    const navbarMdSize = (
      <Nav id="navbar-content" className="visible-md-block">
        {items.filter((item, index) => index < 3).map((header, index) => (
          <NavbarItem key={index} item={header} />
        ))}
        {items.length > 3 && (
          <NavbarItem
            item={{
              id: 'see-more',
              title: intl.formatMessage({ id: 'global.navbar.see_more' }),
              hasEnabledFeature: true,
              children: items.filter((item, index) => index >= 3),
            }}
            className="navbar-dropdown-more"
          />
        )}
      </Nav>
    );

    const navbarSmSize = (
      <Nav id="navbar-content" className="visible-sm-block">
        {items.filter((item, index) => index < 1).map((header, index) => (
          <NavbarItem key={index} item={header} />
        ))}
        {items.length > 1 && (
          <NavbarItem
            item={{
              id: 'see-more',
              title: intl.formatMessage({ id: 'global.navbar.see_more' }),
              hasEnabledFeature: true,
              children: items.filter((item, index) => index >= 1),
            }}
            className="navbar-dropdown-more"
          />
        )}
      </Nav>
    );

    const navbarXsSize = (
      <Nav id="navbar-content" className="visible-xs-block">
        {items.map((header, index) => (
          <NavbarItem key={index} item={header} />
        ))}
      </Nav>
    );

    return (
      <Navigation id="main-navbar" className="navbar navbar-default navbar-fixed-top">
        <div className="skip-links js-skip-links" role="banner">
          <div className="skip-links-container">
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
        <Navigation.Header>
          {logo && (
            <Navigation.Brand href="/" id="home">
              <a href="/" title={intl.formatMessage({ id: 'navbar.homepage' })}>
                <img src={logo} alt={siteName} />
              </a>
            </Navigation.Brand>
          )}
          <Navigation.Toggle />
        </Navigation.Header>
        <Navigation.Collapse>
          {navbarLgSize}
          {navbarMdSize}
          {navbarSmSize}
          {navbarXsSize}
          <NavbarRight />
        </Navigation.Collapse>
      </Navigation>
    );
  }
}

export default injectIntl(Navbar);
