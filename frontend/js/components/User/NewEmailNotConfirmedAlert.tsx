import React from 'react'
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import { Alert, Button } from 'react-bootstrap'
import { resendConfirmation } from '../../redux/modules/user'
import type { NewEmailNotConfirmedAlert_viewer } from '~relay/NewEmailNotConfirmedAlert_viewer.graphql'

type RelayProps = {
  viewer: NewEmailNotConfirmedAlert_viewer | null | undefined
}
type Props = RelayProps
export class NewEmailNotConfirmedAlert extends React.Component<Props> {
  render() {
    const { viewer } = this.props

    if (!viewer || !viewer.newEmailToConfirm) {
      return null
    }

    const editEmailUrl = `${window.location.protocol}//${window.location.host}/profile/edit-profile#account`
    return (
      <Alert bsStyle="warning" id="alert-new-email-not-confirmed">
        <div className="container">
          <div className="col-md-7 mb-5">
            <FormattedHTMLMessage
              id="user.confirm.new_email_send_succeed"
              values={{
                email: viewer.newEmailToConfirm,
              }}
            />
          </div>
          <div className="col-md-5">
            <Button className="mr-15 mb-5" onClick={resendConfirmation}>
              <FormattedMessage id="user.confirm.resend" />
            </Button>
            <Button bsStyle="link" className="mb-5" href={editEmailUrl}>
              <FormattedMessage id="user.confirm.new_email_send_succeed_cancel_or_update" />
            </Button>
          </div>
        </div>
      </Alert>
    )
  }
}
export default createFragmentContainer(NewEmailNotConfirmedAlert, {
  viewer: graphql`
    fragment NewEmailNotConfirmedAlert_viewer on User {
      newEmailToConfirm
    }
  `,
})
