import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { Modal, Button } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { submit, isSubmitting } from 'redux-form'
import { closeOpinionVersionEditModal } from '../../redux/modules/opinion'
import OpinionVersionEditForm, { formName } from './OpinionVersionEditForm'
import type { State } from '../../types'
import type { OpinionVersionEditModal_version } from '~relay/OpinionVersionEditModal_version.graphql'

type Props = {
  show: boolean
  dispatch: (...args: Array<any>) => any
  submitting: boolean
  version: OpinionVersionEditModal_version
}

const OpinionVersionEditModal = ({ version, dispatch, submitting, show }: Props) => {
  const intl = useIntl()

  const onClose = () => {
    dispatch(closeOpinionVersionEditModal())
  }

  return (
    <Modal animation={false} show={show} onHide={onClose} bsSize="large" aria-labelledby="contained-modal-title-lg">
      <Modal.Header
        closeButton
        closeLabel={intl.formatMessage({
          id: 'close.modal',
        })}
      >
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="opinion.edit_version" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <OpinionVersionEditForm version={version} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>
          <FormattedMessage id="global.cancel" />
        </Button>
        <Button
          id="opinion-version-edit-update"
          disabled={submitting}
          onClick={() => {
            dispatch(submit(formName))
          }}
          bsStyle="primary"
        >
          {submitting ? <FormattedMessage id="global.loading" /> : <FormattedMessage id="global.edit" />}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const mapStateToProps = (state: State) => ({
  show: state.opinion.showOpinionVersionEditModal,
  submitting: isSubmitting(formName)(state),
})

// @ts-ignore
const container = connect(mapStateToProps)(OpinionVersionEditModal)
export default createFragmentContainer(container, {
  version: graphql`
    fragment OpinionVersionEditModal_version on Version {
      ...OpinionVersionEditForm_version
    }
  `,
})
