import type { LocaleMap } from '@shared/language/SiteLanguageChangeButton'
import { FranceConnectButton, getButtonLinkForType } from '@shared/login/LoginSocialButton'
import { default as Icon, ICON_NAME, default as SocialIcon } from '@shared/ui/LegacyIcons/Icon'
import CookieMonster from '@shared/utils/CookieMonster'
import { pxToRem } from '@shared/utils/pxToRem'
import React, { useEffect, useState } from 'react'
import { Button, ListGroupItem, Panel } from 'react-bootstrap'
import type { IntlShape } from 'react-intl'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { createFragmentContainer, graphql } from 'react-relay'
import {
  Field,
  formValueSelector,
  hasSubmitFailed,
  hasSubmitSucceeded,
  isInvalid,
  isPristine,
  isSubmitting,
  isValid,
  reduxForm,
  SubmissionError,
  submit,
} from 'redux-form'
import styled from 'styled-components'
import select from '~/components/Form/Select'
import ConfirmPasswordModal, { passwordForm } from '~/components/User/ConfirmPasswordModal'
import DeleteAccountModal from '~/components/User/DeleteAccountModal'
import DissociateSsoModal from '~/components/User/Profile/DissociateSsoModal'
import UpdateProfileAccountEmailMutation from '~/mutations/UpdateProfileAccountEmailMutation'
import UpdateProfileAccountLocaleMutation from '~/mutations/UpdateProfileAccountLocaleMutation'
import { cancelEmailChange, accountForm as formName, resendConfirmation } from '~/redux/modules/user'
import colors from '~/utils/colors'
import { TranslationLocaleEnum } from '~/utils/enums/TranslationLocale'
import Tooltip from '~ds/Tooltip/Tooltip'
import type { AccountForm_viewer } from '~relay/AccountForm_viewer.graphql'
import type {
  UpdateProfileAccountLocaleMutationResponse as LocaleResponse,
  TranslationLocale,
} from '~relay/UpdateProfileAccountLocaleMutation.graphql'
import { isEmail } from '../../../services/Validator'
import type { Dispatch, FeatureToggles, ReduxStoreSSOConfiguration, State } from '../../../types'
import AlertForm from '../../Alert/AlertForm'
import renderComponent from '../../Form/Field'
import ListGroup from '../../Ui/List/ListGroup'

type RelayProps = {
  viewer: AccountForm_viewer
}
type StateProps = {
  readonly features: FeatureToggles
  ssoList: Array<ReduxStoreSSOConfiguration>
}
type Props = RelayProps &
  StateProps &
  ReduxFormFormProps & {
    newEmail?: string | null | undefined
    newEmailToConfirm?: string | null | undefined
    initialValues: Record<string, any>
    currentLanguage: string | null | undefined
    loginWithOpenId: boolean
    readonly dispatch: Dispatch
    readonly languageList: Array<LocaleMap>
    readonly intl: IntlShape
  }
