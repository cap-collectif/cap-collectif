import React from 'react'
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import { Alert, Button } from 'react-bootstrap'
import type { EmailNotConfirmedAlert_viewer } from '~relay/EmailNotConfirmedAlert_viewer.graphql'
import ResendEmailConfirmationMutation from '~/mutations/ResendEmailConfirmationMutation'

type Props = {
  viewer: EmailNotConfirmedAlert_viewer | null | undefined
}
type State = {
  resendingConfirmation: boolean
  confirmationSent: boolean
}
export class EmailNotConfirmedAlert extends React.Component<Props, State> {
  state = {
    resendingConfirmation: false,
    confirmationSent: false,
  }

  handleResend = () => {
    this.setState({
      resendingConfirmation: true,
    })
    ResendEmailConfirmationMutation.commit()
      .then(() => {
        this.setState({
          resendingConfirmation: false,
          confirmationSent: true,
        })
      })
      .catch(() => {
        this.setState({
          resendingConfirmation: false,
          confirmationSent: true,
        })
      })
  }

  render() {
    const { viewer } = this.props

    if (!viewer || viewer.isEmailConfirmed) {
      return null
    }

    const editEmailUrl = `${window.location.protocol}//${window.location.host}/profile/edit-profile#account`
    const { confirmationSent, resendingConfirmation } = this.state
    return (
      <Alert bsStyle="warning" className="mb-0" id="alert-email-not-confirmed">
        <div className="container">
          <div
            className="col-md-7"
            style={{
              marginBottom: 5,
            }}
          >
            <FormattedHTMLMessage
              id="email-address-confirmation-banner-message"
              values={{
                emailAddress: viewer.email,
              }}
            />{' '}
            <a href="https://aide-utilisateurs.helpscoutdocs.com/article/347-pourquoi-dois-je-confirmer-mon-adresse-electronique">
              <FormattedMessage id="cnil.learn" />
            </a>
          </div>
          <div className="col-md-5">
            {confirmationSent ? (
              <Button
                style={{
                  marginRight: 15,
                  marginBottom: 5,
                }}
                bsStyle="primary"
                disabled
              >
                <FormattedMessage id="user.confirm.sent" />
              </Button>
            ) : (
              <Button
                style={{
                  marginRight: 15,
                  marginBottom: 5,
                }}
                disabled={resendingConfirmation}
                onClick={resendingConfirmation ? null : this.handleResend}
              >
                {resendingConfirmation ? (
                  <FormattedMessage id="user.confirm.sending" />
                ) : (
                  <FormattedMessage id="user.confirm.resend" />
                )}
              </Button>
            )}
            <Button
              style={{
                marginBottom: 5,
              }}
              href={editEmailUrl}
            >
              <FormattedMessage id="user.confirm.update" />
            </Button>
          </div>
        </div>
      </Alert>
    )
  }
}
export default createFragmentContainer(EmailNotConfirmedAlert, {
  viewer: graphql`
    fragment EmailNotConfirmedAlert_viewer on User {
      email
      isEmailConfirmed
    }
  `,
})
