import * as React from 'react'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import { Alert } from 'react-bootstrap'
import type { BsStyle } from '~/types/ReactBootstrap.type'

type Props = {
  errors?: Array<any>
  success?: Array<any>
  style?: Record<string, any>
  form?: boolean
  onDismissMessage?: ((...args: Array<any>) => any) | null | undefined
  translate?: boolean
  className?: string
}

class FlashMessages extends React.Component<Props> {
  static defaultProps = {
    errors: [],
    success: [],
    style: {},
    form: false,
    onDismissMessage: null,
    translate: true,
  }

  renderText = (message: string | Record<string, any>) => {
    const { translate } = this.props

    if (translate) {
      if (typeof message === 'string') {
        return <FormattedHTMLMessage id={message} />
      }

      return <FormattedMessage id={message.message} values={message.params} />
    }

    if (typeof message === 'string') {
      return message
    }
  }

  renderMessage = (index: number, message: string, type: BsStyle) => {
    const { form, onDismissMessage, style } = this.props

    if (!form) {
      return (
        <Alert
          key={index}
          bsStyle={type}
          style={style}
          onDismiss={onDismissMessage ? onDismissMessage.bind(null, message, type) : null}
        >
          <p>{this.renderText(message)}</p>
        </Alert>
      )
    }

    return (
      <p key={index} className="error-block" style={style}>
        {this.renderText(message)}
      </p>
    )
  }

  render() {
    const { errors, success } = this.props

    if ((errors && errors.length > 0) || (success && success.length > 0)) {
      return (
        <div className="flashmessages">
          {errors && errors.map((message: string, index: number) => this.renderMessage(index, message, 'warning'))}
          {success && success.map((message: string, index: number) => this.renderMessage(index, message, 'success'))}
        </div>
      )
    }

    return null
  }
}

export default FlashMessages
