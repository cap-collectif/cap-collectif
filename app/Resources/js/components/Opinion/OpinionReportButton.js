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
  handleReport = data => {
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
        reported={opinion.viewerHasReport}
        onReport={this.handleReport}
        author={{ uniqueId: opinion.author.slug }}
        buttonClassName="opinion__action--report pull-right btn--outline btn-dark-gray"
      />
    );
  }
}

const container = connect()(OpinionReportButton);
export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionReportButton_opinion on OpinionOrVersion {
      ... on Opinion {
        id
        viewerHasReport
        author {
          slug
        }
      }
      ... on Version {
        id
        viewerHasReport
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
