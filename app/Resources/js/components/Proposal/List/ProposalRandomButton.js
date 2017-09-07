import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { loadProposals } from '../../../redux/modules/proposal';

const ProposalRandomButton = React.createClass({
  propTypes: {
    isLoading: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },

  render() {
    const { isLoading, dispatch } = this.props;
    return (
      <div className="pagination--custom  text-center">
        <Button
          bsStyle="primary"
          disabled={isLoading}
          onClick={() => {
            dispatch(loadProposals());
          }}>
          {isLoading
            ? <FormattedMessage id="global.loading" />
            : <FormattedMessage id="proposal.random_search" />}
        </Button>
      </div>
    );
  },
});

const mapStateToProps = state => {
  return {
    isLoading: state.proposal.isLoading,
  };
};

export default connect(mapStateToProps)(ProposalRandomButton);
