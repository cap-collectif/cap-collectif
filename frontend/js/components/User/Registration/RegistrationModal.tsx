import * as React from 'react'

import styled from 'styled-components'
import { Alert, Modal } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { isSubmitting, submit } from 'redux-form'
import { createFragmentContainer, graphql } from 'react-relay'
import { useAnalytics } from 'use-analytics'
import CloseButton from '../../Form/CloseButton'
import SubmitButton from '../../Form/SubmitButton'
import RegistrationForm, { form } from './RegistrationForm'
import LoginSocialButtons from '../Login/LoginSocialButtons'
import { closeRegistrationModal, hideChartModal } from '~/redux/modules/user'
import type { Dispatch } from '~/types'
import WYSIWYGRender from '../../Form/WYSIWYGRender'
import type { RegistrationModal_query } from '~relay/RegistrationModal_query.graphql'
import { MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables'
import { mediaQueryMobile } from '~/utils/sizes'
import ChartModal from './ChartModal'
type StateProps = {
  readonly show: boolean
  readonly textTop: string | null | undefined
  readonly textBottom: string | null | undefined
  readonly submitting: boolean
}
type DispatchProps = {
  readonly onClose: () => typeof closeRegistrationModal
  readonly onSubmit: () => typeof submit
}
type Props = StateProps &
  DispatchProps & {
    query: RegistrationModal_query
    locale: string
  }
export const ModalContainer = styled(Modal)`
  .modal-dialog {
    width: 400px;
  }

  .form-group {
    margin-bottom: 16px;

    label {
      margin-bottom: 4px !important;
    }
  }

  .multiple-majority-container {
    flex-direction: column;
    text-align: center;

    .majority-container {
      &:first-of-type {
        border-radius: ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0 0;
      }
      &:last-of-type {
        border-radius: 0 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE};
      }
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .modal-dialog {
      width: auto;
    }
  }
`
export const RegistrationModal = ({
  submitting,
  onSubmit,
  onClose,
  show,
  textTop,
  textBottom,
  query,
  locale,
}: Props) => {
  const { track } = useAnalytics()
  const intl = useIntl()
  return (
    <>
      {/** @ts-ignore */}
      <ChartModal />
      <ModalContainer
        animation={false}
        show={show}
        autoFocus
        onHide={() => {
          track('registration_close_click')
          onClose()
        }}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg"
        enforceFocus={false}
        backdrop="static"
      >
        <Modal.Header
          closeButton
          closeLabel={intl.formatMessage({
            id: 'close.modal',
          })}
        >
          <Modal.Title id="contained-modal-title-lg" componentClass="h1">
            <FormattedMessage id="global.register" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {textTop && (
            <Alert bsStyle="info" className="text-center">
              <WYSIWYGRender value={textTop} />
            </Alert>
          )}
          <LoginSocialButtons prefix="registration." />
          {/** @ts-ignore */}
          <RegistrationForm query={query} locale={locale} />

          {textBottom && <WYSIWYGRender className="text-center small excerpt mt-15" value={textBottom} />}
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              track('registration_close_click')
              onClose()
            }}
          />
          <SubmitButton
            id="confirm-register"
            label="global.register"
            isSubmitting={submitting}
            onSubmit={() => {
              track('registration_submit_click')
              onSubmit()
            }}
          />
        </Modal.Footer>
      </ModalContainer>
    </>
  )
}

const mapStateToProps = state => ({
  textTop: state.user.registration_form.topTextDisplayed ? state.user.registration_form.topText : null,
  textBottom: state.user.registration_form.bottomTextDisplayed ? state.user.registration_form.bottomText : null,
  show: state.user.showRegistrationModal,
  submitting: isSubmitting(form)(state),
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClose: () => dispatch(closeRegistrationModal()),
  onSubmit: () => dispatch(submit(form)),
  onCloseChart: () => dispatch(hideChartModal()),
})

const RegistrationModalConnected = connect(mapStateToProps, mapDispatchToProps)(RegistrationModal)
export default createFragmentContainer(RegistrationModalConnected, {
  query: graphql`
    fragment RegistrationModal_query on Query {
      ...RegistrationForm_query
    }
  `,
})
