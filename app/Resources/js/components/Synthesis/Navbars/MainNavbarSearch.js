import React from 'react';
import { IntlMixin } from 'react-intl';
import { Navbar, Input, Button } from 'react-bootstrap';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';

const MainNavbarSearch = React.createClass({
  displayName: 'MainNavbarSearch',
  contextTypes: {
    router: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin],

  getInitialState() {
    return {
      searchTerm: '',
    };
  },

  submit(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    if (this.state.searchTerm.length > 0) {
      this.context.router.push(`search/${this.state.searchTerm}`);
    }
  },

  render() {
    const searchButton = (
      <Button
        type="submit"
        style={{ paddingTop: '7px' }}
        className="btn-gray"
      >
        <i className="cap cap-magnifier"></i>
      </Button>
    );
    return (
      <Navbar.Form pullRight >
        <form onSubmit={this.submit}>
          <Input
            type="text"
            placeholder={this.getIntlMessage('edition.navbar.search')}
            buttonAfter={searchButton}
            valueLink={this.linkState('searchTerm')}
          />
        </form>
      </Navbar.Form>
    );
  },

});

export default MainNavbarSearch;
