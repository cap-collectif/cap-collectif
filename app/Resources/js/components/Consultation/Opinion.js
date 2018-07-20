// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { ListGroupItem } from 'react-bootstrap';
import OpinionPreviewTitle from '../Opinion/OpinionPreviewTitle';
import OpinionInfos from '../Opinion/OpinionInfos';
import UserAvatar from '../User/UserAvatar';
import OpinionPreviewCounters from '../Opinion/OpinionPreviewCounters';
import VotePiechart from '../Utils/VotePiechart';
import type { Opinion_opinion } from './__generated__/Opinion_opinion.graphql';

type Props = {
  opinion: Opinion_opinion,
};

export class Opinion extends React.Component<Props> {
  render() {
    const { opinion } = this.props;
    const author = opinion.author;
    return (
      <ListGroupItem
        className={`list-group-item__opinion has-chart${author && author.vip ? ' bg-vip' : ''}`}>
        <div className="left-block">
          <UserAvatar user={author} />
          <div>
            {/* $FlowFixMe */}
            <OpinionInfos rankingThreshold={0} opinion={opinion} />
            {/* $FlowFixMe */}
            <OpinionPreviewTitle showTypeLabel={false} link opinion={opinion} />
            {/* $FlowFixMe */}
            <OpinionPreviewCounters opinion={opinion} />
          </div>
        </div>
        {/* $FlowFixMe */}
        <VotePiechart
          top={10}
          height={'90px'}
          width={'145px'}
          ok={opinion.votesOk.totalCount}
          nok={opinion.votesNok.totalCount}
          mitige={opinion.votesMitige.totalCount}
        />
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(
  Opinion,
  graphql`
    fragment Opinion_opinion on Opinion {
      ...OpinionPreviewCounters_opinion
      ...OpinionInfos_opinion
      ...OpinionPreviewTitle_opinion
      id
      url
      title
      createdAt
      updatedAt
      votesOk: votes(first: 0, value: YES) {
        totalCount
      }
      votesNok: votes(first: 0, value: NO) {
        totalCount
      }
      votesMitige: votes(first: 0, value: MITIGE) {
        totalCount
      }
      pinned
      author {
        vip
        displayName
        media {
          url
        }
        show_url
      }
      section {
        title
        versionable
        linkable
        sourceable
        voteWidgetType
      }
    }
  `,
);
