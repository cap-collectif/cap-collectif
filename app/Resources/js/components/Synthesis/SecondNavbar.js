const Navbar = ReactBootstrap.Navbar;

const SecondNavbar = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <Navbar fixedTop fluid className="synthesis__second-navbar" brand={this.getIntlMessage('edition.navbar.second.brand')} />
    );
  },

});

export default SecondNavbar;

