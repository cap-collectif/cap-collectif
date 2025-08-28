/* eslint-disable relay/unused-fields */
import * as React from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import { MembersList_UsersFragment$key } from '@relay/MembersList_UsersFragment.graphql'
import { MembersList_Query } from '@relay/MembersList_Query.graphql'
import { MembersList_Members_Query } from '@relay/MembersList_Members_Query.graphql'
import { CONNECTION_NODES_PER_PAGE } from '../../utils'
import InfiniteScroll from 'react-infinite-scroller'
import MemberCard from './MemberCard'

const USERS_FRAGMENT = graphql`
  fragment MembersList_UsersFragment on Group
  @argumentDefinitions(countUsers: { type: "Int!" }, cursorUsers: { type: "String" }, term: { type: "String!" })
  @refetchable(queryName: "MembersList_Query") {
    id
    title
    members(first: $countUsers, term: $term, after: $cursorUsers) @connection(key: "MembersList_members") {
      __typename
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          userId
          username
          email
          type
          fullname
        }
      }
    }
  }
`
const MEMBERS_QUERY = graphql`
  query MembersList_Members_Query($groupId: ID!, $first: Int!, $term: String!) {
    node(id: $groupId) {
      ... on Group {
        ...MembersList_UsersFragment @arguments(countUsers: $first, term: $term)
        members(first: $first, term: $term) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              __typename
              userId
              username
              email
              type
              fullname
            }
          }
        }
      }
    }
  }
`

type Props = {
  groupId: string
  term: string
  membersToRemoveIds: string[]
  onMemberRemoval: (id: string, isEmail?: boolean) => void
  usersToAddFromCsvEmails: Array<string>
  onMembersLoaded?: (memberIds: string[]) => void
}

export const MembersList: React.FC<Props> = ({
  groupId,
  term,
  membersToRemoveIds,
  onMemberRemoval,
  usersToAddFromCsvEmails,
  onMembersLoaded,
}) => {
  const ref = React.useRef<null | boolean>(null)

  const queryData = useLazyLoadQuery<MembersList_Members_Query>(MEMBERS_QUERY, {
    groupId,
    first: CONNECTION_NODES_PER_PAGE,
    term,
  })

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    MembersList_Query,
    MembersList_UsersFragment$key
  >(USERS_FRAGMENT, queryData.node)

  const { members } = data

  React.useEffect(() => {
    if (members?.edges) {
      const memberIds = members.edges.map(edge => edge.node.userId)
      onMembersLoaded?.(memberIds)
    }
  }, [members?.edges, onMembersLoaded])

  return (
    <Flex
      direction={'column'}
      width={'100%'}
      maxHeight={'55vh'}
      overflowY={'scroll'}
      ref={ref}
      pr={2}
      my={4}
      sx={{ scrollbarWidth: 'none' }}
    >
      <InfiniteScroll
        key="infinite-scroll-group-members"
        initialLoad={false}
        loadMore={() => {
          // if (!isLoadingNext && hasNext) {
          loadNext(CONNECTION_NODES_PER_PAGE)
          // }
        }}
        hasMore={hasNext}
        isLoading={isLoadingNext}
        loader={<Spinner size={CapUIIconSize.Sm} mx={'auto'} my={2} />}
        style={{ border: 'none', padding: '0' }}
        useWindow={false}
        getScrollParent={ref.current ? () => ref.current : undefined}
      >
        <Flex direction={'column'} gap={2}>
          {usersToAddFromCsvEmails.map(email => (
            <MemberCard
              isPendingMember
              pendingMember={email}
              cardKey={email}
              key={email}
              onRemove={() => onMemberRemoval(email, true)}
            />
          ))}

          {members.edges.map(member => {
            const currentMember = member.node
            return membersToRemoveIds.includes(currentMember.userId) ? null : (
              <MemberCard
                existingMember={currentMember}
                cardKey={currentMember.userId}
                key={currentMember.userId}
                onRemove={() => onMemberRemoval(currentMember.userId)}
              />
            )
          })}
        </Flex>
      </InfiniteScroll>
    </Flex>
  )
}

export default MembersList
