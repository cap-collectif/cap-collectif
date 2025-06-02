/* eslint-disable relay/unused-fields */
import * as React from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import { graphql, usePaginationFragment } from 'react-relay'
import { MembersList_UsersFragment$key } from '@relay/MembersList_UsersFragment.graphql'
import { CONNECTION_NODES_PER_PAGE } from '../../utils'
import InfiniteScroll from 'react-infinite-scroller'
import { MembersModalTab_Query$data } from '@relay/MembersModalTab_Query.graphql'
import { MembersList_Query } from '@relay/MembersList_Query.graphql'
import MemberCard from './MemberCard'

const USERS_FRAGMENT = graphql`
  fragment MembersList_UsersFragment on Group
  @argumentDefinitions(countUsers: { type: "Int!" }, cursorUsers: { type: "String" }, term: {type: "String"})
  @refetchable(queryName: "MembersList_Query") {
    id
    title
    members(first: $countUsers, term: $term, after: $cursorUsers) @connection(key: "MembersList_members") {
      __typename
      totalCount
      edges {
        cursor
        node {
          userId
          username
          email
          type
        }
      }
    }
  }
`

type Props = {
  queryReference: MembersModalTab_Query$data
  membersToRemoveIds: string[]
  setMembersToRemoveIds: React.Dispatch<React.SetStateAction<string[]>>
  usersToAddFromCsvEmails: Array<string>
  setUsersToAddFromCsvEmails: React.Dispatch<React.SetStateAction<string[]>>
}

export const MembersList = ({
  queryReference,
  membersToRemoveIds,
  setMembersToRemoveIds,
  usersToAddFromCsvEmails,
  setUsersToAddFromCsvEmails,
}: Props): JSX.Element => {
  const ref = React.useRef<null | boolean>(null)

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    MembersList_Query,
    MembersList_UsersFragment$key
  >(USERS_FRAGMENT, queryReference.node)

  const { members } = data

  const removePendingMember = email => {
    setUsersToAddFromCsvEmails(prevEmails => prevEmails.filter(item => item !== email))
  }

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
        loadMore={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        hasMore={hasNext}
        isLoading={isLoadingNext}
        loader={<Spinner size={CapUIIconSize.Sm} mx={'auto'} my={2} />}
        style={{ border: 'none', padding: '0' }}
        useWindow={false}
        getScrollParent={() => ref.current}
      >
        <Flex direction={'column'} gap={2}>
          {usersToAddFromCsvEmails.map(user => {
            return (
              <MemberCard
                isPendingMember
                pendingMember={user}
                cardKey={user}
                key={user}
                setMembersToRemoveIds={setMembersToRemoveIds}
                membersToRemoveIds={membersToRemoveIds}
                removePendingMember={removePendingMember}
              />
            )
          })}

          {members.edges.map(member => {
            const currentMember = member.node

            return membersToRemoveIds.includes(currentMember.userId) ? null : (
              <MemberCard
                existingMember={currentMember}
                cardKey={currentMember.userId}
                key={currentMember.userId}
                setMembersToRemoveIds={setMembersToRemoveIds}
                membersToRemoveIds={membersToRemoveIds}
              />
            )
          })}
        </Flex>
      </InfiniteScroll>
    </Flex>
  )
}

export default MembersList
