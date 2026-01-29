import React, { useRef } from 'react'
import { usePaginationFragment, graphql } from 'react-relay'
import InfiniteScroll from 'react-infinite-scroller'
import { useIntl } from 'react-intl'
import AppBox from '~ui/Primitives/AppBox'
import Flex from '~ui/Primitives/Layout/Flex'
import Spinner from '~ds/Spinner/Spinner'
import InfoMessage from '~ds/InfoMessage/InfoMessage'

export const USERS_PAGINATION = 20

const USERS_FRAGMENT = graphql`
  fragment InternalMembers_query_users on Query
  @argumentDefinitions(emailConfirmed: { type: "Boolean" }, count: { type: "Int!" }, cursor: { type: "String" })
  @refetchable(queryName: "InternalMembersPaginationQuery") {
    refusingMembers: users(consentInternalCommunication: false, emailConfirmed: $emailConfirmed, superAdmin: true) {
      totalCount
    }
    members: users(first: $count, after: $cursor, emailConfirmed: $emailConfirmed, consentInternalCommunication: true, superAdmin: true)
      @connection(key: "InternalMembers_members") {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
          email
        }
      }
    }
  }
`

const PARTICIPANTS_FRAGMENT = graphql`
  fragment InternalMembers_query_participants on Query
  @argumentDefinitions(emailConfirmed: { type: "Boolean" }, count: { type: "Int!" }, cursor: { type: "String" })
  @refetchable(queryName: "InternalParticipantsPaginationQuery") {
    refusingParticipants: participants(consentInternalCommunication: false, emailConfirmed: $emailConfirmed) {
      totalCount
    }
    participants(first: $count, after: $cursor, emailConfirmed: $emailConfirmed, consentInternalCommunication: true)
      @connection(key: "InternalParticipants_participants") {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
          email
        }
      }
    }
  }
`

const InternalMembers = ({ query: queryRef }) => {
  const listMembersRef = useRef(null)
  const intl = useIntl()

  const {
    data: usersData,
    loadNext: loadNextUsers,
    hasNext: hasNextUsers,
  } = usePaginationFragment(USERS_FRAGMENT, queryRef)
  const {
    data: participantsData,
    loadNext: loadNextParticipants,
    hasNext: hasNextParticipants,
  } = usePaginationFragment(PARTICIPANTS_FRAGMENT, queryRef)

  const users = usersData.members.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
  const participants = participantsData.participants.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)

  const contributors = [...users, ...participants]
  const refusingContributorsTotalCount =
    usersData.refusingMembers.totalCount + participantsData.refusingParticipants.totalCount

  return (
    <AppBox as="ul" p={0} m={0} css={{ listStyle: 'none', overflow: 'auto', maxHeight: '300px' }} ref={listMembersRef}>
      {refusingContributorsTotalCount > 0 && (
        <InfoMessage variant="info" mb={6}>
          <InfoMessage.Title>
            {intl.formatMessage({ id: 'mailingList-refusing-members-count' }, { num: refusingContributorsTotalCount })}
          </InfoMessage.Title>
          <InfoMessage.Content>
            {intl.formatMessage({ id: 'mailingList-refusing-members' }, { num: refusingContributorsTotalCount })}
          </InfoMessage.Content>
        </InfoMessage>
      )}

      <InfiniteScroll
        key="infinite-scroll-internal-members"
        initialLoad={false}
        pageStart={0}
        loadMore={() => {
          if (hasNextUsers) {
            loadNextUsers(USERS_PAGINATION)
          }
          if (hasNextParticipants) {
            loadNextParticipants(USERS_PAGINATION)
          }
        }}
        hasMore={hasNextUsers || hasNextParticipants}
        loader={
          <Flex direction="row" justify="center" key={0}>
            <Spinner size="m" />
          </Flex>
        }
        getScrollParent={() => listMembersRef.current}
        useWindow={false}
      >
        {contributors.map(contributor => (
          <AppBox as="li" key={contributor.id} mb={3}>
            {contributor.email}
          </AppBox>
        ))}
      </InfiniteScroll>
    </AppBox>
  )
}

export default InternalMembers
