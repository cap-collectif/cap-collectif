const Navbar = ReactBootstrap.Navbar;
const Input = ReactBootstrap.Input;

const SecondNavbar = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  renderFilter() {
    return (
      <form className="navbar-form navbar-right" >
        <Input type="select">
          <option value="oldest">{this.getIntlMessage('edition.navbar.filter.oldest')}</option>
          <option value="newest">{this.getIntlMessage('edition.navbar.filter.newest')}</option>
          <option value="popular">{this.getIntlMessage('edition.navbar.filter.popular')}</option>
        </Input>
      </form>
    );
  },

  render() {
    return (
      <Navbar fixedTop fluid className="synthesis__second-navbar" brand={this.getIntlMessage('edition.navbar.second.brand')}>
          {this.renderFilter()}
      </Navbar>
    );
  },

});

export default SecondNavbar;

