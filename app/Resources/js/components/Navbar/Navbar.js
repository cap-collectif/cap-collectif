import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Navbar as Navigation, Nav, NavDropdown, MenuItem, NavItem } from 'react-bootstrap';
import NavbarRight from './NavbarRight';

const Navbar = React.createClass({
  propTypes: {
    logo: PropTypes.string,
    items: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      logo: null,
    };
  },

  render() {
    return (
      <Navigation id="main-navbar" className="navbar navbar-default navbar-fixed-top">
        <div className="skip-links js-skip-links" role="banner">
            <div className="skip-links-container">
                <div className="container">
                    <ul className="skip-links-list clearfix">
                        <li><a href="#navbar">{ this.getIntlMessage('navbar.skip_links.menu') }</a></li>
                        <li><a href="#main">{ this.getIntlMessage('navbar.skip_links.content') }</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="container">
          <Navigation.Header>
            <Navigation.Brand href="/" id="home">
              <img src={this.props.logo} title={this.getIntlMessage('navbar.homepage')} alt={this.getIntlMessage('navbar.homepage')} />
            </Navigation.Brand>
            <Navigation.Toggle />
          </Navigation.Header>
          <Navigation.Collapse>
              <Nav id="navbar-content">
                {
                  this.props.items.map((header, index) => {
                    if (header.hasEnabledFeature) {
                      if (header.children.length > 0) {
                        return (
                          <NavDropdown key={index} eventKey={index} title={header.title} id="basic-nav-dropdown">
                            {
                              header.children.map((child, childIndex) => {
                                if (child.hasEnabledFeature) {
                                  return (
                                    <MenuItem
                                      key={childIndex}
                                      eventKey={index + childIndex}
                                      href={child.link}
                                    >
                                      {child.title}
                                    </MenuItem>
                                  );
                                }
                                return null;
                              })
                            }
                          </NavDropdown>
                        );
                      }
                      return (
                        <NavItem
                          key={index}
                          eventKey={index}
                          href={header.link}
                        >
                        {header.title}
                        </NavItem>
                      );
                    }
                    return null;
                  })
                }
              </Nav>
              <NavbarRight />
          </Navigation.Collapse>
        </div>
      </Navigation>
    );
  },

});

export default Navbar;
