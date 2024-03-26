import React from 'react'
import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import type { ReduxStoreSSOConfiguration, State } from '~/types'
import LoginSocialButton from '../../Ui/Button/LoginSocialButton'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'

export type LabelPrefix = 'registration.' | 'login.' | ''
type StateProps = {
  ssoList?: Array<ReduxStoreSSOConfiguration>
}
type Props = StateProps & {
  prefix?: LabelPrefix
}
export const LoginSocialButtons = ({ ssoList }: Props) => {
  const loginFranceConnect = useFeatureFlag('login_franceconnect')
  const hasLoginSaml = useFeatureFlag('login_saml')
  const cas = useFeatureFlag('login_cas') && ssoList.length > 0 ? ssoList.find(sso => sso.ssoType === 'cas') : undefined
  const hasOauth2SwitchUser = useFeatureFlag('oauth2_switch_user')
  const hasSsoByPassAuth = useFeatureFlag('sso_by_pass_auth')
  const intl = useIntl()

  if (
    !(ssoList.length > 0 && ssoList.filter(sso => sso.ssoType === 'facebook').length > 0) &&
    !hasLoginSaml &&
    !cas &&
    !(ssoList.length > 0 && ssoList.filter(sso => sso.ssoType === 'oauth2').length > 0) &&
    !loginFranceConnect
  ) {
    return null
  }

  /* @TODO: Add more Login button in mapping when it will be configurable. */
  return (
    <>
      <div className="font-weight-semi-bold">
        {intl.formatMessage({
          id: 'authenticate-with',
        })}
      </div>
      {loginFranceConnect && ssoList.length > 0 && ssoList.find(sso => sso.ssoType === 'franceconnect') && (
        <LoginSocialButton type="franceConnect" justifyContent="center" />
      )}
      {ssoList.length > 0 &&
        ssoList
          .filter(sso => sso.ssoType !== 'franceconnect')
          .map(({ ssoType, name }: ReduxStoreSSOConfiguration, index: number) => {
            switch (ssoType) {
              case 'oauth2':
                return (
                  <LoginSocialButton
                    text={name}
                    key={index}
                    switchUserMode={hasOauth2SwitchUser || false}
                    type="openId"
                  />
                )

              case 'facebook':
                return <LoginSocialButton type="facebook" />

              case 'cas':
                return cas ? <LoginSocialButton type="cas" text={cas.name} /> : null

              default:
                break
            }
          })}
      {hasLoginSaml && <LoginSocialButton type="saml" />}
      {!hasSsoByPassAuth && (
        <p className="p--centered">
          {intl.formatMessage({
            id: 'login.or',
          })}
        </p>
      )}
    </>
  )
}

const mapStateToProps = (state: State) => ({
  // TODO use Fragment to get sso list
  ssoList: state.default.ssoList,
})

export default connect(mapStateToProps)(LoginSocialButtons)
