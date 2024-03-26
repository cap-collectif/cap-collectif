import * as React from 'react'

import styled from 'styled-components'
import { submit } from 'redux-form'
import { useDispatch } from 'react-redux'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, useIntl } from 'react-intl'
import { toast } from '@cap-collectif/ui'
import CloseButton from '~/components/Form/CloseButton'
import SubmitButton from '~/components/Form/SubmitButton'
import TrashDebateArgumentMutation from '~/mutations/TrashDebateArgumentMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import type { Dispatch } from '~/types'
import { mediaQueryMobile } from '~/utils/sizes'
import type { Values } from '~/components/Moderate/ModerateForm'
import ModerateForm, { formName } from '~/components/Moderate/ModerateForm'
import Modal from '~ds/Modal/Modal'
import Heading from '~ui/Primitives/Heading'

export type ModerateArgument = {
  id: string
  state: 'PUBLISHED' | 'WAITING' | 'TRASHED'
  debateId: string
  forOrAgainst: 'FOR' | 'AGAINST'
}
type Props = {
  onClose: () => void
  argument: ModerateArgument
  relayConnection: string[]
  isAdmin?: boolean
}
const ModalContainer = styled(Modal)`
  .modal-dialog {
    width: 40%;
  }

  .modal-title {
    font-weight: 600;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .modal-dialog {
      width: auto;
    }
  }
`

const onSubmit = (values: Values, props: Props, intl: IntlShape) => {
  const { argument, onClose, relayConnection, isAdmin } = props
  const { reason, hideContent } = values
  return TrashDebateArgumentMutation.commit({
    input: {
      id: argument.id,
      trashedReason: reason,
      trashedStatus: hideContent ? 'INVISIBLE' : 'VISIBLE',
    },
    connections: relayConnection,
    debateId: argument.debateId,
    state: argument.state,
    isAdmin,
  })
    .then(response => {
      onClose()

      if (response.trash?.errorCode) {
        mutationErrorToast(intl)
      }

      toast({
        variant: 'success',
        content: intl.formatMessage({
          id: 'the-argument-has-been-successfully-moved-to-the-trash',
        }),
      })
    })
    .catch(() => {
      onClose()
      mutationErrorToast(intl)
    })
}

export const ModalModerateArgument = (props: Props): JSX.Element => {
  const { argument, onClose } = props
  const intl = useIntl()
  const dispatch = useDispatch<Dispatch>()
  return (
    <ModalContainer show={!!argument} onHide={onClose} aria-labelledby="modal-title">
      <Modal.Header
        closeLabel={intl.formatMessage({
          id: 'close.modal',
        })}
      >
        <Heading id="modal-title">
          <FormattedMessage id="moderate-argument" />
        </Heading>
      </Modal.Header>

      <Modal.Body>
        <ModerateForm onSubmit={(values: Values) => onSubmit(values, props, intl)} />
      </Modal.Body>

      <Modal.Footer>
        <CloseButton onClose={onClose} label="editor.undo" />
        <SubmitButton label="move.contribution.to.trash" onSubmit={() => dispatch(submit(formName))} bsStyle="danger" />
      </Modal.Footer>
    </ModalContainer>
  )
}
export default ModalModerateArgument
