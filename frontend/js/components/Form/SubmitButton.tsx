import * as React from 'react'
import cn from 'classnames'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import type { State, User } from '~/types'
import type { BsStyle } from '~/types/ReactBootstrap.type'

type Props = {
  id?: string | null | undefined
  onSubmit?: (...args: Array<any>) => any
  // Default props not working
  isSubmitting?: boolean
  label: string
  bsStyle: BsStyle
  className: string
  loading: string
  style: Record<string, any>
  disabled: boolean
  user?: User
  children?: any
  ariaLabel?: string
  type?: string
}

class SubmitButton extends React.Component<Props> {
  static defaultProps = {
    label: 'global.send',
    bsStyle: 'primary',
    loading: 'global.loading',
    className: '',
    style: {},
    disabled: false,
  }

  onClick = () => {
    const { isSubmitting, onSubmit } = this.props

    if (isSubmitting) {
      return null
    }

    if (onSubmit) {
      onSubmit()
    }
  }

  render() {
    const { isSubmitting, bsStyle, className, id, label, disabled, style, children, loading, ariaLabel } = this.props
    return (
      <button
        type="submit"
        id={id}
        disabled={isSubmitting || disabled}
        onClick={this.onClick}
        className={cn(`btn btn-${bsStyle}`, className)}
        style={style}
        aria-label={ariaLabel}
      >
        {children}
        <FormattedMessage id={isSubmitting ? loading : label} />
      </button>
    )
  }
}

const mapStateToProps = (state: State) => ({
  user: state.user.user,
})

export default connect(mapStateToProps)(SubmitButton)
