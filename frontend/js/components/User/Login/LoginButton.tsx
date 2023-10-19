import * as React from 'react'
import { useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { baseUrl } from '~/config'
import { showLoginModal } from '~/redux/modules/user'
import type { State, Dispatch } from '~/types'
import type { BsStyle } from '~/types/ReactBootstrap.type'
import { loginWithOpenID as isLoginWithOpenID } from '~/redux/modules/default'

type OwnProps = {
  bsStyle?: BsStyle
  className?: string | null | undefined
  style?: Record<string, any> | null | undefined
}
type StateProps = {
  loginWithOpenID: boolean
  byPassLoginModal: boolean
  oauth2SwitchUser: boolean
  openLoginModal: () => void
}
type Props = OwnProps & StateProps
export const LoginButton = (props: Props) => {
  const intl = useIntl()
  let redirectUrl: string = baseUrl
  const { openLoginModal, byPassLoginModal, loginWithOpenID, oauth2SwitchUser, style, bsStyle, className } = props

  if (loginWithOpenID && byPassLoginModal) {
    const redirectUri = oauth2SwitchUser
      ? `${baseUrl}/sso/switch-user?_destination=${window && window.location.href}`
      : `${window && window.location.href}`
    redirectUrl = `/login/openid?_destination=${redirectUri}`
  }

  return (
    // @ts-ignore
    <span style={style}>
      <Button
        destination={redirectUrl}
        bsStyle={bsStyle}
        aria-label={intl.formatMessage({
          id: 'open.connection_modal',
        })}
        onClick={() => {
          if (loginWithOpenID && byPassLoginModal) {
            window.location.href = redirectUrl
          } else {
            openLoginModal()
          }
        }}
        className={className}
      >
        {intl.formatMessage({ id: 'global.login' })}
      </Button>
    </span>
  )
}
LoginButton.defaultProps = {
  bsStyle: 'default',
  className: '',
  style: {},
}

const mapStateToProps = (state: State) => ({
  loginWithOpenID: isLoginWithOpenID(state.default.ssoList),
  byPassLoginModal: state.default.features.sso_by_pass_auth || false,
  oauth2SwitchUser: state.default.features.oauth2_switch_user || false,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  openLoginModal: () => {
    dispatch(showLoginModal())
  },
})

// @ts-ignore
export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, mapDispatchToProps)(LoginButton)
