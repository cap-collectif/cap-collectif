import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Button, Modal } from 'react-bootstrap'
import { reduxForm } from 'redux-form'
import { useDisclosure } from '@liinkiing/react-hooks'
import CloseButton from '../Form/CloseButton'
import SubmitButton from '../Form/SubmitButton'
import CreateGroupMutation from '../../mutations/CreateGroupMutation'
import type { CreateGroupMutationResponse } from '~relay/CreateGroupMutation.graphql'
import GroupForm from './GroupForm'
import { fromGlobalId } from '@shared/utils/fromGlobalId'

export type Props = {
  submit: (...args: Array<any>) => any
  submitting: boolean
}
type FormValues = Record<string, any>
const formName = 'group-create'

const validate = ({ title }) => {
  const errors: any = {}

  if (!title || title.length === 0) {
    errors.title = 'global.constraints.notBlank'
  }

  return errors
}

const onSubmit = (values: FormValues) =>
  CreateGroupMutation.commit({
    input: values,
  }).then((resp: CreateGroupMutationResponse) => {
    if (resp.createGroup) {
      const { id } = fromGlobalId(resp.createGroup.group.id)
      window.location.href = `${window.location.protocol}//${window.location.host}/admin/capco/app/group/${id}/edit`
    }
  })

export const GroupCreateButton = ({ submitting, submit }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const intl = useIntl()
  return (
    <div>
      <Button
        id="add-group"
        bsStyle="default"
        style={{
          marginTop: 10,
        }}
        onClick={onOpen}
      >
        <FormattedMessage id="global.add" />
      </Button>
      <Modal animation={false} show={isOpen} onHide={onClose} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header
          closeButton
          closeLabel={intl.formatMessage({
            id: 'close.modal',
          })}
        >
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="group.create.title" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <GroupForm />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id="confirm-group-create"
            label="global.add"
            isSubmitting={submitting}
            onSubmit={() => {
              submit(formName)
            }}
          />
        </Modal.Footer>
      </Modal>
    </div>
  )
}
export default reduxForm({
  onSubmit,
  validate,
  form: formName,
})(GroupCreateButton)
