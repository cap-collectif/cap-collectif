const Link = ReactRouter.Link;
const Navbar = ReactBootstrap.Navbar;
const Nav = ReactBootstrap.Nav;
const NavItem = ReactBootstrap.NavItem;

const MainNavbar = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  renderBrand() {
    return (
      <a href="/">
        <img src="/images/capco.png" />
      </a>
    );
  },

  render() {
    return (
      <Navbar fixedTop fluid className="synthesis__main-navbar" brand={this.renderBrand()}>
        <Nav>
          <NavItem eventKey={1} href="#">Test</NavItem>
        </Nav>
      </Navbar>
    );
  },

});

export default MainNavbar;

