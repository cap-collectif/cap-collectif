import * as React from 'react'
import { FormattedMessage, FormattedDate } from 'react-intl'
import moment from 'moment'
import { graphql, createFragmentContainer } from 'react-relay'
import Truncate from 'react-truncate'
import classNames from 'classnames'
import type { VoteItem_vote } from '~relay/VoteItem_vote.graphql'
import UserAvatarDeprecated from '../User/UserAvatarDeprecated'
import UserLink from '../User/UserLink'
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper'
import { translateContent } from '@shared/utils/contentTranslator'

type Props = {
  vote: VoteItem_vote
}
type ListVoteItemProps = {
  children: JSX.Element | JSX.Element[] | string
  id?: string
}

const ListVoteItem = ({ children }: ListVoteItemProps) => (
  <li className="opinion  opinion--vote block  block--bordered  box">{children}</li>
)

export class VoteItem extends React.Component<Props> {
  render() {
    const { vote } = this.props
    let voteType = 'votes.type.propositionVote'
    let voteVerbe = 'votes.has'
    let voteLabelClass = classNames('label', 'label-success')
    let voteLabel = 'votes.value.voteFor'

    if (vote.value !== null && vote.value === 'YES') {
      voteVerbe = 'global.is'
      voteLabelClass = classNames('label', 'label-success')
      voteLabel = 'global.ok'
    } else if (vote.value !== null && vote.value === 'NO') {
      voteVerbe = 'votes.isNot'
      voteLabelClass = classNames('label', 'label-danger')
      voteLabel = 'global.nok'
    } else if (vote.value !== null && vote.value === 'MITIGE') {
      voteVerbe = 'global.is'
      voteLabelClass = classNames('label', 'label-warning')
      voteLabel = 'global.mitige'
    }

    if (vote.__typename === 'CommentVote') {
      voteType = 'votes.type.commentary'
    } else if (vote.__typename === 'ArgumentVote') {
      voteType = 'votes.type.argument'
    } else if (vote.__typename === 'VersionVote') {
      voteType = 'votes.type.version'
    } else if (vote.value !== null) {
      voteType = 'votes.type.proposition'
    }

    if (vote.__typename === 'ProposalVote' && vote.step && isInterpellationContextFromStep(vote.step)) {
      voteType = 'supports.type.interpellation'
      voteVerbe = 'supports.has'
      voteLabel = 'supports.value.supported'
    }

    const relatedBody = vote.related ? translateContent(vote.related.body) : ''
    return (
      <ListVoteItem id={`vote-${vote.id}`}>
        {/* @ts-expect-error will be a fragment soon */}
        <UserAvatarDeprecated user={vote.author} className="pull-left" />
        <div className="opinion__data">
          <p className="h5 opinion__user">
            {/** @ts-ignore */}
            <UserLink user={vote.author} /> <FormattedMessage id={voteVerbe} />{' '}
            <span className={voteLabelClass}>
              <FormattedMessage id={voteLabel} />
            </span>{' '}
            <FormattedMessage id={voteType} />{' '}
            <span className="excerpt  opinion__date">
              <FormattedDate
                // @ts-ignore
                value={moment(vote.createdAt)}
                day="numeric"
                month="long"
                year="numeric"
                hour="numeric"
                minute="numeric"
              />
            </span>
          </p>
        </div>
        <p>
          <a href={vote.related ? vote.related.url : ''}>
            {vote.related && vote.related.title ? (
              translateContent(vote.related.title)
            ) : (
              <Truncate>{relatedBody}</Truncate>
            )}
          </a>
        </p>
      </ListVoteItem>
    )
  }
}
export default createFragmentContainer(VoteItem, {
  vote: graphql`
    fragment VoteItem_vote on Vote {
      id
      __typename
      createdAt
      ... on OpinionVote {
        value
      }
      ... on VersionVote {
        value
      }
      ... on ProposalUserVote {
        step {
          ...interpellationLabelHelper_step @relay(mask: false)
        }
      }
      author {
        id
        slug
        displayName
        url
        vip
        ...UserLink_user
        media {
          url
        }
      }
      related {
        id
        url
        ... on Opinion {
          title
        }
        ... on Version {
          title
        }
        ... on Proposal {
          title
        }
        ... on Source {
          title
        }
        ... on Comment {
          body
        }
        ... on Argument {
          body
        }
      }
    }
  `,
})
