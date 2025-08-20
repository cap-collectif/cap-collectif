/* eslint-disable relay/unused-fields */
import * as React from 'react'
import { CapUIIconSize, Flex, FormLabel, Modal, Search, Spinner } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { FormControl } from '@cap-collectif/form'
import ImportMembersModal from './ImportMembersModal'
import UserListField from '@components/BackOffice/Form/UserListField'
import { useFormContext } from 'react-hook-form'
import MembersList from './MembersList/MembersList'

type Props = {
  groupTitle: string
  groupId: string
  membersToRemoveIds: string[]
  setMembersToRemoveIds: React.Dispatch<React.SetStateAction<string[]>>
  usersToAddFromCsvEmails: Array<string>
  setUsersToAddFromCsvEmails: React.Dispatch<React.SetStateAction<Array<string>>>
}

export const MembersModalTab: React.FC<Props> = ({
  groupTitle,
  groupId,
  membersToRemoveIds,
  setMembersToRemoveIds,
  usersToAddFromCsvEmails,
  setUsersToAddFromCsvEmails,
}) => {
  const intl = useIntl()
  const [membersSearchTerm, setMembersSearchTerm] = React.useState<string>('')
  const [userIdsToNotSearch, setUserIdsToNotSearch] = React.useState<string[]>([])
  const [pendingMembersToRemove, setPendingMembersToRemove] = React.useState<string[]>([])

  const handleMemberRemoval = (id: string, isEmail = false) => {
    if (isEmail) {
      setPendingMembersToRemove(prev => [...prev, id.toLowerCase()])
      setUsersToAddFromCsvEmails(prev => prev.filter(email => email.toLowerCase() !== id.toLowerCase()))
    } else {
      setMembersToRemoveIds(prev => [...prev, id])
    }
  }

  const getUsersToAddFromCsvEmails = () => {
    return usersToAddFromCsvEmails.filter(email => !pendingMembersToRemove.includes(email.toLowerCase()))
  }

  const methods = useFormContext()
  const { control } = methods

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
            value={membersSearchTerm}
            onChange={setMembersSearchTerm}
          />
        </FormControl>

        <React.Suspense fallback={<Spinner size={CapUIIconSize.Xl} color="gray.150" mt="xxl" mx="auto" />}>
          <MembersList
            groupId={groupId}
            term={membersSearchTerm}
            membersToRemoveIds={membersToRemoveIds}
            onMemberRemoval={handleMemberRemoval}
            usersToAddFromCsvEmails={getUsersToAddFromCsvEmails()}
            onMembersLoaded={setUserIdsToNotSearch}
          />
        </React.Suspense>
      </Flex>
    </Modal.Body>
  )
}

export default MembersModalTab
