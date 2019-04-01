// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import UserAvatar from '../User/UserAvatar';
import OpinionInfos from './OpinionInfos';
import OpinionPreviewTitle from './OpinionPreviewTitle';
import OpinionPreviewCounters from './OpinionPreviewCounters';
import type { OpinionPreview_opinion } from '~relay/OpinionPreview_opinion.graphql';

type Props = {
  showUpdatedDate: boolean,
  opinion: OpinionPreview_opinion,
  rankingThreshold?: ?number,
};

class OpinionPreview extends React.Component<Props> {
  static defaultProps = {
    showUpdatedDate: false,
  };

  render() {
    const { opinion, rankingThreshold, showUpdatedDate } = this.props;

    return (
      <React.Fragment>
        {/* $FlowFixMe Will be a fragment soon */}
        <UserAvatar user={opinion.author} />
        <div>
          {/* $FlowFixMe */}
          <OpinionInfos
            rankingThreshold={rankingThreshold}
            opinion={opinion}
            showUpdatedDate={showUpdatedDate}
          />
          {/* $FlowFixMe */}
          <OpinionPreviewTitle opinion={opinion} showTypeLabel={false} />
          {/* $FlowFixMe */}
          <OpinionPreviewCounters opinion={opinion} />
        </div>
      </React.Fragment>
    );
  }
}

export default createFragmentContainer(OpinionPreview, {
  opinion: graphql`
    fragment OpinionPreview_opinion on OpinionOrVersion {
      ...OpinionInfos_opinion
      ...OpinionPreviewTitle_opinion
      ...OpinionPreviewCounters_opinion
      ... on Opinion {
        author {
          displayName
          media {
            url
          }
        }
      }
      ... on Version {
        author {
          displayName
          media {
            url
          }
        }
      }
    }
  `,
});
