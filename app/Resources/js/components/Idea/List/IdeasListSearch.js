import React from 'react';
import IdeaActions from '../../../actions/IdeaActions';
import Input from '../../Form/Input';
import { Button } from 'react-bootstrap';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import { IntlMixin } from 'react-intl';

const IdeasListSearch = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
  },
  mixins: [
    IntlMixin,
    DeepLinkStateMixin,
  ],

  getInitialState() {
    return {
      value: '',
    };
  },

  handleSubmit(e) {
    e.preventDefault();
    let value = this._input.getValue();
    value = value.length > 0 ? value : null;
    IdeaActions.changeSearchTerms(value);
    this.reload();
    this.props.onChange();
  },

  reload() {
    IdeaActions.load();
  },

  render() {
    const button = (
      <Button id="idea-search-button" type="submit">
        <i className="cap cap-magnifier"></i>
      </Button>
    );
    return (
      <form onSubmit={this.handleSubmit} className="filter__search">
        <Input
          id="idea-search-input"
          type="text"
          ref={(c) => this._input = c}
          placeholder={this.getIntlMessage('idea.search')}
          buttonAfter={button}
          valueLink={this.linkState('value')}
          groupClassName="idea-search-group pull-right"
        />
      </form>
    );
  },
});

export default IdeasListSearch;
