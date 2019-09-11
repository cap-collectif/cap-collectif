// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import { reduxForm, Field, submit, SubmissionError } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';

import component from '../Form/Field';
import SubmitButton from '../Form/SubmitButton';
import WYSIWYGRender from '../Form/WYSIWYGRender';
import { isEmail } from '../../services/Validator';
import type { Dispatch, GlobalState } from '../../types';
import AppDispatcher from '../../dispatchers/AppDispatcher';
import SendContactFormMutation from '../../mutations/SendContactFormMutation';
import type { ContactForm_contactForm } from '~relay/ContactForm_contactForm.graphql';

type OwnProps = {|
  ...ReduxFormFormProps,
  contactForm: ContactForm_contactForm,
|};

type Props = {|
  ...OwnProps,
  intl: IntlShape,
  dispatch: Dispatch,
  addCaptchaField: boolean,
  user?: Object,
  confidentiality?: ?string,
|};

type FormValues = {
  body: string,
  title: string,
  email: string,
  captcha: boolean,
  name: ?string,
};

const onSubmit = (values: any, dispatch: any, props: Props) =>
  SendContactFormMutation.commit({
    input: { ...values, idContactForm: props.contactForm.id },
  })
    .then(() => {
      AppDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: {
          bsStyle: 'success',
          content: 'contact.email.sent_success',
        },
      });
      props.reset();
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });

const validate = ({ body, title, email, name, captcha }: FormValues, props: Props) => {
  const errors = {};

  if (!body) {
    errors.body = 'contact.no_description';
  } else if (body.length < 2) {
    errors.body = 'two-characters-minimum-required';
  }

  if (!title) {
    errors.title = 'contact.no_object';
  } else if (title.length < 2) {
    errors.title = 'two-characters-minimum-required';
  }

  if (!email) {
    errors.email = 'contact.no_email';
  } else if (!isEmail(email)) {
    errors.email = 'contact.form.error.email';
  }

  if (name && name.length < 2) {
    errors.name = 'two-characters-minimum-required';
  }

  if (!captcha && props.addCaptchaField && (window && window.location.host !== 'capco.test')) {
    errors.captcha = 'registration.constraints.captcha.invalid';
  }

  return errors;
};

export class ContactForm extends React.Component<Props> {
  render() {
    const optional = (
      <span className="excerpt">
        <FormattedMessage id="global.form.optional" />
      </span>
    );

    const { dispatch, contactForm, addCaptchaField, submitting, intl } = this.props;
    return (
      <div className="contact__form">
        <div className="block--bordered p-10">
          <WYSIWYGRender className="mb-20 p-10" value={contactForm.body} />
          <Field
            name="name"
            label={
              <span>
                <FormattedMessage id="group.title" /> {optional}
              </span>
            }
            component={component}
            type="text"
            id="group_name"
          />
          <Field
            name="email"
            label={<FormattedMessage id="user.login.email" />}
            help={intl.formatMessage({ id: 'global.email.format' })}
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
            id="group_description"
          />
          {addCaptchaField && (
            <Field id="captcha" component={component} name="captcha" type="captcha" />
          )}
          <SubmitButton
            id="confirm-opinion-create"
            label={submitting ? 'global.loading' : 'contact.submit'}
            disabled={submitting}
            style={{ width: '100%' }}
            onSubmit={() => {
              dispatch(submit(`contact-form-${contactForm.id}`));
            }}>
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
    );
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
});

const container = injectIntl(ContactForm);

const form = connect(mapStateToProps)(
  reduxForm({
    validate,
    onSubmit,
  })(container),
);

export default createFragmentContainer(form, {
  contactForm: graphql`
    fragment ContactForm_contactForm on ContactForm {
      id
      title
      body
      interlocutor
      confidentiality
    }
  `,
});
