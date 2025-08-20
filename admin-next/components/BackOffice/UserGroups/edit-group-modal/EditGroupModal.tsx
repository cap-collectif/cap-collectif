import * as React from 'react'
import {
  Box,
  Button,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  Heading,
  Modal,
  Spinner,
  TabBar,
  Table,
  toast,
} from '@cap-collectif/ui'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { pxToRem } from '@shared/utils/pxToRem'
import MembersModalTab from './MembersModalTab'
import SettingsModalTab from './SettingsModalTab'
import DeleteGroupModal from '../delete-group-modal/DeleteGroupModal'
import { UpdateGroupFormProps } from '../UserGroups.type'
import UpdateGroupMutation from '@mutations/UpdateGroupMutation'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { useDisclosure } from '@liinkiing/react-hooks'
import { UserGroupsList_query$key } from '@relay/UserGroupsList_query.graphql'
import { graphql, RefetchFnDynamic, useFragment } from 'react-relay'
import { OperationType } from 'relay-runtime'
import { EditGroupModal_group$key } from '@relay/EditGroupModal_group.graphql'

type Props = {
  group: EditGroupModal_group$key
  refetch: RefetchFnDynamic<OperationType, UserGroupsList_query$key>
  term: string
  connectionId: string
}

const GROUP_FRAGMENT = graphql`
  fragment EditGroupModal_group on Group {
    id
    title
    description
  }
`

export const EditGroupModal: React.FC<Props> = ({ group: groupRef, refetch, term, connectionId }) => {
  const intl = useIntl()
  const group = useFragment(GROUP_FRAGMENT, groupRef)
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const [membersToRemoveIds, setMembersToRemoveIds] = React.useState<Array<string>>([])
  const [usersToAddFromCsvEmails, setUsersToAddFromCsvEmails] = React.useState<Array<string>>([])

  const methods = useForm<UpdateGroupFormProps>({
    mode: 'onSubmit',
    defaultValues: {
      title: group.title,
      description: group.description,
      file: null,
    },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods

  const onSubmit = async (data: UpdateGroupFormProps) => {
    const usersToAddToGroupFromInputIds = data.users?.map(user => user.value) || []

    const existingUserEmails = new Set(data.users?.map(user => user.value?.toLowerCase()).filter(Boolean) || [])
    const uniqueEmails = usersToAddFromCsvEmails.filter(email => !existingUserEmails.has(email.toLowerCase()))

    const updateGroupInfoInput = {
      input: {
        groupId: group.id,
        title: data.title,
        description: data.description,
        emails: uniqueEmails,
        toAddUserIds: usersToAddToGroupFromInputIds,
        toRemoveUserIds: membersToRemoveIds,
      },
    }

    await UpdateGroupMutation.commit(updateGroupInfoInput)
      .then(() => {
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'admin.update.successful' }),
        })

        reset({
          title: data.title,
          description: data.description,
        })

        setMembersToRemoveIds([])
        setUsersToAddFromCsvEmails([])
        refetch({ term })
        onClose()
      })
      .catch(() => {
        mutationErrorToast(intl)
      })
  }

  return (
    <>
      <Table.Td
        position={'relative'}
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={e => e.key === 'Enter' && onOpen()}
        sx={{
          '&:focus-visible': {
            a: {
              textDecoration: 'underline',
              color: 'primary.base',
            },
          },
        }}
      >
        <Box
          as="a"
          href={null}
          sx={{
            cursor: 'pointer',
          }}
        >
          {group.title}
        </Box>
      </Table.Td>
      <Modal
        ariaLabelledby="modal-title"
        show={isOpen}
        onClose={() => {
          reset()
          onClose()
          setMembersToRemoveIds([])
          setUsersToAddFromCsvEmails([])
        }}
        size={CapUIModalSize.SidePanel}
        ariaLabel={''}
        hideOnClickOutside={false} // if not set to false, the modal will be closed if the user closes a toast
      >
        {({ hide }) => (
          <>
            <Modal.Header
              closeIconLabel={intl.formatMessage({ id: 'global.close' })}
              borderBottom={0}
              paddingBottom={1}
              backgroundColor={'primary.100'}
            >
              <Heading id="modal-title">{intl.formatMessage({ id: 'admin.users.edit-group' })}</Heading>
            </Modal.Header>

            <FormProvider {...methods}>
              <Modal.Body p={0} pt={0}>
                <TabBar
                  defaultTab="members"
                  position={'sticky'}
                  top={0}
                  right={0}
                  height={pxToRem(48)}
                  backgroundColor={'primary.100'}
                  zIndex={99}
                >
                  <TabBar.Pane id="members" title={intl.formatMessage({ id: 'organisation.members' })}>
                    <React.Suspense
                      fallback={
                        <Flex alignItems="center" justifyContent="center" width="100%" mt="xxl">
                          <Spinner size={CapUIIconSize.Xl} color="gray.150" />
                        </Flex>
                      }
                    >
                      <MembersModalTab
                        groupTitle={group.title}
                        groupId={group.id}
                        membersToRemoveIds={membersToRemoveIds}
                        setMembersToRemoveIds={setMembersToRemoveIds}
                        usersToAddFromCsvEmails={usersToAddFromCsvEmails}
                        setUsersToAddFromCsvEmails={setUsersToAddFromCsvEmails}
                      />
                    </React.Suspense>
                  </TabBar.Pane>
                  <TabBar.Pane id="settings" title={intl.formatMessage({ id: 'global.params' })}>
                    <SettingsModalTab />
                  </TabBar.Pane>
                </TabBar>
              </Modal.Body>
            </FormProvider>

            <Modal.Footer>
              <Flex justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
                <Flex justifyContent={'flex-start'} gap={2}>
                  <Button
                    variant="primary"
                    variantColor="primary"
                    variantSize="big"
                    onClick={() => handleSubmit(data => onSubmit(data))()}
                    isLoading={isSubmitting}
                  >
                    {intl.formatMessage({ id: 'global.save' })}
                  </Button>
                  <Button
                    variant="secondary"
                    variantColor="primary"
                    variantSize="big"
                    onClick={() => {
                      reset()
                      hide()
                      setMembersToRemoveIds([])
                      setUsersToAddFromCsvEmails([])
                    }}
                  >
                    {intl.formatMessage({ id: 'global.cancel' })}
                  </Button>
                </Flex>

                <DeleteGroupModal
                  button="regular"
                  groupId={group.id}
                  closeParentModal={onClose}
                  refetch={refetch}
                  term={term}
                  connectionId={connectionId}
                />
              </Flex>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  )
}

export default EditGroupModal
