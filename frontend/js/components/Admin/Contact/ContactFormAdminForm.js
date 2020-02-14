// @flow
import * as React from 'react';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';
import { reduxForm, Field, SubmissionError, submit } from 'redux-form';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import type { Dispatch, State } from '~/types';
import type { ContactFormAdminForm_contactForm } from '~relay/ContactFormAdminForm_contactForm.graphql';

import renderInput from '~/components/Form/Field';
import AlertForm from '~/components/Alert/AlertForm';
import SubmitButton from '~/components/Form/SubmitButton';
import { isEmail } from '~/services/Validator';
import AppDispatcher from '~/dispatchers/AppDispatcher';
import UpdateContactFormMutation from '~/mutations/UpdateContactFormMutation';
import AddContactFormMutation from '~/mutations/AddContactFormMutation';
import { getTranslation, handleTranslationChange } from '~/services/Translation';

type Props = {|
  ...ReduxFormFormProps,
  +contactForm: ?ContactFormAdminForm_contactForm,
  +onClose?: () => void,
  +intl: IntlShape,
  +currentLanguage: string,
|};

type FormValues = {|
  body: string,
  email: string,
  title: string,
  confidentiality: string,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { contactForm, onClose } = props;

  const translationsData = handleTranslationChange(
    contactForm ? contactForm.translations : [],
    {
      body: values.body,
      title: values.title,
      confidentiality: values.confidentiality,
      locale: props.currentLanguage,
    },
    props.currentLanguage,
  );

  const data = {
    email: values.email,
    translations: translationsData,
  };

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

  return AddContactFormMutation.commit({ input: { ...data } })
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
        <FormattedMessage id="global.optional" />
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
            type="admin-editor"
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
            type="admin-editor"
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

const mapStateToProps = (state: State, { contactForm, intl }: Props) => {
  const translation = getTranslation(
    contactForm ? contactForm.translations : [],
    state.language.currentLanguage,
  );

  return {
    currentLanguage: state.language.currentLanguage,
    form: contactForm ? `Update${formName}-${contactForm.id}` : `Create${formName}`,
    initialValues: {
      title: translation ? translation.title : null,
      body: translation ? translation.body : null,
      email: contactForm ? contactForm.email : null,
      confidentiality:
        contactForm && translation && translation.confidentiality
          ? translation.confidentiality
          : intl.formatMessage({ id: 'contact-form-confidentiality-text' }),
    },
  };
};

const form = reduxForm({
  validate,
  onSubmit,
  enableReinitialize: true,
})(ContactFormAdminForm);

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(injectIntl(container), {
  contactForm: graphql`
    fragment ContactFormAdminForm_contactForm on ContactForm {
      id
      email
      translations {
        locale
        body
        title
        confidentiality
      }
    }
  `,
});
