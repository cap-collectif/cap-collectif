// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import Input from '../../Form/Input';
import IdeaActions from '../../../actions/IdeaActions';

const IdeasListSearch = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
  },

  mixins: [DeepLinkStateMixin],

  getInitialState() {
    return {
      value: '',
    };
  },

  handleSubmit(e) {
    const { onChange } = this.props;
    e.preventDefault();
    let value = this._input.getWrappedInstance().getValue();
    value = value.length > 0 ? value : null;
    IdeaActions.changeSearchTerms(value);
    this.reload();
    onChange();
  },

  reload() {
    IdeaActions.load();
  },

  render() {
    const button = (
      <Button id="idea-search-button" type="submit">
        <i className="cap cap-magnifier" />
      </Button>
    );
    return (
      <form onSubmit={this.handleSubmit} className="filter__search">
        <Input
          id="idea-search-input"
          type="text"
          // $FlowFixMe
          ref={c => (this._input = c)}
          placeholder="idea.search"
          buttonAfter={button}
          valueLink={this.linkState('value')}
          groupClassName="idea-search-group pull-right"
        />
      </form>
    );
  },
});

export default IdeasListSearch;
