import * as React from 'react'
import { connect } from 'react-redux'
import { graphql, createFragmentContainer } from 'react-relay'
import { reduxForm, Field, submit, SubmissionError } from 'redux-form'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import component from '../Form/Field'
import SubmitButton from '../Form/SubmitButton'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { isEmail } from '../../services/Validator'
import type { Dispatch, GlobalState } from '../../types'
import SendContactFormMutation from '../../mutations/SendContactFormMutation'
import type { ContactForm_contactForm } from '~relay/ContactForm_contactForm.graphql'
import { toast } from '~ds/Toast'

type OwnProps = ReduxFormFormProps & {
  contactForm: ContactForm_contactForm
}
type Props = OwnProps & {
  intl: IntlShape
  dispatch: Dispatch
  addCaptchaField: boolean
  user?: Record<string, any>
  confidentiality?: string | null | undefined
}
type FormValues = {
  body: string
  title: string
  email: string
  captcha: boolean
  name: string | null | undefined
}

const onSubmit = (values: any, dispatch: any, props: Props) =>
  SendContactFormMutation.commit({
    input: { ...values, idContactForm: props.contactForm.id },
  })
    .then(() => {
      toast({ content: props.intl.formatMessage({ id: 'contact.email.sent_success' }), variant: 'success' })

      props.reset()
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      })
    })

const validate = ({ body, title, email, name, captcha }: FormValues, props: Props) => {
  const errors: any = {}

  if (!body) {
    errors.body = 'contact.no_description'
  } else if (body.length < 2) {
    errors.body = 'two-characters-minimum-required'
  }

  if (!title) {
    errors.title = 'contact.no_object'
  } else if (title.length < 2) {
    errors.title = 'two-characters-minimum-required'
  }

  if (!email) {
    errors.email = 'contact.no_email'
  } else if (!isEmail(email)) {
    errors.email = 'contact.form.error.email'
  }

  if (name && name.length < 2) {
    errors.name = 'two-characters-minimum-required'
  }

  if (!captcha && props.addCaptchaField && window && window.location.host !== 'capco.test') {
    errors.captcha = 'registration.constraints.captcha.invalid'
  }

  return errors
}

export class ContactForm extends React.Component<Props> {
  render() {
    const optional = (
      <span className="excerpt">
        <FormattedMessage id="global.optional" />
      </span>
    )
    const { dispatch, contactForm, addCaptchaField, submitting, intl } = this.props
    return (
      <div className="contact__form">
        <div className="block--bordered p-10">
          <WYSIWYGRender className="mb-20 p-10" value={contactForm.body} />
          <Field
            name="name"
            label={
              <span>
                <FormattedMessage id="global.name" /> {optional}
              </span>
            }
            component={component}
            type="text"
            id="group_name"
          />
          <Field
            name="email"
            label={<FormattedMessage id="global.email" />}
            help={intl.formatMessage({
              id: 'global.email.format',
            })}
            component={component}
            type="email"
            id="group_email"
          />
          <Field
            name="title"
            label={<FormattedMessage id="object" />}
            component={component}
            type="text"
            id="group_object"
          />
          <Field
            name="body"
            divClassName="contact-form_textarea"
            label={<FormattedMessage id="contact.your-message" />}
            component={component}
            autosize={false}
            type="textarea"
            id="global.description"
          />
          {addCaptchaField && <Field id="captcha" component={component} name="captcha" type="captcha" />}
          <SubmitButton
            id="confirm-opinion-create"
            label={submitting ? 'global.loading' : 'global.send'}
            disabled={submitting}
            style={{
              width: '100%',
            }}
            onSubmit={() => {
              dispatch(submit(`contact-form-${contactForm.id}`))
            }}
          >
            <i className="cap cap-paper-plane" />
            {'  '}
          </SubmitButton>
          <div className="color-dark-gray mt-10 small">
            {contactForm.confidentiality && contactForm.confidentiality !== '' ? (
              <WYSIWYGRender value={contactForm.confidentiality} />
            ) : (
              <FormattedMessage id="contact-form-confidentiality-text" />
            )}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: GlobalState, props: OwnProps) => ({
  addCaptchaField: state.default.features.captcha,
  form: `contact-form-${props.contactForm.id}`,
  user: state.user.user,
  initialValues: {
    name: state.user.user ? state.user.user.username : '',
    email: state.user.user ? state.user.user.email : '',
  },
})

const form = injectIntl(
  connect(mapStateToProps)(
    reduxForm({
      validate,
      onSubmit,
    })(ContactForm),
  ),
)
export default createFragmentContainer(form, {
  contactForm: graphql`
    fragment ContactForm_contactForm on ContactForm {
      id
      title
      body
      confidentiality
    }
  `,
})
