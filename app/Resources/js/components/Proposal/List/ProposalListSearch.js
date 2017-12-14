import React, { PropTypes } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { changeTerm, loadProposals } from '../../../redux/modules/proposal';
import Input from '../../Form/Input';
import type { State } from '../../../types';

const ProposalListSearch = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    terms: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      terms: this.props.terms,
    };
  },

  handleSubmit(e) {
    const { dispatch } = this.props;

    e.preventDefault();
    let value = this._input.getWrappedInstance().getValue();
    value = value.length > 0 ? value : null;
    dispatch(changeTerm(value));
    dispatch(loadProposals(null, true));
  },

  handleChange(event) {
    this.setState({ terms: event.target.value });
  },

  render() {
    const { intl } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <Input
          id="proposal-search-input"
          type="text"
          aria-label={intl.formatMessage({ id: 'project.searchform.search' })}
          ref={c => (this._input = c)}
          placeholder="proposal.search"
          buttonAfter={
            <Button id="proposal-search-button" type="submit">
              <i className="cap cap-magnifier" />
            </Button>
          }
          groupClassName="proposal-search-group pull-right"
          value={this.state.terms}
          onChange={this.handleChange}
        />
      </form>
    );
  },
});

const mapStateToProps = (state: State) => {
  return {
    terms: state.proposal.terms ? state.proposal.terms : '',
  };
};

const container = injectIntl(ProposalListSearch);

export default connect(mapStateToProps)(container);
