// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import UserAvatar from '../User/UserAvatar';
import OpinionInfos from './OpinionInfos';
import OpinionPreviewTitle from './OpinionPreviewTitle';
import OpinionPreviewCounters from './OpinionPreviewCounters';
import type { OpinionPreview_opinion } from '~relay/OpinionPreview_opinion.graphql';
import TrashedMessage from '../Trashed/TrashedMessage';
import Media from '../Ui/Medias/Media/Media';

type Props = {
  showUpdatedDate: boolean,
  opinion: OpinionPreview_opinion,
  rankingThreshold?: ?number,
  isProfile: boolean,
};

class OpinionPreview extends React.Component<Props> {
  static defaultProps = {
    showUpdatedDate: false,
    isProfile: false,
  };

  render() {
    const { opinion, rankingThreshold, showUpdatedDate, isProfile } = this.props;

    return (
      <React.Fragment>
        {opinion.__typename === 'Version' && isProfile && (
          <p>
            <FormattedMessage id="admin.fields.opinion.link" />
            {' : '}
            <a href={opinion.related ? opinion.related.url : ''}>
              {opinion.related ? opinion.related.title : ''}
            </a>
          </p>
        )}
        <Media.Left>
          {/* $FlowFixMe Will be a fragment soon */}
          <UserAvatar user={opinion.author} />
        </Media.Left>

        <Media.Body className="opinion__body">
          {/* $FlowFixMe */}
          <OpinionInfos
            rankingThreshold={rankingThreshold}
            opinion={opinion}
            showUpdatedDate={showUpdatedDate}
          />
          {/* $FlowFixMe */}
          <TrashedMessage contribution={opinion}>
            {/* $FlowFixMe */}
            <OpinionPreviewTitle opinion={opinion} showTypeLabel={false} />
          </TrashedMessage>
          {/* $FlowFixMe */}
          <OpinionPreviewCounters opinion={opinion} />
        </Media.Body>
      </React.Fragment>
    );
  }
}

export default createFragmentContainer(OpinionPreview, {
  opinion: graphql`
    fragment OpinionPreview_opinion on OpinionOrVersion {
      __typename
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
        related {
          ... on Opinion {
            title
            url
          }
        }
      }
    }
  `,
});
