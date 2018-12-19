// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { submitOpinionReport } from '../../redux/modules/report';
import ReportBox from '../Report/ReportBox';
import type { OpinionReportButton_opinion } from './__generated__/OpinionReportButton_opinion.graphql';

type Props = {
  dispatch: Function,
  opinion: OpinionReportButton_opinion,
};

class OpinionReportButton extends React.Component<Props> {
  handleReport = (data: Object) => {
    const { opinion, dispatch } = this.props;
    return submitOpinionReport(opinion, data, dispatch);
  };

  render() {
    const { opinion } = this.props;
    if (!opinion || !opinion.author || !opinion.id) {
      return null;
    }
    return (
      <ReportBox
        id={`opinion-${opinion.id}`}
        reported={opinion.viewerHasReport || false}
        onReport={this.handleReport}
        author={{ uniqueId: opinion.author.slug }}
        buttonClassName="opinion__action--report btn--outline btn-dark-gray"
        buttonStyle={{ marginLeft: 5 }}
      />
    );
  }
}

const container = connect()(OpinionReportButton);
export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionReportButton_opinion on OpinionOrVersion
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ... on Opinion {
        id
        viewerHasReport @include(if: $isAuthenticated)
        author {
          slug
        }
      }
      ... on Version {
        id
        viewerHasReport @include(if: $isAuthenticated)
        author {
          slug
        }
        parent {
          id
        }
      }
    }
  `,
});