export const validate = (values: {
  email: string | null | undefined
}): {
  email: string | null | undefined
} => {
  const errors: any = {}

  if (!values.email) {
    errors.email = 'global.required'
  } else if (!isEmail(values.email)) {
    errors.email = 'proposal.vote.constraints.email'
  }

  return errors
}
export const onSubmit = (
  values: {
    email: string | null | undefined
    language: TranslationLocale
    passwordConfirm: string | null | undefined
  },
  dispatch: Dispatch,
  props: Props,
) => {
  const localeInput = {
    locale: values.language,
  }
  const input = {
    email: values.email || '',
    passwordConfirm: values.passwordConfirm || '',
  }

  if (values.email === props.initialValues.email && props.features.multilangue) {
    return UpdateProfileAccountLocaleMutation.commit({
      input: localeInput,
    })
      .then((localeResponse: LocaleResponse) => {
        if (!localeResponse.updateProfileAccountLocale || !localeResponse.updateProfileAccountLocale.viewer) {
          throw new Error('Mutation "updateProfileAccountLocale" failed.')
        }

        if (localeResponse && localeResponse.updateProfileAccountLocale.viewer.locale) {
          CookieMonster.setLocale(localeResponse.updateProfileAccountLocale.viewer.locale)
          const prefix = localeResponse.updateProfileAccountLocale?.viewer?.locale
            ? localeResponse.updateProfileAccountLocale?.viewer?.locale.split('-')[0]
            : ''
          window.location.href = `/${prefix}/profile/edit-profile#account`
        }
      })
      .catch((): void => {
        throw new SubmissionError({
          _error: 'global.error.server.form',
        })
      })
  }

  if (
    input.email &&
    (props.viewer.hasPassword || (props.viewer.isFranceConnectAccount && !props.viewer.hasPassword))
  ) {
    return UpdateProfileAccountEmailMutation.commit({
      input,
    })
      .then(response => {
        if (!response.updateProfileAccountEmail || !response.updateProfileAccountEmail.viewer) {
          throw new Error('Mutation "updateProfileAccountEmail" failed.')
        }

        if (
          localeInput.locale !== null &&
          typeof localeInput.locale !== 'undefined' &&
          localeInput.locale !== props.initialValues.locale &&
          typeof props.initialValues.language !== 'undefined' &&
          props.features.multilangue
        ) {
          return UpdateProfileAccountLocaleMutation.commit({
            input: localeInput,
          })
            .then((localeResponse: LocaleResponse) => {
              if (!localeResponse.updateProfileAccountLocale || !localeResponse.updateProfileAccountLocale.viewer) {
                throw new Error('Mutation "updateProfileAccountLocale" failed.')
              }

              if (
                localeResponse.updateProfileAccountLocale.viewer.locale !== null &&
                typeof localeResponse.updateProfileAccountLocale.viewer.locale !== 'undefined'
              ) {
                CookieMonster.setLocale(localeResponse.updateProfileAccountLocale.viewer.locale)
                const prefix =
                  localeResponse?.updateProfileAccountLocale?.viewer?.locale !== null &&
                  typeof localeResponse?.updateProfileAccountLocale?.viewer?.locale !== 'undefined'
                    ? localeResponse.updateProfileAccountLocale.viewer.locale.split('-')[0]
                    : ''
                window.location.href = `/${prefix}/profile/edit-profile#account`
              }
            })
            .catch((): void => {
              throw new SubmissionError({
                _error: 'global.error.server.form',
              })
            })
        }
      })
      .catch((response): void => {
        if (response.error === 'SPECIFY_PASSWORD') {
          throw new SubmissionError({
            _error: 'user.confirm.wrong_password',
          })
        }
        if (response.error === 'PASSWORD_NOT_VALID') {
          throw new SubmissionError({
            _error: 'fos_user.password.not_valid',
          })
        }

        if (response.error === 'ALREADY_USED_EMAIL') {
          throw new SubmissionError({
            _error: 'registration.constraints.email.already_used',
          })
        }

        if (response.error === 'UNAUTHORIZED_EMAIL_DOMAIN') {
          throw new SubmissionError({
            _error: 'unauthorized-domain-name',
          })
        }

        throw new SubmissionError({
          _error: 'global.error.server.form',
        })
      })
  }
}
const AccountContainer = styled.div`
  display: flex;
  flex-direction: column;
  .account-form-hint {
    padding-left: 15px;
    padding-bottom: 10px;

    span:nth-child(2) {
      margin-left: 4px;
    }

    font-size: 14px;
    color: ${colors.gray};
  }
`
const FooterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`
const SsoDiv = styled.div`
  display: flex;
  align-items: center;
  a {
    font-size: 13px;
  }
`
const SsoIcon = styled.div<{
  type?: string
}>`
  width: 40px;
  margin-right: 5px;
  .loginIcon {
    & > svg {
      ${props => {
        if (props.type === 'franceConnect') {
          return 'height: 45px;transform: translate(5px , 5px);'
        }

        if (props.type === 'fb') {
          return 'height: 45px;transform: translate(-12px , -2px);'
        }

        return 'height: 35px;transform: translate(0px , -2px);'
      }}
    }
  }
`
const SsoGroup = styled.div`
  margin-top: 10px;
  padding-left: 15px;

  span.sign-in-method {
    font-size: 14px;
    color: ${colors.gray};
  }
`
const AssociateLink = styled.a<{
  color: string
  bcd: string
}>`
  padding: 5px;
  width: 84px;
  height: 30px;
  background: ${props => props.bcd};
  border-radius: 17.5px;
  color: ${props => props.color};
  font-size: 14px;
  text-align: center;
  cursor: pointer;
`
const FcContent = styled.div`
  display: flex;
  flex-direction: column;
  > span {
    font-size: 12px;
    color: ${colors.gray};
  }
