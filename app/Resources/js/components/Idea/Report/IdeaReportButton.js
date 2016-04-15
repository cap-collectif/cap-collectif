import React from 'react';
import ReportBox from '../../Report/ReportBox';
import IdeaActions from '../../../actions/IdeaActions';

const IdeaReportButton = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
    buttonId: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      buttonId: 'idea-report-button',
    };
  },

  report(data) {
    return IdeaActions.report(this.props.idea.id, data);
  },

  render() {
    const { idea } = this.props;
    return (
      <ReportBox
        buttonId={this.props.buttonId}
        reported={idea.userHasReport}
        onReport={this.report}
        author={idea.author}
        buttonClassName="idea__btn--report"
      />
    );
  },

});

export default IdeaReportButton;
