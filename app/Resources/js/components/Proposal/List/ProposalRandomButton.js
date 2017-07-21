import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { loadProposals } from '../../../redux/modules/proposal';

const ProposalRandomButton = React.createClass({
  propTypes: {
    isLoading: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      isLoading,
      dispatch,
    } = this.props;
    return (
      <div className="pagination--custom  text-center">
        <Button
          bsStyle="primary"
          disabled={isLoading}
          onClick={() => { dispatch(loadProposals()); }}
        >
          {
            isLoading
            ? this.getIntlMessage('global.loading')
            : this.getIntlMessage('proposal.random_search')
          }
        </Button>
      </div>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    isLoading: state.proposal.isLoading,
  };
};

export default connect(mapStateToProps)(ProposalRandomButton);
