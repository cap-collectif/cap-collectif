import React from 'react';
import ReportBox from '../../Report/ReportBox';
import OpinionSourceActions from '../../../actions/OpinionSourceActions';
import OpinionSourceStore from '../../../stores/OpinionSourceStore';

const OpinionSourceReportButton = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired,
  },

  report(data) {
    return OpinionSourceActions.report(OpinionSourceStore.opinion, this.props.source.id, data);
  },

  render() {
    const { source } = this.props;
    return (
      <ReportBox
        reported={source.has_user_reported}
        onReport={this.report}
        author={source.author}
        buttonBsSize="xs"
        buttonClassName="source__btn--report"
      />
    );
  },

});

export default OpinionSourceReportButton;
