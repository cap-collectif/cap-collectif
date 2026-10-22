import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import { CapUIIconSize, CapUIModalSize, Flex, Heading, Modal, Spinner } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import type { MembersModalMailingListQuery } from '@relay/MembersModalMailingListQuery.graphql'
import type { MembersModal_mailingList$key } from '@relay/MembersModal_mailingList.graphql'
import type { MembersModalInternalQuery } from '@relay/MembersModalInternalQuery.graphql'
import type { MembersModal_users$key } from '@relay/MembersModal_users.graphql'
import type { MembersModal_participants$key } from '@relay/MembersModal_participants.graphql'
import type { MembersModalGroupQuery } from '@relay/MembersModalGroupQuery.graphql'
import type { MembersModal_group$key } from '@relay/MembersModal_group.graphql'
import type { MembersModalProjectQuery } from '@relay/MembersModalProjectQuery.graphql'
import type { MembersModal_project$key } from '@relay/MembersModal_project.graphql'
import { MEMBERS_PER_PAGE } from '../utils'
import MembersList from './MembersList'

export type Recipient =
  | { readonly type: 'MAILING_LIST'; readonly id: string; readonly name: string }
  | { readonly type: 'INTERNAL'; readonly name: string }
  | { readonly type: 'GROUP'; readonly id: string; readonly name: string }
  | { readonly type: 'PROJECT'; readonly id: string; readonly name: string }

type Member = { readonly id?: string | null; readonly email?: string | null; readonly username?: string | null }

const toListItems = (members: ReadonlyArray<Member | null | undefined>, anonymousLabel: string) =>
  members
    .filter((member): member is Member => Boolean(member))
    .map((member, index) => ({
      key: member.id ?? `${member.email ?? member.username ?? 'anonymous'}-${index}`,
      label: member.email ?? member.username ?? anonymousLabel,
    }))

const MAILING_LIST_FRAGMENT = graphql`
  fragment MembersModal_mailingList on MailingList
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }, isAdmin: { type: "Boolean!" })
  @refetchable(queryName: "MembersModalMailingListPaginationQuery") {
    allMembers: users(consentInternalCommunicationOnly: false) {
      totalCount
    }
    members: users(first: $count, after: $cursor, consentInternalCommunicationOnly: true)
      @connection(key: "MembersModal_members", filters: []) {
      totalCount
      edges {
        node {
          id
          email @include(if: $isAdmin)
          username
        }
      }
    }
  }
`

const MailingListMembers: React.FC<{ id: string }> = ({ id }) => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const query = useLazyLoadQuery<MembersModalMailingListQuery>(
    graphql`
      query MembersModalMailingListQuery($id: ID!, $count: Int!, $cursor: String, $isAdmin: Boolean!) {
        mailingList: node(id: $id) {
          ... on MailingList {
            ...MembersModal_mailingList @arguments(count: $count, cursor: $cursor, isAdmin: $isAdmin)
          }
        }
      }
    `,
    { id, count: MEMBERS_PER_PAGE, isAdmin: viewerSession.isAdmin },
  )
  const { data, hasNext, isLoadingNext, loadNext } = usePaginationFragment(
    MAILING_LIST_FRAGMENT,
    query.mailingList as MembersModal_mailingList$key | null,
  )

  if (!data) return null

  return (
    <MembersList
      members={toListItems(
        data.members.edges?.map(edge => edge?.node) ?? [],
        intl.formatMessage({ id: 'global.anonymous' }),
      )}
      refusingCount={data.allMembers.totalCount - data.members.totalCount}
      hasNext={hasNext}
      isLoadingNext={isLoadingNext}
      loadNext={() => loadNext(MEMBERS_PER_PAGE)}
    />
  )
}

const USERS_FRAGMENT = graphql`
  fragment MembersModal_users on Query
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" })
  @refetchable(queryName: "MembersModalUsersPaginationQuery") {
    refusingUsers: users(consentInternalCommunication: false, emailConfirmed: true, superAdmin: true) {
      totalCount
    }
    users(first: $count, after: $cursor, emailConfirmed: true, consentInternalCommunication: true, superAdmin: true)
      @connection(key: "MembersModal_users") {
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
  fragment MembersModal_participants on Query
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" })
  @refetchable(queryName: "MembersModalParticipantsPaginationQuery") {
    refusingParticipants: participants(consentInternalCommunication: false, emailConfirmed: true) {
      totalCount
    }
    participants(first: $count, after: $cursor, emailConfirmed: true, consentInternalCommunication: true)
      @connection(key: "MembersModal_participants") {
      edges {
        node {
          id
          email
        }
      }
    }
  }
`

// Registered users and participants without account: the "REGISTERED" internal list, only available to admins
const InternalMembers: React.FC = () => {
  const intl = useIntl()
  const query = useLazyLoadQuery<MembersModalInternalQuery>(
    graphql`
      query MembersModalInternalQuery($count: Int!, $cursor: String) {
        ...MembersModal_users @arguments(count: $count, cursor: $cursor)
        ...MembersModal_participants @arguments(count: $count, cursor: $cursor)
      }
    `,
    { count: MEMBERS_PER_PAGE },
  )
  const users = usePaginationFragment(USERS_FRAGMENT, query as MembersModal_users$key)
  const participants = usePaginationFragment(PARTICIPANTS_FRAGMENT, query as MembersModal_participants$key)

  return (
    <MembersList
      members={toListItems(
        [
          ...(users.data.users.edges?.map(edge => edge?.node) ?? []),
          ...(participants.data.participants.edges?.map(edge => edge?.node) ?? []),
        ],
        intl.formatMessage({ id: 'global.anonymous' }),
      )}
      refusingCount={users.data.refusingUsers.totalCount + participants.data.refusingParticipants.totalCount}
      hasNext={users.hasNext || participants.hasNext}
      isLoadingNext={users.isLoadingNext || participants.isLoadingNext}
      loadNext={() => {
        if (users.hasNext) users.loadNext(MEMBERS_PER_PAGE)
        if (participants.hasNext) participants.loadNext(MEMBERS_PER_PAGE)
      }}
    />
  )
}

