import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { loadProposals } from '../../../redux/modules/proposal';

const ProposalRandom = React.createClass({
  propTypes: {
    isLoading: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },

  render() {
    const { dispatch } = this.props;
    return (
      <div>
        <p>
          <a href="#proposals-list" onClick={() => dispatch(loadProposals(null, true))}>
            <FormattedMessage id="proposal.random_search" />
          </a>
          <FormattedMessage id="proposal.change_filter" />
        </p>
      </div>
    );
  },
});

export default connect()(ProposalRandom);
