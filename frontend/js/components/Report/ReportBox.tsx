import React from 'react'
import { connect } from 'react-redux'
import ReportModal from './ReportModal'
import ReportButton from './ReportButton'
import { openModal } from '../../redux/modules/report'
import type { State, Dispatch } from '../../types'

type Props = {
  id: any
  dispatch: Dispatch
  showModal: boolean
  reported: boolean
  onReport: (...args: Array<any>) => any
  features: Record<string, any>
  user: Record<string, any>
  author?: Record<string, any>
  buttonStyle: Record<string, any> | null | undefined
  buttonBsSize?: string | null | undefined
  buttonClassName?: string | null | undefined
  disabled?: boolean
  newDesign?: boolean
}
export class ReportBox extends React.Component<Props> {
  static displayName = 'ReportBox'

  static defaultProps = {
    buttonStyle: {},
    author: null,
    buttonBsSize: null,
    buttonClassName: '',
    user: null,
  }

  render() {
    const {
      id,
      onReport,
      dispatch,
      showModal,
      reported,
      buttonBsSize,
      buttonClassName,
      user,
      author,
      features,
      buttonStyle,
      disabled,
      newDesign,
    } = this.props

    if (features.reporting && (!user || !author || user.uniqueId !== author.uniqueId)) {
      return (
        <span>
          <ReportButton
            id={id}
            disabled={disabled}
            reported={reported}
            onClick={() => dispatch(openModal(id))}
            bsSize={buttonBsSize}
            style={buttonStyle}
            className={buttonClassName}
            newDesign={newDesign}
          />
          <ReportModal id={id} show={showModal} onSubmit={onReport} />
        </span>
      )
    }

    return null
  }
}

const mapStateToProps = (state: State, props) => ({
  features: state.default.features,
  user: state.user.user,
  showModal: state.report.currentReportingModal === props.id,
})

export default connect(mapStateToProps)(ReportBox)
