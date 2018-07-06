// @flow
import React from 'react';
import { connect } from 'react-redux';
import ReportBox from '../Report/ReportBox';
import { submitArgumentReport } from '../../redux/modules/report';
import ArgumentStore from '../../stores/ArgumentStore';

type Props = {
  dispatch: Function,
  argument: Object,
};

class ArgumentReportButton extends React.Component<Props> {
  handleReport = data => {
    const { argument, dispatch } = this.props;
    return submitArgumentReport(ArgumentStore.opinion, argument.id, data, dispatch);
  };

  render() {
    const { argument } = this.props;
    return (
      <ReportBox
        id={`argument-${argument.id}`}
        reported={argument.hasUserReported}
        onReport={this.handleReport}
        author={argument.author}
        buttonBsSize="xs"
        buttonClassName="argument__btn--report"
      />
    );
  }
}

export default connect()(ArgumentReportButton);
