import * as React from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { isSubmitting, submit } from 'redux-form'
import { useSelector, useDispatch } from 'react-redux'
import { Modal } from 'react-bootstrap'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, useIntl } from 'react-intl'
import { toast } from '@cap-collectif/ui'
import CloseButton from '~/components/Form/CloseButton'
import SubmitButton from '~/components/Form/SubmitButton'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import type { Dispatch, State } from '~/types'
import type { Values } from '~/components/Report/ReportForm'
import ReportForm, { getType, formName } from '~/components/Report/ReportForm'
import { mediaQueryMobile } from '~/utils/sizes'
import ReportDebateArgumentMutation from '~/mutations/ReportDebateArgumentMutation'
import type { ForOrAgainstValue } from '~relay/ArgumentCard_argument.graphql'
export type ArgumentReported = {
  readonly id: string
  readonly debateId: string
  readonly forOrAgainst: ForOrAgainstValue
}
export type Props = {
  readonly onClose: () => void
  readonly argument: ArgumentReported
  readonly id?: string | null | undefined
}
const ModalContainer: StyledComponent<any, {}, typeof Modal> = styled(Modal)`
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

const onSubmit = (
  values: Values,
  dispatch: Dispatch,
  argument: ArgumentReported,
  intl: IntlShape,
  onClose: () => void,
) => {
  const { body, status } = values
  return ReportDebateArgumentMutation.commit({
    input: {
      reportableId: argument.id,
      body,
      type: getType(status),
    },
    debateId: argument.debateId,
    forOrAgainst: argument.forOrAgainst,
  })
    .then(response => {
      onClose()

      if (response.report?.errorCode) {
        mutationErrorToast(intl)
      }

      toast({
        variant: 'success',
        content: intl.formatMessage({
          id: 'alert.success.report.argument',
        }),
      })
    })
    .catch(() => {
      onClose()
      mutationErrorToast(intl)
    })
}

export const ModalReportArgument = ({ argument, onClose, id }: Props): JSX.Element => {
  const intl = useIntl()
  const dispatch = useDispatch<Dispatch>()
  const isLoading = useSelector(
    (state: State) => state.report.currentReportingModal === id && isSubmitting(formName)(state),
  )
  return (
    <ModalContainer animation={false} show={!!argument} onHide={onClose} bsSize="large" aria-labelledby="modal-title">
      <Modal.Header
        closeButton
        closeLabel={intl.formatMessage({
          id: 'close.modal',
        })}
      >
        <Modal.Title id="modal-title">
          <FormattedMessage id="moderate-argument" />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <ReportForm onSubmit={(values: Values) => onSubmit(values, dispatch, argument, intl, onClose)} />
      </Modal.Body>

      <Modal.Footer>
        <CloseButton onClose={onClose} label="editor.undo" />
        <SubmitButton
          label="global.report.submit"
          isSubmitting={isLoading}
          onSubmit={() => dispatch(submit(formName))}
          bsStyle="danger"
        />
      </Modal.Footer>
    </ModalContainer>
  )
}
export default ModalReportArgument
