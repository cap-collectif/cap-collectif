// @flow
import React from 'react';
import moment from 'moment';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedDate } from 'react-intl';
import Media from '../../Ui/Medias/Media/Media';
import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';
// import { CardUser } from '../../Ui/Card/CardUser';
import UnpublishedLabel from '../../Publishable/UnpublishedLabel';
import type { ProposalPreviewHeader_proposal } from './__generated__/ProposalPreviewHeader_proposal.graphql';
import Card from '../../Ui/Card/Card';

type Props = { proposal: ProposalPreviewHeader_proposal };

export class ProposalPreviewHeader extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    const date = proposal.publishedAt || proposal.createdAt;
    // return (
    //   <CardUser>
    //     <div className="card__user__avatar">
    //       <UserAvatar user={proposal.author} />
    //     </div>
    //     <div className="ellipsis">
    //       <UserLink user={proposal.author} />
    //       <p className="excerpt small">
    //         <FormattedDate value={moment(date)} day="numeric" month="long" year="numeric" />
    //       </p>
    //       {/* $FlowFixMe */}
    //       <UnpublishedLabel publishable={proposal} />
    //     </div>
    //     <hr />
    //   </CardUser>
    // );

    return (
      <Media>
        <Media.Left>
          {/* $FlowFixMe Will be a fragment soon */}
          <UserAvatar user={proposal.author} />
        </Media.Left>
        <Media.Body>
          <Card.Title tagName="h3">Media Heading</Card.Title>
          <UserLink user={proposal.author} />
          <p>
            <FormattedDate value={moment(date)} day="numeric" month="long" year="numeric" />
          </p>
          {/* $FlowFixMe */}
          <UnpublishedLabel publishable={proposal} />
        </Media.Body>
      </Media>
    );
  }
}

export default createFragmentContainer(ProposalPreviewHeader, {
  proposal: graphql`
    fragment ProposalPreviewHeader_proposal on Proposal {
      ...UnpublishedLabel_publishable
      publishedAt
      createdAt
      author {
        id
        displayName
        url
        media {
          url
        }
      }
    }
  `,
});
