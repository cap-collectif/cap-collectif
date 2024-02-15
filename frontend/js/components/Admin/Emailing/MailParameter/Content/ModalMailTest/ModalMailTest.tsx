import * as React from 'react'
import { Field, reduxForm, submit } from 'redux-form'
import { createFragmentContainer, graphql } from 'react-relay'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Modal } from 'react-bootstrap'
import type { Dispatch } from '~/types'
import CloseButton from '~/components/Form/CloseButton'
import SubmitButton from '~/components/Form/SubmitButton'
import component from '~/components/Form/Field'
import { isEmail } from '~/services/Validator'
import TestEmailingCampaignMutation from '~/mutations/TestEmailingCampaignMutation'
import type { ModalMailTest_emailingCampaign } from '~relay/ModalMailTest_emailingCampaign.graphql'
import '~relay/ModalMailTest_emailingCampaign.graphql'
import { ModalContainer } from '~/components/Admin/Emailing/MailParameter/common.style'
import { toast } from '~ds/Toast'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'

type Values = {
  mailAddressee: string
}
type Props = ReduxFormFormProps & {
  show: boolean
  onClose: () => void
  dispatch: Dispatch
  emailingCampaign: ModalMailTest_emailingCampaign
}
const formName = 'form-mail-test'

const onSubmit = ({ mailAddressee }: Values, dispatch: Dispatch, props: Props) => {
  const { onClose, emailingCampaign, intl } = props
  return TestEmailingCampaignMutation.commit({
    input: {
      id: emailingCampaign.id,
      email: mailAddressee,
    },
  })
    .then(response => {
      onClose()

      if (response.testEmailingCampaign?.error) return mutationErrorToast(intl)
      toast({ content: intl.formatMessage({ id: 'contact.email.sent_success' }), variant: 'success' })
    })
    .catch(() => {
      onClose()
      return mutationErrorToast(intl)
    })
}

const validate = ({ mailAddressee }: Values) => {
  const errors: any = {}

  if (!mailAddressee || !isEmail(mailAddressee)) {
    errors.mailAddressee = 'global.constraints.email.invalid'
  }

  return errors
}

export const ModalMailTest = ({ show, onClose, dispatch, pristine, invalid }: Props) => (
  <ModalContainer animation={false} show={show} onHide={onClose} bsSize="large" aria-labelledby="modal-title">
    <Modal.Header closeButton>
      <Modal.Title id="modal-title">
        <FormattedMessage id="send-test-by-mail" />
      </Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <form>
        <Field
          type="text"
          id="mailAddressee"
          name="mailAddressee"
          component={component}
          onKeyDown={e => {
            if (e.keyCode === 13) {
              dispatch(submit(formName))
            }
          }}
          label={<FormattedMessage id="addressee-address" />}
        />
      </form>
    </Modal.Body>

    <Modal.Footer>
      <CloseButton onClose={onClose} label="editor.undo" />
      <SubmitButton
        label="send-test"
        onSubmit={() => dispatch(submit(formName))}
        bsStyle="primary"
        disabled={pristine || invalid}
      />
    </Modal.Footer>
  </ModalContainer>
)
const ModalMailTestForm = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(ModalMailTest)
const ModalMailTestConnected = connect<any, any>()(ModalMailTestForm)
export default createFragmentContainer(ModalMailTestConnected, {
  emailingCampaign: graphql`
    fragment ModalMailTest_emailingCampaign on EmailingCampaign {
      id
    }
  `,
})
