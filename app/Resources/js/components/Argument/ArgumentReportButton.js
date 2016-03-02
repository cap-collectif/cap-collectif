import React from 'react';
import ReportBox from '../Report/ReportBox';
import ArgumentActions from '../../actions/ArgumentActions';
import ArgumentStore from '../../stores/ArgumentStore';

const ArgumentReportButton = React.createClass({
  propTypes: {
    argument: React.PropTypes.object.isRequired,
  },

  report(data) {
    return ArgumentActions.report(ArgumentStore.opinion, this.props.argument.id, data);
  },

  render() {
    const { argument } = this.props;
    return (
      <ReportBox
        reported={argument.hasUserReported}
        onReport={this.report}
        author={argument.author}
        buttonBsSize="xs"
        buttonClassName="argument__btn--report"
      />
    );
  },

});

export default ArgumentReportButton;
