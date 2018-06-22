// @flow
import React from 'react';
import { connect } from 'react-redux';
import { submitOpinionReport } from '../../redux/modules/report';
import ReportBox from '../Report/ReportBox';

type Props = {
  dispatch: Function,
  opinion: Object,
};

class OpinionReportButton extends React.Component<Props> {
  handleReport = data => {
    const { opinion, dispatch } = this.props;
    return submitOpinionReport(opinion, data, dispatch);
  };

  render() {
    const { opinion } = this.props;
    return (
      <ReportBox
        id={`opinion-${opinion.id}`}
        reported={opinion.hasUserReported}
        onReport={this.handleReport}
        author={opinion.author}
        buttonClassName="opinion__action--report pull-right btn--outline btn-dark-gray"
      />
    );
  }
}

export default connect()(OpinionReportButton);
