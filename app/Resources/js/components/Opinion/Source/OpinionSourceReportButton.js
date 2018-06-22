// @flow
import React from 'react';
import { connect } from 'react-redux';
import ReportBox from '../../Report/ReportBox';
import OpinionSourceStore from '../../../stores/OpinionSourceStore';
import { submitSourceReport } from '../../../redux/modules/report';
import type { Dispatch } from '../../../types';

type Props = {
  dispatch: Dispatch,
  source: Object,
};

class OpinionSourceReportButton extends React.Component<Props> {
  handleReport = data => {
    const { source, dispatch } = this.props;
    return submitSourceReport(OpinionSourceStore.opinion, source.id, data, dispatch);
  };

  render() {
    const { source } = this.props;
    return (
      <ReportBox
        id={`source-${source.id}`}
        reported={source.hasUserReported}
        onReport={this.handleReport}
        author={source.author}
        buttonBsSize="xs"
        buttonClassName="source__btn--report"
      />
    );
  }
}

export default connect()(OpinionSourceReportButton);
