// @flow
import React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import ReportBox from '../../Report/ReportBox';
import { submitSourceReport } from '../../../redux/modules/report';
import type { Dispatch } from '../../../types';
import type { OpinionSourceReportButton_source } from '~relay/OpinionSourceReportButton_source.graphql';
import type { OpinionSourceReportButton_sourceable } from '~relay/OpinionSourceReportButton_sourceable.graphql';

type Props = {
  dispatch: Dispatch,
  source: OpinionSourceReportButton_source,
  sourceable: OpinionSourceReportButton_sourceable,
};

class OpinionSourceReportButton extends React.Component<Props> {
  handleReport = (data: Object) => {
    const { sourceable, source, dispatch } = this.props;
    return submitSourceReport(sourceable, source.id, data, dispatch);
  };

  render() {
    const { source } = this.props;
    return (
      <ReportBox
        id={`source-${source.id}`}
        reported={source.viewerHasReport || false}
        onReport={this.handleReport}
        author={{ uniqueId: source.author.slug }}
        buttonBsSize="xs"
        buttonClassName="source__btn--report"
      />
    );
  }
}

const container = connect()(OpinionSourceReportButton);
export default createFragmentContainer(container, {
  source: graphql`
    fragment OpinionSourceReportButton_source on Source
      @argumentDefinitions(isAuthenticated: { type: "Boolean" }) {
      contribuable
      id
      author {
        slug
      }
      viewerHasReport @include(if: $isAuthenticated)
    }
  `,
  sourceable: graphql`
    fragment OpinionSourceReportButton_sourceable on Sourceable {
      id
      ... on Version {
        parent {
          id
        }
      }
    }
  `,
});
