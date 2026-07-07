import React from 'react'
import moment from 'moment'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedDate } from 'react-intl'
import { Text } from '@cap-collectif/ui'
import styled from 'styled-components'
import Media from '../../Ui/Medias/Media/Media'
import UnpublishedLabel from '../../Publishable/UnpublishedLabel'
import type { ProposalPreviewUser_proposal } from '~relay/ProposalPreviewUser_proposal.graphql'
import UserAvatar from '~/components/User/UserAvatar'
import { getProposalAuthorDisplayName } from '~/utils/proposalAuthor'

type Props = {
  proposal: ProposalPreviewUser_proposal
}
const MediaBody = styled(Media.Body)`
  overflow: visible;
  .cap-popover {
    button {
      background-color: transparent !important;
      border: none !important;
    }
  }
`
export class ProposalPreviewUser extends React.Component<Props> {
  render() {
    const { proposal } = this.props
    const date = proposal.publishedAt || proposal.createdAt
    const authorName = getProposalAuthorDisplayName(proposal.author)
    return (
      <Media>
        <Media.Left>
          <UserAvatar user={proposal.author} />
        </Media.Left>
        <MediaBody>
          {
            !proposal.author.slug || !proposal.author.url ? (
              <Text>{authorName}</Text>
            ) : (
              <a className="excerpt" href={proposal.author.url}>
                {authorName}
              </a>
            )
          }
          <div className="excerpt small">
            <FormattedDate value={moment(date)} day="numeric" month="long" year="numeric" />
          </div>
          <UnpublishedLabel publishable={proposal} />
        </MediaBody>
      </Media>
    )
  }
}
export default createFragmentContainer(ProposalPreviewUser, {
  proposal: graphql`
    fragment ProposalPreviewUser_proposal on Proposal {
      ...UnpublishedLabel_publishable
      publishedAt
      createdAt
      author {
        ...UserAvatar_user
        id
        username
        displayName
        ...on User {
          url
          media {
            url
          }
          slug
        }
      }
    }
  `,
})
