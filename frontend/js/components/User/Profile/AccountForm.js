// @flow
import React, { useState } from 'react';
import { FormattedMessage, FormattedHTMLMessage, type IntlShape, injectIntl } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { Button, Panel } from 'react-bootstrap';
import { formValueSelector, reduxForm, submit, Field, SubmissionError } from 'redux-form';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { isEmail } from '../../../services/Validator';
import renderComponent from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import type { State, Dispatch, FeatureToggles } from '../../../types';
import select from '~/components/Form/Select';
import type { LocaleMap } from '~ui/Button/SiteLanguageChangeButton';
import ConfirmPasswordModal, { passwordForm } from '~/components/User/ConfirmPasswordModal';
import { resendConfirmation, cancelEmailChange } from '~/redux/modules/user';
import DeleteAccountModal from '~/components/User/DeleteAccountModal';
import type { AccountForm_viewer } from '~relay/AccountForm_viewer.graphql';
import CookieMonster from '~/CookieMonster';
import UpdateProfileAccountEmailMutation from '~/mutations/UpdateProfileAccountEmailMutation';
import UpdateProfileAccountLocaleMutation from '~/mutations/UpdateProfileAccountLocaleMutation';
import type {
  UpdateProfileAccountLocaleMutationResponse as LocaleResponse,
  TranslationLocale,
} from '~relay/UpdateProfileAccountLocaleMutation.graphql';
import { TranslationLocaleEnum } from '~/utils/enums/TranslationLocale';

export const formName = 'accountForm';

type RelayProps = {| viewer: AccountForm_viewer |};

type Props = {|
  ...RelayProps,
  ...ReduxFormFormProps,
  newEmail?: ?string,
  newEmailToConfirm?: ?string,
  initialValues: Object,
  currentLanguage: ?string,
  +defaultLocale: string,
  +dispatch: Dispatch,
  +features: FeatureToggles,
  +languageList: Array<LocaleMap>,
  +intl: IntlShape,
|};

export const validate = (values: { email: ?string }): { email: ?string } => {
  const errors = {};
  if (!values.email) {
    errors.email = 'global.required';
  } else if (!isEmail(values.email)) {
    errors.email = 'proposal.vote.constraints.email';
  }

  return errors;
};

export const onSubmit = (
  values: { email: ?string, language: ?TranslationLocale, passwordConfirm: ?string },
  dispatch: Dispatch,
  props: Props,
) => {
  const localeInput = {
    locale: values.language,
  };
  const input = {
    email: values.email || '',
    passwordConfirm: values.passwordConfirm || '',
  };

  if (values.email === props.initialValues.email) {
    return UpdateProfileAccountLocaleMutation.commit({ input: localeInput })
      .then((localeResponse: LocaleResponse) => {
        if (
          !localeResponse.updateProfileAccountLocale ||
          !localeResponse.updateProfileAccountLocale.viewer
        ) {
          throw new Error('Mutation "updateProfileAccountLocale" failed.');
        }
        if (localeResponse && localeResponse.updateProfileAccountLocale.viewer.locale) {
          CookieMonster.setLocale(localeResponse.updateProfileAccountLocale.viewer.locale);
          const prefix = localeResponse.updateProfileAccountLocale?.viewer?.locale
            ? localeResponse.updateProfileAccountLocale?.viewer?.locale.split('-')[0]
            : '';
          window.location.href = `/${prefix}/profile/edit-profile#account`;
        }
      })
      .catch((): void => {
        throw new SubmissionError({ _error: 'global.error.server.form' });
      });
  }
  if (input.email && input.passwordConfirm) {
    return UpdateProfileAccountEmailMutation.commit({ input })
      .then(response => {
        if (!response.updateProfileAccountEmail || !response.updateProfileAccountEmail.viewer) {
          throw new Error('Mutation "updateProfileAccountEmail" failed.');
        }
        if (
          localeInput.locale !== null &&
          typeof localeInput.locale !== 'undefined' &&
          localeInput.locale !== props.initialValues.locale &&
          typeof props.initialValues.language !== 'undefined'
        ) {
          return UpdateProfileAccountLocaleMutation.commit({ input: localeInput })
            .then((localeResponse: LocaleResponse) => {
              if (
                !localeResponse.updateProfileAccountLocale ||
                !localeResponse.updateProfileAccountLocale.viewer
              ) {
                throw new Error('Mutation "updateProfileAccountLocale" failed.');
              }
              if (
                localeResponse.updateProfileAccountLocale.viewer.locale !== null &&
                typeof localeResponse.updateProfileAccountLocale.viewer.locale !== 'undefined'
              ) {
                CookieMonster.setLocale(localeResponse.updateProfileAccountLocale.viewer.locale);
                const prefix =
                  localeResponse?.updateProfileAccountLocale?.viewer?.locale !== null &&
                  typeof localeResponse?.updateProfileAccountLocale?.viewer?.locale !== 'undefined'
                    ? // $FlowFixMe
                      localeResponse.updateProfileAccountLocale.viewer.locale.split('-')[0]
                    : '';
                window.location.href = `/${prefix}/profile/edit-profile#account`;
              }
            })
            .catch((): void => {
              throw new SubmissionError({ _error: 'global.error.server.form' });
            });
        }
      })
      .catch((response): void => {
        if (response.error === 'SPECIFY_PASSWORD') {
          throw new SubmissionError({ _error: 'user.confirm.wrong_password' });
        }
        if (response.error === 'ALREADY_USED_EMAIL') {
          throw new SubmissionError({ _error: 'registration.constraints.email.already_used' });
        }
        if (response.error === 'UNAUTHORIZED_EMAIL_DOMAIN') {
          throw new SubmissionError({ _error: 'unauthorized-domain-name' });
        }

        throw new SubmissionError({ _error: 'global.error.server.form' });
      });
  }
};

const AccountContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  .account-form-hint {
    padding-left: 15px;
    padding-bottom: 10px;
    font-size: 14px;
    color: ${colors.gray};
  }
`;

const FooterContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  button.btn-danger {
    background-color: ${colors.dangerColor};
  }
  button.btn-primary {
    background-color: ${colors.primaryColor};
  }
`;

export const AccountForm = ({
  intl,
  features,
  initialValues,
  dispatch,
  handleSubmit,
  error,
  newEmail,
  invalid,
  valid,
  submitSucceeded,
  submitFailed,
  submitting,
  languageList,
  viewer,
}: Props) => {
  const [showConfirmPasswordModal, setConfirmPasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const _renderLanguageSection = () => {
    if (features.multilangue) {
      const localeListOptions = languageList.map((languageObject: LocaleMap) => {
        return {
          value: TranslationLocaleEnum[languageObject.code],
          label: intl.formatMessage({ id: languageObject.translationKey }),
        };
      });

      return (
        <>
          <label className="col-sm-3 control-label" htmlFor="display__language">
            <FormattedMessage id="display-language" />
          </label>
          <div className="col-sm-6">
            <Field
              component={select}
              name="language"
              id="display__language"
              divClassName="col-sm-6 mb-10"
              options={localeListOptions}
            />
          </div>
          <span className="account-form-hint">
            <FormattedMessage id="display-language-hint" />
          </span>
        </>
      );
    }
    return null;
  };

  const footer = (
    <div className="pl-15">
      <FooterContainer>
        <Button
          id="edit-account-profile-button"
          onClick={() => {
            if (initialValues.email === newEmail) {
              dispatch(submit(formName));
            } else {
              setConfirmPasswordModal(true);
            }
          }}
          disabled={invalid || submitting}
          bsStyle="primary">
          {submitting ? (
            <FormattedMessage id="global.loading" />
          ) : (
            <FormattedMessage id="global.save_modifications" />
          )}
        </Button>
        <Button
          id="delete-account-profile-button"
          bsStyle="danger"
          onClick={() => setShowDeleteAccountModal(true)}
          className="ml-15">
          <FormattedMessage id="delete-account" />
        </Button>
      </FooterContainer>
      <DeleteAccountModal
        viewer={viewer}
        show={showDeleteAccountModal}
        handleClose={() => setShowDeleteAccountModal(false)}
      />
    </div>
  );

  return (
    <>
      <Panel.Body>
        <form onSubmit={handleSubmit} id="profile-account">
          <AccountContainer>
            <label className="col-sm-3 control-label" htmlFor="account__email">
              <FormattedMessage id="global.email" />
            </label>
            <div>
              <Field
                type="email"
                component={renderComponent}
                name="email"
                id="account__email"
                divClassName="col-sm-6"
              />
            </div>
            <span className="account-form-hint">
              <i className="icon cap-lock-2" />
              <FormattedMessage id="account.your_email_is_not_public" />
            </span>
            {_renderLanguageSection()}
            <ConfirmPasswordModal
              show={showConfirmPasswordModal}
              handleClose={() => setConfirmPasswordModal(false)}
            />
          </AccountContainer>
          {viewer.newEmailToConfirm && (
            <div className="col-sm-6 col-sm-offset-3">
              <p className="small excerpt">
                <FormattedHTMLMessage
                  id="user.confirm.profile_help"
                  values={{ email: viewer.newEmailToConfirm }}
                />
              </p>
              <p className="small excerpt col-sm-6 col-sm-offset-3">
                <a href="#resend" onClick={() => resendConfirmation()}>
                  <FormattedMessage id="user.confirm.resend" />
                </a>
                {' · '}
                <a href="#cancel" onClick={() => cancelEmailChange(dispatch, initialValues.email)}>
                  <FormattedMessage id="user.confirm.cancel" />
                </a>
              </p>
            </div>
          )}
          <div className="col-sm-6 col-sm-offset-3 mt-5 mb-15 w-100" id="profile-alert-form">
            <AlertForm
              valid={valid}
              invalid={invalid}
              errorMessage={error}
              submitSucceeded={submitSucceeded}
              submitFailed={submitFailed}
              submitting={submitting}
            />
          </div>
        </form>
      </Panel.Body>
      <Panel.Footer>{footer}</Panel.Footer>
    </>
  );
};

const selector = formValueSelector(formName);

const form = reduxForm({
  validate,
  onSubmit,
  form: formName,
})(AccountForm);

const mapStateToProps = (state: State, props: Props) => {
  return {
    features: state.default.features,
    newEmailToConfirm: props.viewer.newEmailToConfirm,
    newEmail: formValueSelector(formName)(state, 'email'),
    passwordConfirm: formValueSelector(passwordForm)(state, 'password'),
    language: formValueSelector(formName)(state, 'language'),
    initialValues: {
      email: props.viewer.email ? props.viewer.email : null,
      language: props.viewer.locale ? TranslationLocaleEnum[props.viewer.locale] : null,
    },
    currentValues: selector(state, 'email', 'language'),
  };
};

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  viewer: graphql`
    fragment AccountForm_viewer on User {
      email
      locale
      newEmailToConfirm
      ...DeleteAccountModal_viewer
    }
  `,
});
