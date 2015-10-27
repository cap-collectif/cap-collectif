const Navbar = ReactBootstrap.Navbar;
const Nav = ReactBootstrap.Nav;
const NavItemLink = ReactRouterBootstrap.NavItemLink;

const SecondNavbar = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <Navbar fixedTop fluid className="synthesis__second-navbar" brand={this.getIntlMessage('edition.navbar.second.brand')}>
        <Nav right>
          <NavItemLink to={'preview'}>
            {this.getIntlMessage('edition.navbar.second.preview')}
          </NavItemLink>
        </Nav>
      </Navbar>
    );
  },

});

export default SecondNavbar;

