import * as React from 'react'
import { Modal } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { submit } from 'redux-form'
import CloseButton from '../../Form/CloseButton'
import { form } from './RegistrationForm'
import { hideChartModal } from '~/redux/modules/user'
import type { Dispatch } from '~/types'
import WYSIWYGRender from '../../Form/WYSIWYGRender'
type StateProps = {
  readonly displayChartModal: boolean
  readonly charterBody?: string | null | undefined
}
type DispatchProps = {
  readonly onCloseChart: () => typeof hideChartModal
}
type Props = StateProps & DispatchProps
export const ChartModal = ({ displayChartModal, onCloseChart, charterBody }: Props) => {
  const intl = useIntl()
  return (
    <Modal
      animation={false}
      show={displayChartModal}
      autoFocus
      onHide={onCloseChart}
      bsSize="medium"
      aria-labelledby="contained-modal-title-lg"
      enforceFocus={false}
    >
      <Modal.Header
        closeButton
        closeLabel={intl.formatMessage({
          id: 'close.modal',
        })}
      >
        <Modal.Title id="contained-modal-title-lg" componentClass="h1">
          <FormattedMessage id="charter" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <WYSIWYGRender value={charterBody} />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton label="global.close" onClose={onCloseChart} />
      </Modal.Footer>
    </Modal>
  )
}

const mapStateToProps = state => ({
  displayChartModal: state.user.displayChartModal,
  charterBody: state.default.parameters['charter.body'],
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSubmit: () => dispatch(submit(form)),
  onCloseChart: () => dispatch(hideChartModal()),
})

const ChartModalConnected = connect<any, any>(mapStateToProps, mapDispatchToProps)(ChartModal)
export default ChartModalConnected
