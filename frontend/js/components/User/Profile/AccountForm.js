// @flow
import React, { useState } from 'react';
import { FormattedMessage, FormattedHTMLMessage, type IntlShape, injectIntl } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { Button, Panel, ListGroupItem, OverlayTrigger } from 'react-bootstrap';
import {
  formValueSelector,
  hasSubmitFailed,
  hasSubmitSucceeded,
  isInvalid,
  isPristine,
  isSubmitting,
  isValid,
  SubmissionError,
  reduxForm,
  submit,
  Field,
} from 'redux-form';
import styled, { css, type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { isEmail } from '../../../services/Validator';
import renderComponent from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import type { State, Dispatch, FeatureToggles } from '../../../types';
import select from '~/components/Form/Select';
import type { LocaleMap } from '~ui/Button/SiteLanguageChangeButton';
import ConfirmPasswordModal, { passwordForm } from '~/components/User/ConfirmPasswordModal';
import {
  resendConfirmation,
  cancelEmailChange,
  accountForm as formName,
} from '~/redux/modules/user';
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
import ListGroup from '../../Ui/List/ListGroup';
import SocialIcon from '~ui/Icons/SocialIcon';
import { getButtonLinkForType } from '~ui/Button/LoginSocialButton';
import DissociateSsoModal from '~/components/User/Profile/DissociateSsoModal';
import Tooltip from '~/components/Utils/Tooltip';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type RelayProps = {| viewer: AccountForm_viewer |};

type StateProps = {|
  +features: FeatureToggles,
|};

type Props = {|
  ...RelayProps,
  ...StateProps,
  ...ReduxFormFormProps,
  newEmail?: ?string,
  newEmailToConfirm?: ?string,
  initialValues: Object,
  currentLanguage: ?string,
  loginWithOpenId: boolean,
  +dispatch: Dispatch,
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
  values: { email: ?string, language: TranslationLocale, passwordConfirm: ?string },
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
`;

const SsoDiv: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;
  a {
    font-size: 13px;
  }
`;

const SsoIcon: StyledComponent<{ type?: string }, {}, HTMLDivElement> = styled.div`
  width: 40px;
  margin-right: 5px;
  .loginIcon {
    ${props =>
      props.type === 'google' &&
      css`
        border-radius: 50%;
        padding: 7px;
        background-color: #fff;
        border: solid 1px #ddd;
      `}
    & > svg {
      ${props => {
        if (props.type === 'franceConnect') {
          return 'height: 45px;transform: translate(5px , 5px);';
        }
        if (props.type === 'google') {
          return 'height: 22px;transform: translate(0px , -2px);';
        }
        if (props.type === 'fb') {
          return 'height: 45px;transform: translate(-12px , -2px);';
        }
        return 'height: 35px;transform: translate(0px , -2px);';
      }}
    }
  }
`;

const SsoGroup: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin-top: 10px;
  padding-left: 15px;

  span.sign-in-method {
    font-size: 14px;
    color: ${colors.gray};
  }
`;

const AssociateLink: StyledComponent<
  { color: string, bcd: string },
  {},
  HTMLAnchorElement,
> = styled.a`
  padding: 5px;
  width: 84px;
  height: 30px;
  background: ${props => props.bcd};
  border-radius: 17.5px;
  color: ${props => props.color};
  font-size: 14px;
  text-align: center;
  cursor: pointer;
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
  loginWithOpenId,
}: Props) => {
  const [showConfirmPasswordModal, setConfirmPasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDissociateSsoModal, setShowDissociateSsoModal] = useState(false);

  const _renderLanguageSection = () => {
    if (features.multilangue) {
      const localeListOptions = languageList.map((languageObject: LocaleMap) => {
        return {
          value: TranslationLocaleEnum[languageObject.code],
          label: intl.formatMessage({ id: languageObject.translationKey }),
        };
      });
      const tooltipDelete = (
        <Tooltip id="tooltip" className="account-form-hint">
          <FormattedMessage id="display-language-hint" />
        </Tooltip>
      );
      return (
        <>
          <label className="col-sm-3 control-label" htmlFor="display__language">
            <FormattedMessage id="display-language" />
            <OverlayTrigger placement="top" overlay={tooltipDelete}>
              <span className="ml-5 excerpt" style={{ fontSize: 15 }}>
                <Icon
                  name={ICON_NAME.information}
                  size={15}
                  color={colors.darkGray}
                  className="mr-5"
                />
              </span>
            </OverlayTrigger>
          </label>
          <div className="col-sm-6">
            <Field
              component={select}
              name="language"
              clearable={false}
              id="display__language"
              divClassName="col-sm-6 mb-10"
              options={localeListOptions}
            />
          </div>
        </>
      );
    }
    return null;
  };

  const dissociate = (service: string, title: string) => {
    return (
      <>
        <DissociateSsoModal
          handleClose={() => setShowDissociateSsoModal(false)}
          dispatch
          viewer={viewer}
          service={service}
          title={title}
          show={showDissociateSsoModal}
        />
        <AssociateLink
          bcd="rgba(51, 51, 51, 0.08)"
          color="rgb(51, 51, 51)"
          onClick={() => setShowDissociateSsoModal(true)}
          title={intl.formatMessage({ id: 'global-unlink' })}
          id={`dissociate-event-${service}`}>
          <FormattedMessage id="global-unlink" />
        </AssociateLink>
      </>
    );
  };

  const footer = (
    <div className="pl-15">
      <FooterContainer>
        {!loginWithOpenId && (
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
        )}
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
      {!loginWithOpenId && (
        <Panel.Body>
          <form onSubmit={handleSubmit} id="profile-account">
            <AccountContainer>
              <label className="col-sm-3 control-label" htmlFor="account__email">
                <FormattedMessage id="global.email" />
              </label>
              <Field
                type="email"
                component={renderComponent}
                name="email"
                disabled={!viewer.hasPassword || viewer.isFranceConnectAccount}
                id="account__email"
                divClassName="col-sm-6"
              />
              <span className="account-form-hint">
                {viewer.isFranceConnectAccount && <FormattedMessage id="data-from-FranceConnect" />}
                <FormattedMessage id="account.your_email_is_not_public" />
              </span>
              {_renderLanguageSection()}
              <ConfirmPasswordModal
                show={showConfirmPasswordModal}
                handleClose={() => setConfirmPasswordModal(false)}
              />
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
                    <a
                      href="#cancel"
                      onClick={() => cancelEmailChange(dispatch, initialValues.email)}>
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
            </AccountContainer>
          </form>
          <SsoGroup>
            <span className="font-weight-bold">
              <FormattedMessage id="Sign-in-option" />
            </span>
            <span className="clearfix sign-in-method">
              <FormattedMessage id="Sign-in-method" />
            </span>
            <ListGroup className="mt-10">
              {features.login_franceconnect && (
                <ListGroupItem className="bgc-fa h-70">
                  <SsoDiv>
                    <SsoIcon type="franceConnect">
                      <SocialIcon className="loginIcon" name="franceConnectIcon" />
                    </SsoIcon>
                    <span>
                      <b>FranceConnect</b>
                      <br />
                      {viewer.isFranceConnectAccount ? (
                        <a
                          href="https://fcp.integ01.dev-franceconnect.fr/traces/"
                          target="_blank"
                          rel="noopener noreferrer">
                          <FormattedMessage id="fc-archive-connection" />
                        </a>
                      ) : (
                        <a
                          href="https://franceconnect.gouv.fr/"
                          target="_blank"
                          rel="noopener noreferrer">
                          Qu’est-ce-que FranceConnect ?
                        </a>
                      )}
                    </span>
                  </SsoDiv>
                  <>
                    {!viewer.isFranceConnectAccount ? (
                      <AssociateLink
                        bcd="rgba(3, 136, 204, 0.08)"
                        color="rgb(0, 140, 214)"
                        href={getButtonLinkForType(
                          'franceConnect',
                          `${window && window.location.origin + window.location.pathname}`,
                        )}
                        title="franceConnect">
                        <FormattedMessage id="global-link" />
                      </AssociateLink>
                    ) : (
                      <>{dissociate('FRANCE_CONNECT', 'FranceConnect')}</>
                    )}
                  </>
                </ListGroupItem>
              )}
              {features.login_facebook && (
                <ListGroupItem className="bgc-fa h-70">
                  <SsoDiv>
                    <SsoIcon type="fb">
                      <SocialIcon className="loginIcon" name="facebookF" />
                    </SsoIcon>
                    <span>
                      <b>Facebook</b>
                    </span>
                  </SsoDiv>
                  <>
                    {!viewer.facebookId ? (
                      <AssociateLink
                        bcd="rgba(3, 136, 204, 0.08)"
                        color="rgb(0, 140, 214)"
                        href={getButtonLinkForType(
                          'facebook',
                          `${window && window.location.origin + window.location.pathname}`,
                        )}
                        title="facebook">
                        <FormattedMessage id="global-link" />
                      </AssociateLink>
                    ) : (
                      <>{dissociate('FACEBOOK', 'Facebook')}</>
                    )}
                  </>
                </ListGroupItem>
              )}
              {features.login_gplus && (
                <ListGroupItem className="bgc-fa h-70">
                  <SsoDiv>
                    <SsoIcon type="google">
                      <SocialIcon className="loginIcon" name="googleColored" />
                    </SsoIcon>
                    <span>
                      <b>Google</b>
                    </span>
                  </SsoDiv>
                  <>
                    {!viewer.googleId ? (
                      <AssociateLink
                        bcd="rgba(3, 136, 204, 0.08)"
                        color="rgb(0, 140, 214)"
                        href={getButtonLinkForType(
                          'google',
                          `${window && window.location.origin + window.location.pathname}`,
                        )}
                        title="google">
                        <FormattedMessage id="global-link" />
                      </AssociateLink>
                    ) : (
                      <>{dissociate('GOOGLE', 'Google')}</>
                    )}
                  </>
                </ListGroupItem>
              )}
            </ListGroup>
          </SsoGroup>
        </Panel.Body>
      )}
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
    pristine: isPristine(formName)(state),
    valid: isValid(formName)(state),
    invalid: isInvalid(formName)(state),
    submitting: isSubmitting(formName)(state),
    submitSucceeded: hasSubmitSucceeded(formName)(state),
    submitFailed: hasSubmitFailed(formName)(state),
    initialValues: {
      email: props.viewer.email ? props.viewer.email : null,
      language: props.viewer.locale
        ? TranslationLocaleEnum[props.viewer.locale]
        : TranslationLocaleEnum[state.language.currentLanguage],
      isFranceConnectAccount: props.viewer.isFranceConnectAccount || null,
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
      facebookId
      googleId
      hasPassword
      isFranceConnectAccount
      ...DeleteAccountModal_viewer
      ...DissociateSsoModal_viewer
    }
  `,
});
