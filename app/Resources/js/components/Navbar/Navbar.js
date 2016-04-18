import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Navbar as Navigation, Nav, NavDropdown, MenuItem, NavItem } from 'react-bootstrap';
import NavbarRight from './NavbarRight';

const Navbar = React.createClass({
  propTypes: {
    logo: PropTypes.string,
    headers: PropTypes.array.isRequired,
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
                        <li><a href="#navbar">Aller au menu</a></li>
                        <li><a href="#main">Aller au contenu</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="container">
          <Navigation.Header>
            <Navigation.Brand href="/" id="home">
              <img src={this.props.logo} title={'menu.homepage'} alt={'menu.homepage'} />
            </Navigation.Brand>
            <Navigation.Toggle />
          </Navigation.Header>
          <Navigation.Collapse>
              <Nav id="navbar-content">
                {
                  this.props.headers.map((header, index) => {
                    if (header.hasEnabledFeature) {
                      if (header.children.length > 0) {
                        return (
                          <NavDropdown key={index} eventKey={index} title={header.title} id="basic-nav-dropdown">
                            {
                              header.children.map((child, childIndex) => {
                                if (child.hasEnabledFeature) {
                                  return <MenuItem key={childIndex} eventKey={index + childIndex} href={child.link}>{child.title}</MenuItem>;
                                }
                                return null;
                              })
                            }
                          </NavDropdown>
                        );
                      }
                      return (
                        <NavItem key={index} eventKey={index} href={header.link}>{header.title}</NavItem>
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
