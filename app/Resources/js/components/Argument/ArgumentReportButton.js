// @flow
import React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import ReportBox from '../Report/ReportBox';
import { submitArgumentReport } from '../../redux/modules/report';
import ArgumentStore from '../../stores/ArgumentStore';

import type { ArgumentReportButton_argument } from './__generated__/ArgumentReportButton_argument.graphql';

type Props = {
  dispatch: Function,
  argument: ArgumentReportButton_argument,
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

const container = connect()(ArgumentReportButton);
export default createFragmentContainer(
  container,
  graphql`
    fragment ArgumentReportButton_argument on Argument {
      author {
        id
        displayName
      }
      id
      hasUserReported
    }
  `,
);
