// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { submitOpinionReport } from '../../redux/modules/report';
import ReportBox from '../Report/ReportBox';

const OpinionReportButton = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    opinion: PropTypes.object.isRequired,
  },

  handleReport(data) {
    const { opinion, dispatch } = this.props;
    return submitOpinionReport(opinion, data, dispatch);
  },

  render() {
    const { opinion } = this.props;
    return (
      <ReportBox
        id={`opinion-${opinion.id}`}
        reported={opinion.has_user_reported}
        onReport={this.handleReport}
        author={opinion.author}
        buttonClassName="opinion__action--report pull-right btn--outline btn-dark-gray"
      />
    );
  },
});

export default connect()(OpinionReportButton);