`
const FcBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
`
const StyledFranceConnectButton = styled(FranceConnectButton)`
  margin: 0;
  margin-right: auto;
  width: auto;
  svg {
    height: 100%;
  }
`
export const AccountForm: React.FC<Props> = ({
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
  ssoList,
}) => {
  const [showConfirmPasswordModal, setConfirmPasswordModal] = useState(false)
  const [isConfirmPasswordPending, setConfirmPasswordPending] = useState(false)
  const [hasCreatedLocalPassword, setHasCreatedLocalPassword] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [showDissociateSsoModal, setShowDissociateSsoModal] = useState(false)
  const [isHover, seIsHover] = useState<boolean>(false)
  const viewerHasPassword = viewer.hasPassword || hasCreatedLocalPassword

  const isFacebookLoginEnabled = ssoList.filter(sso => sso.ssoType === 'facebook').length > 0

  useEffect(() => {
    if (isConfirmPasswordPending && !submitting && (submitSucceeded || submitFailed)) {
      if (submitSucceeded && viewer.isFranceConnectAccount && !viewer.hasPassword) {
        setHasCreatedLocalPassword(true)
      }
      setConfirmPasswordPending(false)
    }
  }, [isConfirmPasswordPending, submitting, submitSucceeded, submitFailed, viewer.hasPassword, viewer.isFranceConnectAccount])

  const _renderLanguageSection = () => {
    if (features.multilangue) {
      const localeListOptions = languageList.map((languageObject: LocaleMap) => {
        return {
          value: TranslationLocaleEnum[languageObject.code],
          label: intl.formatMessage({
            id: languageObject.translationKey,
          }),
        }
      })
      return (
        <>
          <label
            className="col-sm-3 control-label"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '10px',
              width: 'fit-content',
            }}
            htmlFor="display__language"
          >
            <FormattedMessage id="display-language" />
            <Tooltip
              placement="top"
              label={<FormattedMessage id="display-language-hint" />}
              id="tooltip"
              className="account-form-hint"
              style={{
                wordBreak: 'break-word',
              }}
            >
              <span
                className="ml-5 excerpt"
                style={{
                  fontSize: 15,
                }}
              >
                <Icon name={ICON_NAME.information} size={15} color={colors.darkGray} className="mr-5" />
              </span>
            </Tooltip>
          </label>
          <div>
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
      )
    }

    return null
  }

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
          title={intl.formatMessage({
            id: 'global-unlink',
          })}
          id={`dissociate-event-${service}`}
        >
          <FormattedMessage id="global-unlink" />
        </AssociateLink>
      </>
    )
  }

  const emailDisabled = () => {
    if (viewer.isFranceConnectAccount) {
      return false
    }

    return !viewerHasPassword
  }

  const footer = (
    <div className="pl-15">
      <FooterContainer>
        {!loginWithOpenId && (
          <Button
            id="edit-account-profile-button"
            onClick={() => {
              if (initialValues.email === newEmail || emailDisabled() === true) {
                dispatch(submit(formName))
              } else {
                setConfirmPasswordModal(true)
              }
            }}
            disabled={invalid || submitting}
            bsStyle="primary"
          >
            {submitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="global.save_modifications" />
            )}
          </Button>
        )}
        <Button id="delete-account-profile-button" bsStyle="danger" onClick={() => setShowDeleteAccountModal(true)}>
          <FormattedMessage id="delete-account" />
        </Button>
      </FooterContainer>
      <DeleteAccountModal
        viewer={viewer}
        show={showDeleteAccountModal}
        handleClose={() => setShowDeleteAccountModal(false)}
      />
    </div>
  )

  const signMethod = () => {
    if (features.login_franceconnect && !isFacebookLoginEnabled) {
      return 'Sign-in-method-fc'
    }

    if (!features.login_franceconnect && isFacebookLoginEnabled) {
      return 'Sign-in-method-fb'
    }

    return 'Sign-in-method'
  }

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
                disabled={emailDisabled()}
                id="account__email"
                divClassName="col-sm-6"
              />
              <span className="account-form-hint">
                {viewer.isFranceConnectAccount ? <FormattedMessage id="data-from-FranceConnect" /> : null}
                <FormattedMessage id="account.your_email_is_not_public" />
              </span>
              {_renderLanguageSection()}
              <ConfirmPasswordModal
                show={showConfirmPasswordModal}
                handleClose={() => {
                  setConfirmPasswordModal(false)
                  setConfirmPasswordPending(false)
                }}
                onConfirm={() => {
                  setConfirmPasswordPending(true)
                  setConfirmPasswordModal(false)
                  dispatch(submit(formName))
                }}
                isFranceConnectAccount={viewer.isFranceConnectAccount}
                hasPassword={viewerHasPassword}
              />
              {viewer.newEmailToConfirm && (
                <div className="col-sm-6 col-sm-offset-3">
                  <p className="small excerpt">
                    <FormattedHTMLMessage
                      id="user.confirm.profile_help"
                      values={{
                        email: viewer.newEmailToConfirm,
                      }}
                    />
                  </p>
                  <p className="small excerpt col-sm-6 col-sm-offset-3">
                    <a href="#resend" onClick={() => resendConfirmation(intl)}>
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
            </AccountContainer>
          </form>
          {features.login_franceconnect || isFacebookLoginEnabled ? (
            <SsoGroup>
              <span className="font-weight-bold">
                <FormattedMessage id="Sign-in-option" />
              </span>
              <span className="clearfix sign-in-method">
                <FormattedMessage id={signMethod()} />
              </span>
              <ListGroup className="mt-10">
                {features.login_franceconnect && (
                  <ListGroupItem
                    className="bgc-fa h-70"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-start',
                      width: 'fit-content',
                      marginBottom: pxToRem(8),
                    }}
                  >
                    <FcBlock>
                      {viewer.isFranceConnectAccount && (
                        <>
                          <SsoDiv>
                            <FcContent>
                              <b>FranceConnect</b>
                              <FormattedMessage id="fc-title" />
                            </FcContent>
                          </SsoDiv>
                          <a
                            href="https://tableaudebord.franceconnect.gouv.fr/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FormattedMessage id="fc-archive-connection" />
                          </a>
                          <>{dissociate('FRANCE_CONNECT', 'FranceConnect')}</>
                        </>
                      )}
                      {!viewer.isFranceConnectAccount && (
                        <>
                          <SsoDiv>
                            <FcContent>
                              <b>FranceConnect</b>
                              <FormattedMessage id="fc-title" />
                            </FcContent>
                          </SsoDiv>
                          <StyledFranceConnectButton
                            justifyContent="center"
                            style={{ height: pxToRem(40), marginTop: pxToRem(8), marginBottom: pxToRem(8) }}
                          >
                            <a
                              href={`${window && window.location.origin}/profile/franceconnect/associate`}
                              title="franceConnect"
                              onMouseEnter={() => seIsHover(true)}
                              onMouseLeave={() => seIsHover(false)}
                            >
                              <SocialIcon
                                className="loginIcon"
                                name={isHover ? 'franceConnectHover' : 'franceConnect'}
                              />
                            </a>
                          </StyledFranceConnectButton>
                          <a href="https://franceconnect.gouv.fr/" target="_blank" rel="noopener noreferrer">
                            Qu’est-ce-que FranceConnect ?
                          </a>
                        </>
                      )}
                    </FcBlock>
                  </ListGroupItem>
                )}
                {isFacebookLoginEnabled && (
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
                          title="facebook"
                        >
                          <FormattedMessage id="global-link" />
                        </AssociateLink>
                      ) : (
                        <>{dissociate('FACEBOOK', 'Facebook')}</>
                      )}
                    </>
                  </ListGroupItem>
                )}
              </ListGroup>
            </SsoGroup>
          ) : null}
        </Panel.Body>
      )}
      <Panel.Footer>{footer}</Panel.Footer>
    </>
  )
}
const selector = formValueSelector(formName)
const form = reduxForm({
  validate,
  onSubmit,
  form: formName,
})(AccountForm)

const mapStateToProps = (state: State, props: Props) => {
  return {
    features: state.default.features,
    newEmailToConfirm: props.viewer.newEmailToConfirm,
    newEmail: formValueSelector(formName)(state, 'email'),
    passwordConfirm: formValueSelector(passwordForm)(state, 'passwordConfirm'),
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
    ssoList: state.default.ssoList,
  }
}

// @ts-ignore
const container = connect(mapStateToProps)(injectIntl(form))
export default createFragmentContainer(container, {
  viewer: graphql`
    fragment AccountForm_viewer on User {
      email
      locale
      newEmailToConfirm
      facebookId
      hasPassword
      isFranceConnectAccount
      ...DeleteAccountModal_viewer
      ...DissociateSsoModal_viewer
    }
  `,
})
