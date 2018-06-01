// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionPreviewTitle from '../Opinion/OpinionPreviewTitle';
import OpinionInfos from '../Opinion/OpinionInfos';
import UserAvatar from '../User/UserAvatar';
import OpinionPreviewCounters from '../Opinion/OpinionPreviewCounters';
import VotePiechart from '../Utils/VotePiechart';

type Props = {
  opinion: Object,
};

export class Opinion extends React.Component<Props> {
  render() {
    const { opinion } = this.props;
    const author = opinion.author;
    return (
      <li className={`opinion has-chart${author && author.vip ? ' bg-vip' : ''}`}>
        <div className="row">
          <div className="col-xs-12  col-sm-8  col-md-9  col-lg-10">
            <div className="opinion__body box excerpt" style={{ textAlign: 'left' }}>
              <UserAvatar user={author} className="pull-left" />
              <div className="opinion__data">
                <OpinionInfos rankingThreshold={0} opinion={opinion} />
                <OpinionPreviewTitle showTypeLabel={false} link opinion={opinion} />
                <OpinionPreviewCounters opinion={opinion} />
              </div>
            </div>
          </div>
          <div className="hidden-xs col-sm-4 col-md-3 col-lg-2">
            <VotePiechart
              top={10}
              height={'90px'}
              width={'145px'}
              ok={opinion.votesCountOk}
              nok={opinion.votesCountNok}
              mitige={opinion.votesCountMitige}
            />
          </div>
        </div>
      </li>
    );
  }
}

export default createFragmentContainer(
  Opinion,
  graphql`
    fragment Opinion_opinion on Opinion {
      id
      url
      title
      createdAt
      updatedAt
      votesCountOk
      votesCountNok
      votesCountMitige
      votesCount
      versionsCount
      connectionsCount
      sourcesCount
      argumentsCount
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
