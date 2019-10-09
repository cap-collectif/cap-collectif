// @flow
import * as React from 'react';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';
import { reduxForm, Field, SubmissionError, submit } from 'redux-form';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import type { Dispatch, State } from '../../../types';
import type { ContactFormAdminForm_contactForm } from '~relay/ContactFormAdminForm_contactForm.graphql';
import renderInput from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import SubmitButton from '../../Form/SubmitButton';
import { isEmail } from '../../../services/Validator';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import UpdateContactFormMutation from '../../../mutations/UpdateContactFormMutation';
import AddContactFormMutation from '../../../mutations/AddContactFormMutation';

type Props = {|
  ...ReduxFormFormProps,
  +contactForm: ?ContactFormAdminForm_contactForm,
  +onClose?: () => void,
  +intl: IntlShape,
|};

type FormValues = {|
  body: string,
  email: string,
  title: string,
  confidentiality: string,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { contactForm, onClose } = props;

  const data = { ...values };

  if (contactForm) {
    return UpdateContactFormMutation.commit({ input: { id: contactForm.id, ...data } })
      .then(() => {
        AppDispatcher.dispatch({
          actionType: 'UPDATE_ALERT',
          alert: {
            bsStyle: 'success',
            content: 'your-form-has-been-updated',
          },
        });
        if (onClose) {
          onClose();
        }
      })
      .catch(() => {
        throw new SubmissionError({
          _error: 'global.error.server.form',
        });
      });
  }

  return AddContactFormMutation.commit({ input: data })
    .then(() => {
      AppDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: {
          bsStyle: 'success',
          content: 'your-form-has-been-added',
        },
      });
      if (onClose) {
        onClose();
      }
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = ({ title, email, confidentiality }: FormValues) => {
  const errors = {};

  if (!title) {
    errors.title = 'global.required';
  } else if (title.length < 2) {
    errors.title = 'global.required';
  }

  if (!email) {
    errors.email = 'global.required';
  } else if (!isEmail(email)) {
    errors.email = 'global.constraints.email.invalid';
  }

  if (!confidentiality || confidentiality.replace(/<[^>]*>?/gm, '').length < 1) {
    errors.confidentiality = 'global.required';
  }

  return errors;
};

export const formName = 'ContactAdminForm';

export class ContactFormAdminForm extends React.Component<Props> {
  static defaultProps = {
    contactForm: null,
  };

  render() {
    const {
      submitting,
      contactForm,
      form,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      dispatch,
      pristine,
      invalid,
    } = this.props;
    const optional = (
      <span className="excerpt">
        {' '}
        <FormattedMessage id="global.form.optional" />
      </span>
    );

    return (
      <div id="create-reply-form">
        <form id="reply-form" ref="form" onSubmit={handleSubmit}>
          <Field
            name="title"
            type="text"
            id={`${form}-contact-title`}
            component={renderInput}
            autoFocus
            label={<FormattedMessage id="title" />}
          />
          <Field
            id={`${form}-contact-body`}
            type="editor"
            name="body"
            component={renderInput}
            label={
              <span>
                <FormattedMessage id="proposal.body" />
                {optional}
              </span>
            }
          />
          <Field
            name="email"
            type="email"
            id={`${form}-contact-email`}
            help={<FormattedMessage id="global.email.format" />}
            component={renderInput}
            autoFocus
            label={<FormattedMessage id="admin.mail.contact" />}
          />

          <Field
            id={`${form}-confidentiality`}
            type="editor"
            name="confidentiality"
            component={renderInput}
            label={
              <span>
                <FormattedMessage id="confidentiality-field" />
              </span>
            }
          />

          <div className="btn-group">
            <SubmitButton
              id={`${form}-submit-create-contact`}
              bsStyle="info"
              disabled={submitting || pristine}
              label={submitting ? 'global.loading' : 'validate'}
              onSubmit={() => {
                dispatch(
                  submit(contactForm ? `Update${formName}-${contactForm.id}` : `Create${formName}`),
                );
              }}
            />
          </div>
          <AlertForm
            valid={valid}
            invalid={invalid && !pristine}
            submitSucceeded={submitSucceeded}
            submitFailed={submitFailed}
            submitting={submitting}
          />
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state: State, props: Props) => {
  return {
    form: props.contactForm ? `Update${formName}-${props.contactForm.id}` : `Create${formName}`,
    initialValues: {
      title: props.contactForm ? props.contactForm.title : null,
      body: props.contactForm ? props.contactForm.body : null,
      email: props.contactForm ? props.contactForm.email : null,
      confidentiality:
        props.contactForm && props.contactForm.confidentiality
          ? props.contactForm.confidentiality
          : props.intl.formatMessage({ id: 'contact-form-confidentiality-text' }),
    },
  };
};

const form = reduxForm({
  validate,
  onSubmit,
})(ContactFormAdminForm);

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(injectIntl(container), {
  contactForm: graphql`
    fragment ContactFormAdminForm_contactForm on ContactForm {
      body
      title
      email
      confidentiality
    }
  `,
});
