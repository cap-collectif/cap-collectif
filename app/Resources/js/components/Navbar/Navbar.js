import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { IntlMixin } from 'react-intl';
import { Navbar as Navigation, Nav } from 'react-bootstrap';
import NavbarRight from './NavbarRight';
import NavbarItem from './NavbarItem';

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

  getInitialState() {
    const { items } = this.props;
    return {
      items,
      moreItems: [],
    };
  },

  componentDidMount() {
    window.addEventListener('resize', this.autocollapseNavbar);
    setTimeout(() => {
      this.autocollapseNavbar();
    }, 100);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.autocollapseNavbar);
  },

  getPixelsWidth(component) {
    return component && ReactDOM.findDOMNode(component)
      ? ReactDOM.findDOMNode(component).clientWidth
      : 0;
  },

  autocollapseNavbar() {
    const tempItems = this.state.items.concat(this.state.moreItems);
    let items = [];
    const moreItems = [];
    if (window.innerWidth >= 768) {
      // Only applied to window from sm size (otherwise menu is collapsed)
      const containerWidth = this.getPixelsWidth(this.container) - 30; // Minus padding
      const seeMoreDropdownWidth =
        this.getPixelsWidth(this.seeMoreDropdown) || 75; // Approximate size of menu item
      const headerWidth = this.getPixelsWidth(this.header);
      const navrightWidth = this.getPixelsWidth(
        this.navright.getWrappedInstance(),
      );
      const occupiedWidth =
        headerWidth + navrightWidth + seeMoreDropdownWidth + 30; // + 30px just in case
      const maxWidth = containerWidth - occupiedWidth;
      let width = 0;
      tempItems.map(item => {
        width += this.getPixelsWidth(this[`item-${item.id}`]);
        if (maxWidth < width) {
          moreItems.push(item);
        } else {
          items.push(item);
        }
      });
    } else {
      items = tempItems;
    }

    this.setState(
      {
        items,
        moreItems,
      },
      () => {
        if (
          window.innerWidth >= 768 &&
          ReactDOM.findDOMNode(this.container).clientHeight > 53
        ) {
          // 53 => 50px (navbar height) + 3px margin (just in case)
          this.autocollapseNavbar();
        }
      },
    );
  },

  render() {
    const { logo } = this.props;
    const { items, moreItems } = this.state;
    const moreItem = moreItems.length > 0
      ? {
          id: 'see-more',
          title: this.getIntlMessage('global.navbar.see_more'),
          hasEnabledFeature: true,
          children: moreItems,
        }
      : null;
    return (
      <Navigation
        id="main-navbar"
        className="navbar navbar-default navbar-fixed-top">
        <div className="skip-links js-skip-links" role="banner">
          <div className="skip-links-container">
            <div className="container">
              <ul className="skip-links-list clearfix">
                <li>
                  <a href="#navbar">
                    {this.getIntlMessage('navbar.skip_links.menu')}
                  </a>
                </li>
                <li>
                  <a href="#main">
                    {this.getIntlMessage('navbar.skip_links.content')}
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
                  title={this.getIntlMessage('navbar.homepage')}
                  alt={this.getIntlMessage('navbar.homepage')}
                />
              </a>
            </Navigation.Brand>

            <Navigation.Toggle />
          </Navigation.Header>
          <Navigation.Collapse>
            <Nav id="navbar-content">
              {items.map((header, index) => {
                return (
                  <NavbarItem
                    key={index}
                    item={header}
                    ref={c => (this[`item-${header.id}`] = c)}
                  />
                );
              })}
              {moreItem &&
                <NavbarItem
                  item={moreItem}
                  ref={c => (this.seeMoreDropdown = c)}
                  className="navbar-dropdown-more"
                />}
            </Nav>
            <NavbarRight ref={c => (this.navright = c)} />
          </Navigation.Collapse>
        </div>
      </Navigation>
    );
  },
});

export default Navbar;
