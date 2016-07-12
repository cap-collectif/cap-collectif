import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ReportBox from '../../Report/ReportBox';
import { submitIdeaReport } from '../../../redux/modules/report';

export const IdeaReportButton = React.createClass({
  displayName: 'IdeaReportButton',
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    idea: PropTypes.object.isRequired,
    buttonId: PropTypes.string,
  },

  getDefaultProps() {
    return {
      buttonId: 'idea-report-button',
    };
  },

  report(data) {
    const { idea, dispatch } = this.props;
    return submitIdeaReport(idea.id, data, dispatch);
  },

  render() {
    const { idea, buttonId } = this.props;
    return (
      <ReportBox
        buttonId={buttonId}
        reported={idea.userHasReport}
        onReport={this.report}
        author={idea.author}
        buttonClassName="idea__btn--report"
      />
    );
  },

});

export default connect()(IdeaReportButton);
