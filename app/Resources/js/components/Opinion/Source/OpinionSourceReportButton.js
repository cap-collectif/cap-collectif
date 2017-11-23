// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ReportBox from '../../Report/ReportBox';
import OpinionSourceStore from '../../../stores/OpinionSourceStore';
import { submitSourceReport } from '../../../redux/modules/report';

const OpinionSourceReportButton = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    source: PropTypes.object.isRequired,
  },

  handleReport(data) {
    const { source, dispatch } = this.props;
    return submitSourceReport(OpinionSourceStore.opinion, source.id, data, dispatch);
  },

  render() {
    const { source } = this.props;
    return (
      <ReportBox
        id={`source-${source.id}`}
        reported={source.has_user_reported}
        onReport={this.handleReport}
        author={source.author}
        buttonBsSize="xs"
        buttonClassName="source__btn--report"
      />
    );
  },
});

export default connect()(OpinionSourceReportButton);
