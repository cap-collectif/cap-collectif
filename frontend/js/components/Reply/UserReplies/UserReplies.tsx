import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import ReplyLink from '../Edit/ReplyLink/ReplyLink'
import type { UserReplies_questionnaire$data } from '~relay/UserReplies_questionnaire.graphql'
import '~relay/UserReplies_questionnaire.graphql'
import type { UserReplies_query$data } from '~relay/UserReplies_query.graphql'
import '~relay/UserReplies_query.graphql'
import ListGroup from '~/components/Ui/List/ListGroup'
import UserRepliesContainer from './UserReplies.style'
type Props = {
  readonly questionnaire: UserReplies_questionnaire$data
  readonly query: UserReplies_query$data
}

const UserReplies = ({ questionnaire, query }: Props) => {
  const anonymousReplies = query?.anonymousReplies?.filter(Boolean) ?? []
  const hasAnonymousReplies = anonymousReplies.length > 0
  const hasUserReplies = questionnaire?.userReplies && questionnaire?.userReplies?.totalCount > 0

  if (!hasAnonymousReplies && !hasUserReplies) {
    return null
  }

  const replies = hasAnonymousReplies
    ? anonymousReplies
    : questionnaire.userReplies?.edges?.map(edge => edge?.node) ?? []

  const allRepliesAreMissingRequirements = replies.every(reply => reply.completionStatus === 'MISSING_REQUIREMENTS')

  return (
    <UserRepliesContainer>
      <h3 className="h4">
        <FormattedMessage
          id={allRepliesAreMissingRequirements ? 'reply.missing.requirements.show.title' : 'reply.show.title'}
          values={{
            num: replies.length,
          }}
        />
      </h3>
      <ListGroup id="replies-list">
        {replies.map((reply, i) => {
          return reply ? <ReplyLink reply={reply} questionnaire={questionnaire} key={i} /> : null
        })}
      </ListGroup>
    </UserRepliesContainer>
  )
}

export default createFragmentContainer(UserReplies, {
  questionnaire: graphql`
    fragment UserReplies_questionnaire on Questionnaire
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      userReplies: viewerReplies(first: 100)
        @connection(key: "UserReplies_userReplies")
        @include(if: $isAuthenticated) {
        totalCount
        edges {
          node {
            completionStatus
            ...ReplyLink_reply @arguments(isAuthenticated: $isAuthenticated)
          }
        }
      }
      ...ReplyLink_questionnaire
    }
  `,
  query: graphql`
    fragment UserReplies_query on Query
    @argumentDefinitions(
      anonymousRepliesIds: { type: "[ID!]!" }
      isNotAuthenticated: { type: "Boolean!" }
      isAuthenticated: { type: "Boolean!" }
    ) {
      anonymousReplies: nodes(ids: $anonymousRepliesIds) @include(if: $isNotAuthenticated) {
        ... on Reply {
          completionStatus
          ...ReplyLink_reply @arguments(isAuthenticated: $isAuthenticated)
        }
      }
    }
  `,
})
