// @flow
import React, { PropTypes } from 'react';
import { Navbar, Button } from 'react-bootstrap';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import Input from '../../Form/Input';

const MainNavbarSearch = React.createClass({
  displayName: 'MainNavbarSearch',

  contextTypes: {
    router: PropTypes.object.isRequired
  },

  mixins: [DeepLinkStateMixin],

  getInitialState() {
    return {
      searchTerm: ''
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
      <Button type="submit" style={{ paddingTop: '7px' }} className="btn-gray">
        <i className="cap cap-magnifier" />
      </Button>
    );
    return (
      <Navbar.Form pullRight>
        <form onSubmit={this.submit}>
          <Input
            type="text"
            placeholder="synthesis.edition.navbar.search"
            buttonAfter={searchButton}
            valueLink={this.linkState('searchTerm')}
          />
        </form>
      </Navbar.Form>
    );
  }
});

export default MainNavbarSearch;