const GROUP_FRAGMENT = graphql`
  fragment MembersModal_group on Group
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }, isAdmin: { type: "Boolean!" })
  @refetchable(queryName: "MembersModalGroupPaginationQuery") {
    refusingMembers: users(consentInternalCommunication: false) {
      totalCount
    }
    members: users(first: $count, after: $cursor, consentInternalCommunication: true)
      @connection(key: "MembersModal_members", filters: []) {
      edges {
        node {
          id
          email @include(if: $isAdmin)
          username
        }
      }
    }
  }
`

const GroupMembers: React.FC<{ id: string }> = ({ id }) => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const query = useLazyLoadQuery<MembersModalGroupQuery>(
    graphql`
      query MembersModalGroupQuery($id: ID!, $count: Int!, $cursor: String, $isAdmin: Boolean!) {
        group: node(id: $id) {
          ... on Group {
            ...MembersModal_group @arguments(count: $count, cursor: $cursor, isAdmin: $isAdmin)
          }
        }
      }
    `,
    { id, count: MEMBERS_PER_PAGE, isAdmin: viewerSession.isAdmin },
  )
  const { data, hasNext, isLoadingNext, loadNext } = usePaginationFragment(
    GROUP_FRAGMENT,
    query.group as MembersModal_group$key | null,
  )

  if (!data) return null

  return (
    <MembersList
      members={toListItems(
        data.members.edges?.map(edge => edge?.node) ?? [],
        intl.formatMessage({ id: 'global.anonymous' }),
      )}
      refusingCount={data.refusingMembers.totalCount}
      hasNext={hasNext}
      isLoadingNext={isLoadingNext}
      loadNext={() => loadNext(MEMBERS_PER_PAGE)}
    />
  )
}

const PROJECT_FRAGMENT = graphql`
  fragment MembersModal_project on Project
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }, isAdmin: { type: "Boolean!" })
  @refetchable(queryName: "MembersModalProjectPaginationQuery") {
    emailableContributors(first: $count, after: $cursor)
      @connection(key: "MembersModal_emailableContributors", filters: []) {
      refusingCount
      edges {
        node {
          email @include(if: $isAdmin)
          username
        }
      }
    }
  }
`

const ProjectContributors: React.FC<{ id: string }> = ({ id }) => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const query = useLazyLoadQuery<MembersModalProjectQuery>(
    graphql`
      query MembersModalProjectQuery($id: ID!, $count: Int!, $cursor: String, $isAdmin: Boolean!) {
        project: node(id: $id) {
          ... on Project {
            ...MembersModal_project @arguments(count: $count, cursor: $cursor, isAdmin: $isAdmin)
          }
        }
      }
    `,
    { id, count: MEMBERS_PER_PAGE, isAdmin: viewerSession.isAdmin },
  )
  const { data, hasNext, isLoadingNext, loadNext } = usePaginationFragment(
    PROJECT_FRAGMENT,
    query.project as MembersModal_project$key | null,
  )

  if (!data) return null

  return (
    <MembersList
      members={toListItems(
        data.emailableContributors.edges?.map(edge => edge?.node) ?? [],
        intl.formatMessage({ id: 'global.anonymous' }),
      )}
      refusingCount={data.emailableContributors.refusingCount}
      hasNext={hasNext}
      isLoadingNext={isLoadingNext}
      loadNext={() => loadNext(MEMBERS_PER_PAGE)}
    />
  )
}

const MembersContent: React.FC<{ recipient: Recipient }> = ({ recipient }) => {
  switch (recipient.type) {
    case 'MAILING_LIST':
      return <MailingListMembers id={recipient.id} />
    case 'INTERNAL':
      return <InternalMembers />
    case 'GROUP':
      return <GroupMembers id={recipient.id} />
    case 'PROJECT':
      return <ProjectContributors id={recipient.id} />
  }
}

type Props = {
  readonly recipient: Recipient
  readonly disclosure: React.ReactElement
}

const MembersModal: React.FC<Props> = ({ recipient, disclosure }) => {
  const intl = useIntl()

  return (
    <Modal size={CapUIModalSize.Md} ariaLabel={recipient.name} disclosure={disclosure}>
      {({ visible }) => (
        <>
          <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
            <Heading>{recipient.name}</Heading>
          </Modal.Header>
          <Modal.Body pb={6}>
            <React.Suspense
              fallback={
                <Flex justify="center">
                  <Spinner size={CapUIIconSize.Lg} />
                </Flex>
              }
            >
              {/* The members are only fetched once the modal is open */}
              {visible ? <MembersContent recipient={recipient} /> : null}
            </React.Suspense>
          </Modal.Body>
        </>
      )}
    </Modal>
  )
}

export default MembersModal
