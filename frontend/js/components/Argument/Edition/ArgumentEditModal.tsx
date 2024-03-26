import React from 'react'
import { Modal } from 'react-bootstrap'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { submit, isSubmitting } from 'redux-form'
import ArgumentForm, { formName } from './ArgumentForm'
import CloseButton from '../../Form/CloseButton'
import SubmitButton from '../../Form/SubmitButton'
import { closeArgumentEditModal } from '../../../redux/modules/opinion'
import type { State, Dispatch } from '../../../types'
import type { ArgumentEditModal_argument } from '~relay/ArgumentEditModal_argument.graphql'

type RelayProps = {
  argument: ArgumentEditModal_argument
}
type Props = RelayProps & {
  argument: ArgumentEditModal_argument
  show: boolean
  dispatch: Dispatch
  submitting: boolean
}

const ArgumentEditModal = ({ argument, show, dispatch, submitting }: Props) => {
  const intl = useIntl()
  return (
    <Modal
      animation={false}
      show={show}
      onHide={() => {
        dispatch(closeArgumentEditModal())
      }}
      bsSize="large"
      aria-labelledby="contained-modal-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="argument.update" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ArgumentForm argument={argument} />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton
          onClose={() => {
            dispatch(closeArgumentEditModal())
          }}
        />
        <SubmitButton
          id="confirm-argument-update"
          label="global.edit"
          ariaLabel={intl.formatMessage({
            id: 'edit-my-argument',
          })}
          isSubmitting={submitting}
          onSubmit={() => {
            dispatch(submit(formName))
          }}
        />
      </Modal.Footer>
    </Modal>
  )
}

const mapStateToProps = (state: State, { argument }: RelayProps) => ({
  show: argument ? state.opinion.showArgumentEditModal === argument.id : false,
  submitting: isSubmitting(formName)(state),
})

// @ts-ignore
const container = connect(mapStateToProps)(ArgumentEditModal)
export default createFragmentContainer(container, {
  argument: graphql`
    fragment ArgumentEditModal_argument on Argument {
      id
      body
      ...ArgumentForm_argument
    }
  `,
})
