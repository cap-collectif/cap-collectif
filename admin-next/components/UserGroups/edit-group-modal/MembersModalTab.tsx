/* eslint-disable relay/unused-fields */
import * as React from 'react'
import { Flex, FormLabel, Modal, Search } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { FormControl } from '@cap-collectif/form'
import ImportMembersModal from './ImportMembersModal'
import UserListField from '@components/Form/UserListField'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useFormContext } from 'react-hook-form'
import debounce from '@shared/utils/debounce-promise'
import { MembersModalTab_Query as MembersModalTab_QueryType } from '@relay/MembersModalTab_Query.graphql'
import { CONNECTION_NODES_PER_PAGE } from '../utils'
import MembersList from './MembersList/MembersList'

const QUERY = graphql`
  query MembersModalTab_Query($groupId: ID!, $first: Int!, $term: String) {
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
            }
          }
        }
      }
    }
  }
`

type Props = {
  groupTitle: string
  groupId: string
  membersToRemoveIds: string[]
  setMembersToRemoveIds: React.Dispatch<React.SetStateAction<string[]>>
  usersToAddFromCsvEmails: Array<string>
  setUsersToAddFromCsvEmails: React.Dispatch<React.SetStateAction<Array<string>>>
}

export const MembersModalTab = ({
  groupTitle,
  groupId,
  membersToRemoveIds,
  setMembersToRemoveIds,
  usersToAddFromCsvEmails,
  setUsersToAddFromCsvEmails,
}: Props): JSX.Element => {
  const intl = useIntl()

  const [term, setTerm] = React.useState<string>('')
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const query = useLazyLoadQuery<MembersModalTab_QueryType>(QUERY, { groupId, first: CONNECTION_NODES_PER_PAGE, term })

  const { members } = query.node

  const methods = useFormContext()
  const { control } = methods

  const onTermChange = React.useCallback(
    debounce((value: string) => {
      setTerm(value)
      setIsLoading(false)
    }, 1000),
    [],
  )

  const handleTermChange = (value: string) => {
    setIsLoading(true)
    if (value === '') {
      setIsLoading(false)
    }
    onTermChange(value)
  }

  const userIdsToNotSearch =
    members.edges.reduce((acc, user) => {
      acc.push(user.node.userId)
      return acc
    }, []) || []

  return (
    <Modal.Body width={'100%'}>
      <Flex direction="column" spacing={2} maxWidth={'100%'}>
        <Flex gap={2} width={'100%'}>
          <FormControl name="users" control={control} sx={{ flexGrow: 1 }}>
            <FormLabel htmlFor="users" label={intl.formatMessage({ id: 'group-admin-add-members' })} />

            <UserListField
              control={control}
              name="users"
              isMulti
              userIdsToNoSearch={userIdsToNotSearch}
              placeholder={intl.formatMessage({ id: 'admin.members.username-or-email' })}
            />
          </FormControl>

          <Flex direction={'column'} gap={1}>
            <FormLabel
              label={intl.formatMessage({ id: 'modal-add-members-via-file' })}
              sx={{ width: 'fit-content', whiteSpace: 'nowrap' }}
            />
            <ImportMembersModal
              groupId={groupId}
              groupTitle={groupTitle}
              setUsersToAddFromCsvEmails={setUsersToAddFromCsvEmails}
            />
          </Flex>
        </Flex>

        <FormControl name="membersSearch" control={control}>
          <FormLabel htmlFor="membersSearch" label={intl.formatMessage({ id: 'admin.groups.list' })} />
          <Search
            placeholder={intl.formatMessage({ id: 'global.search' })}
            value={term}
            onChange={handleTermChange}
            isLoading={isLoading}
          />
        </FormControl>

        <MembersList
          queryReference={query}
          membersToRemoveIds={membersToRemoveIds}
          setMembersToRemoveIds={setMembersToRemoveIds}
          usersToAddFromCsvEmails={usersToAddFromCsvEmails}
          setUsersToAddFromCsvEmails={setUsersToAddFromCsvEmails}
        />
      </Flex>
    </Modal.Body>
  )
}

export default MembersModalTab
