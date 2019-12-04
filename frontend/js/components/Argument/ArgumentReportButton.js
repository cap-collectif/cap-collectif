// @flow
import React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import ReportBox from '../Report/ReportBox';
import { submitArgumentReport } from '../../redux/modules/report';
import type { ArgumentReportButton_argument } from '~relay/ArgumentReportButton_argument.graphql';
import type { Dispatch } from '../../types';

type OwnProps = {|
  argument: ArgumentReportButton_argument,
|};

type Props = {|
  ...OwnProps,
  dispatch: Dispatch,
|};

class ArgumentReportButton extends React.Component<Props> {
  handleReport = (data: Object) => {
    const { argument, dispatch } = this.props;
    if (!argument.related) {
      return;
    }
    return submitArgumentReport(argument.related, argument.id, data, dispatch);
  };

  render() {
    const { argument } = this.props;
    return (
      <ReportBox
        id={`argument-${argument.id}`}
        reported={argument.viewerHasReport || false}
        onReport={this.handleReport}
        author={{ uniqueId: argument.author.slug }}
        buttonBsSize="xs"
        buttonClassName="btn--outline btn-dark-gray argument__btn--report"
      />
    );
  }
}

const container = connect()(ArgumentReportButton);

export default createFragmentContainer(container, {
  argument: graphql`
    fragment ArgumentReportButton_argument on Argument
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      author {
        id
        slug
      }
      related {
        id
        __typename
        related {
          id
          __typename
        }
      }
      id
      viewerHasReport @include(if: $isAuthenticated)
    }
  `,
});
