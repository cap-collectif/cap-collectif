// @flow
import React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import ReportBox from '../../Report/ReportBox';
import { submitReport } from '~/redux/modules/report';
import type { Dispatch } from '~/types';
import type { OpinionSourceReportButton_source } from '~relay/OpinionSourceReportButton_source.graphql';

type Props = {
  dispatch: Dispatch,
  source: OpinionSourceReportButton_source,
};

class OpinionSourceReportButton extends React.Component<Props> {
  handleReport = (data: Object) => {
    const { source, dispatch } = this.props;
    return submitReport(source.id, data, dispatch, 'alert.success.report.source');
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

const container = connect<any, any, _, _, _, _>()(OpinionSourceReportButton);
export default createFragmentContainer(container, {
  source: graphql`
    fragment OpinionSourceReportButton_source on Source
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      contribuable
      id
      author {
        slug
      }
      viewerHasReport @include(if: $isAuthenticated)
    }
  `,
});
