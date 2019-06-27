// @flow
import React from 'react';
import moment from 'moment';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedDate } from 'react-intl';
import Media from '../../Ui/Medias/Media/Media';
import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';
import UnpublishedLabel from '../../Publishable/UnpublishedLabel';
import type { ProposalPreviewUser_proposal } from '~relay/ProposalPreviewUser_proposal.graphql';

type Props = { proposal: ProposalPreviewUser_proposal };

export class ProposalPreviewUser extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    const date = proposal.publishedAt || proposal.createdAt;

    return (
      <Media>
        <Media.Left>
          {/* $FlowFixMe Will be a fragment soon */}
          <UserAvatar user={proposal.author} />
        </Media.Left>
        <Media.Body>
          <UserLink className="excerpt" user={proposal.author} />
          <div className="excerpt small">
            <FormattedDate value={moment(date)} day="numeric" month="long" year="numeric" />
          </div>
          {/* $FlowFixMe */}
          <UnpublishedLabel publishable={proposal} />
        </Media.Body>
      </Media>
    );
  }
}

export default createFragmentContainer(ProposalPreviewUser, {
  proposal: graphql`
    fragment ProposalPreviewUser_proposal on Proposal {
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
