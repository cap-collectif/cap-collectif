import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ReportBox from '../../Report/ReportBox';
import { submitProposalReport } from '../../../redux/modules/report';

const ProposalReportButton = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    proposal: PropTypes.object.isRequired,
  },

  handleReport(data) {
    const { proposal, dispatch } = this.props;
    return submitProposalReport(proposal.id, data, dispatch);
  },

  render() {
    const { proposal } = this.props;
    return (
        <ReportBox
          style={{ marginLeft: '15px' }}
          id="proposal-report-button"
          reported={proposal.hasUserReported}
          onReport={this.handleReport}
          author={proposal.author}
          buttonBsSize="xs"
          buttonClassName="proposal__btn--report"
        />
    );
  },

});

export default connect()(ProposalReportButton);
