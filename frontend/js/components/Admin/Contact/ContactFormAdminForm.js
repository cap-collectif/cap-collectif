// @flow
import * as React from 'react';
import { FormattedMessage, type IntlShape } from 'react-intl';
import { reduxForm, Field, SubmissionError, submit } from 'redux-form';
import { connect, useDispatch } from 'react-redux';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
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

type FormValues = {|
  +body: ?string,
  +email: ?string,
  +title: ?string,
  +confidentiality: string,
  +confidentialityUsingJoditWysiwyg?: ?boolean,
  +bodyUsingJoditWysiwyg?: ?boolean,
|};

type ValidFormValues = {|
  +body: string,
  +email: string,
  +title: string,
  +confidentiality: string,
  +confidentialityUsingJoditWysiwyg?: ?boolean,
  +bodyUsingJoditWysiwyg?: ?boolean,
|};
type OwnProps = {|
  +intl: IntlShape,
  +onClose?: () => void,
|};
type RelayProps = {|
  +contactForm: ?ContactFormAdminForm_contactForm,
|};

type BeforeConnectProps = {| ...OwnProps, ...RelayProps |};

type StateProps = {|
  +currentLanguage: string,
  +initialValues: FormValues,
  +form: string,
  +dispatch: Dispatch,
|};

type AfterConnectProps = {|
  ...BeforeConnectProps,
  ...StateProps,
|};

type Props = {|
  ...AfterConnectProps,
  ...ReduxFormFormProps,
|};

const onSubmit = (values: ValidFormValues, dispatch: Dispatch, props: Props) => {
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
    confidentialityUsingJoditWysiwyg: values.confidentialityUsingJoditWysiwyg,
    bodyUsingJoditWysiwyg: values.bodyUsingJoditWysiwyg,
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

export const ContactFormAdminForm = ({
  submitting,
  contactForm,
  form,
  valid,
  submitSucceeded,
  submitFailed,
  handleSubmit,
  pristine,
  invalid,
}: Props): React.Node => {
  const optional = (
    <span className="excerpt">
      {' '}
      <FormattedMessage id="global.optional" />
    </span>
  );

  const dispatch = useDispatch<Dispatch>();
  return (
    <div id="create-reply-form">
      <form id="reply-form" onSubmit={handleSubmit}>
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
};

const mapStateToProps = (state: State, { contactForm, intl }: BeforeConnectProps) => {
  const translation = getTranslation(
    contactForm ? contactForm.translations : [],
    state.language.currentLanguage,
  );
  const form = contactForm ? `Update${formName}-${contactForm.id}` : `Create${formName}`;
  return {
    currentLanguage: state.language.currentLanguage,
    form,
    initialValues: {
      title: translation ? translation.title : null,
      body: translation ? translation.body : null,
      email: contactForm ? contactForm.email : null,
      bodyUsingJoditWysiwyg: contactForm ? contactForm.bodyUsingJoditWysiwyg !== false : true,
      confidentialityUsingJoditWysiwyg: contactForm
        ? contactForm.confidentialityUsingJoditWysiwyg !== false
        : true,
      confidentiality:
        contactForm && translation && translation.confidentiality
          ? translation.confidentiality
          : intl.formatMessage({ id: 'contact-form-confidentiality-text' }),
    },
  };
};

const form: React.AbstractComponent<AfterConnectProps> = reduxForm({
  validate,
  onSubmit,
  enableReinitialize: true,
})(ContactFormAdminForm);

const container = (connect<AfterConnectProps, BeforeConnectProps, _, _, _, _>(mapStateToProps)(
  form,
): React.AbstractComponent<BeforeConnectProps>);

export default (createFragmentContainer(container, {
  contactForm: graphql`
    fragment ContactFormAdminForm_contactForm on ContactForm {
      id
      email
      bodyUsingJoditWysiwyg
      confidentialityUsingJoditWysiwyg
      translations {
        locale
        body
        title
        confidentiality
      }
    }
  `,
}): RelayFragmentContainer<typeof container>);
