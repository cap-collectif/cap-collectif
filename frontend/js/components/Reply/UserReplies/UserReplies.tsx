import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import ReplyLink from '../Edit/ReplyLink/ReplyLink'
import type { UserReplies_questionnaire } from '~relay/UserReplies_questionnaire.graphql'
import '~relay/UserReplies_questionnaire.graphql'
import type { UserReplies_query } from '~relay/UserReplies_query.graphql'
import '~relay/UserReplies_query.graphql'
import ListGroup from '~/components/Ui/List/ListGroup'
import UserRepliesContainer from './UserReplies.style'
type Props = {
  readonly questionnaire: UserReplies_questionnaire
  readonly query: UserReplies_query
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
  return (
    <UserRepliesContainer>
      <h3 className="h4">
        <FormattedMessage
          id="reply.show.title"
          values={{
            num: replies.length,
          }}
        />
      </h3>
      <ListGroup>
        {replies.map((reply, i) => {
          return reply ? <ReplyLink reply={reply} questionnaire={questionnaire} key={i} /> : null
        })}
      </ListGroup>
    </UserRepliesContainer>
  )
}

export default createFragmentContainer(UserReplies, {
  questionnaire: graphql`
    fragment UserReplies_questionnaire on Questionnaire @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      userReplies: viewerReplies(first: 100)
        @connection(key: "UserReplies_userReplies")
        @include(if: $isAuthenticated) {
        totalCount
        edges {
          node {
            ...ReplyLink_reply
          }
        }
      }
      ...ReplyLink_questionnaire
    }
  `,
  query: graphql`
    fragment UserReplies_query on Query
    @argumentDefinitions(anonymousRepliesIds: { type: "[ID!]!" }, isNotAuthenticated: { type: "Boolean!" }) {
      anonymousReplies: nodes(ids: $anonymousRepliesIds) @include(if: $isNotAuthenticated) {
        ... on Reply {
          ...ReplyLink_reply
        }
      }
    }
  `,
})
