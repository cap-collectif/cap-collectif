import * as React from 'react'
import { Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import AddUsersToGroupFromEmailMutation from '@mutations/AddUsersToGroupFromEmailMutation'
import ImportMembersUploader from '../csv-import/ImportMembersUploader'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useFormContext } from 'react-hook-form'

type Props = {
  groupTitle: string
  groupId: string
  setUsersToAddFromCsvEmails: React.Dispatch<React.SetStateAction<Array<string>>>
}

export const ImportMembersModal = ({ groupTitle, groupId, setUsersToAddFromCsvEmails }: Props): JSX.Element => {
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)

  const methods = useFormContext()
  const { reset, watch } = methods
  const csvEmails = watch('csvEmails')
  const file = watch('file')

  const handleOnSubmit = async (): Promise<void> => {
    if (!file) {
      return
    }

    const checkAvailabilityInput = {
      input: {
        dryRun: true,
        emails: csvEmails.uniqueAndValid?.map(user => user.email) || [],
        groupId: groupId,
      },
    }

    await AddUsersToGroupFromEmailMutation.commit(checkAvailabilityInput)
      .then(res => {
        const availableUsers = res.addUsersToGroupFromEmail.importedUsers.map(user => user.email) || []
        setUsersToAddFromCsvEmails(availableUsers)
        onClose()
      })
      .catch(() => {
        mutationErrorToast(intl)
      })
  }

  return (
    <>
      <Button variant="secondary" pt={1} width={'fit-content'} onClick={onOpen}>
        {intl.formatMessage({ id: 'global.import-via-csv' })}
      </Button>
      <Modal size={CapUIModalSize.Md} ariaLabel={'modal-title'} show={isOpen} onClose={reset}>
        <Modal.Header id={'select-members-modal-step'}>
          <Modal.Header.Label closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
            {intl.formatMessage({ id: 'users.create-group' })}
          </Modal.Header.Label>
          <Heading>{intl.formatMessage({ id: 'group-admin-add-members' })}</Heading>
        </Modal.Header>

        <Modal.Body>
          <ImportMembersUploader existingGroupName={groupTitle} />
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            variantColor="primary"
            variantSize="big"
            onClick={() => {
              onClose()
              reset()
            }}
          >
            {intl.formatMessage({
              id: 'global.cancel',
            })}
          </Button>
          <Button variant="primary" variantColor="primary" variantSize="big" onClick={handleOnSubmit}>
            {intl.formatMessage({
              id: 'group-admin-add-members',
            })}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ImportMembersModal
