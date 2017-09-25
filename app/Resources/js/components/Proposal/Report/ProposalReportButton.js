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
    return submitProposalReport(proposal, data, dispatch);
  },

  render() {
    const { proposal } = this.props;
    return (
      <ReportBox
        id={`proposal-${proposal.id}`}
        buttonStyle={{ marginLeft: '15px' }}
        reported={proposal.hasUserReported}
        onReport={this.handleReport}
        author={proposal.author}
        buttonClassName="proposal__btn--report"
      />
    );
  },
});

export default connect()(ProposalReportButton);
