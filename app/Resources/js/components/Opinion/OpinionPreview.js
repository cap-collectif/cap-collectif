// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import UserAvatar from '../User/UserAvatar';
import OpinionInfos from './OpinionInfos';
import OpinionPreviewTitle from './OpinionPreviewTitle';
import OpinionPreviewCounters from './OpinionPreviewCounters';
import type { OpinionPreview_opinion } from './__generated__/OpinionPreview_opinion.graphql';

type Props = {
  opinion: OpinionPreview_opinion,
  rankingThreshold?: ?number,
  link?: boolean,
  showTypeLabel?: boolean,
};

class OpinionPreview extends React.Component<Props> {
  static defaultProps = {
    link: true,
    showTypeLabel: false,
  };

  render() {
    const { opinion, rankingThreshold } = this.props;

    return (
      <React.Fragment>
        <UserAvatar user={opinion.author} />
        <div>
          {/* $FlowFixMe */}
          <OpinionInfos rankingThreshold={rankingThreshold} opinion={opinion} />
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
