import * as React from 'react'
import { useIntl } from 'react-intl'

import styled from 'styled-components'
import { usePopoverState, Popover, PopoverDisclosure, PopoverArrow } from 'reakit/Popover'
import { connect } from 'react-redux'
import { Button, Box, Text, Flex } from '@cap-collectif/ui'
import type { Dispatch, State } from '~/types'
import { openLoginModal } from '@shared/login/LoginButton'
import { loginWithOpenID } from '~/redux/modules/default'
import VisuallyHidden from '~ds/VisuallyHidden/VisuallyHidden'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { baseUrl } from '~/config'
import { openRegistrationModal } from '@shared/register/RegistrationButton'

export type Placement =
  | 'auto-start'
  | 'auto'
  | 'auto-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'right-start'
  | 'right'
  | 'right-end'
  | 'bottom-end'
  | 'bottom'
  | 'bottom-start'
  | 'left-end'
  | 'left'
  | 'left-start'
type OwnProps = {
  readonly children: any
  readonly enabled?: boolean
  readonly placement?: Placement
}
type StateProps = {
  readonly isAuthenticated: boolean
  readonly showRegistrationButton: boolean
  readonly loginWithOpenId?: boolean
}
type Props = OwnProps &
  StateProps & {
    readonly dispatch: Dispatch
  }
const PopoverContainer = styled(Box).attrs({
  maxWidth: '280px',
  zIndex: 1040,
})`
  outline: none;
`

const Arrow = styled(Box)<{
  position: Placement
}>`
  .stroke {
    fill: none;
  }

  .fill {
    fill: ${props => (props.position === 'bottom' ? '#f7f7f7' : 'white')};
  }
`
// There is !important css because there is specific styles on pages that break the component display
export const LoginOverlay = ({
  isAuthenticated,
  children,
  enabled = true,
  showRegistrationButton,
  loginWithOpenId = false,
  placement = 'auto',
}: Props) => {
  const byPassLoginModal = useFeatureFlag('sso_by_pass_auth')
  const oauth2SwitchUser = useFeatureFlag('oauth2_switch_user')

  const popover = usePopoverState({
    baseId: 'popover-overlay',
    placement,
  })
  const intl = useIntl()
  if (!enabled || isAuthenticated) return children

  let redirectUrl: string = baseUrl

  if (loginWithOpenID && byPassLoginModal) {
    const redirectUri = oauth2SwitchUser
      ? `${baseUrl}/sso/switch-user?_destination=${window && window.location.href}`
      : `${window && window.location.href}`
    redirectUrl = `/login/openid?_destination=${redirectUri}`
  }

  return (
    <>
      <PopoverDisclosure {...popover} ref={children.ref} {...children.props} onClick={null}>
        {disclosureProps => React.cloneElement(children, disclosureProps)}
      </PopoverDisclosure>

      <Popover
        {...popover}
        tabIndex={0}
        aria-label={intl.formatMessage({
          id: 'vote.popover.title',
        })}
        as={PopoverContainer}
        id="login-popover"
        borderRadius="popover"
        boxShadow="0 5px 10px rgb(0 0 0 / 20%)"
      >
        <PopoverArrow {...popover} as={Arrow} position={popover.placement} />

        <Box overflow="hidden" borderRadius="popover" bg="white" color="black">
          <Text
            py="8px !important"
            px={3}
            bg="#f7f7f7"
            borderBottom="normal"
            borderColor="#ebebeb"
            fontSize={3}
            mb="0 !important"
            // @ts-ignore
            textAlign="left !important"
          >
            {intl.formatMessage({
              id: 'vote.popover.title',
            })}
          </Text>

          <Flex px={3} py="10px" direction="column" spacing="10px">
            <Text
              fontSize={3}
              pb="0 !important"
              // @ts-ignore
              textAlign="left !important"
              mb="0 !important"
            >
              {intl.formatMessage({
                id: 'vote.popover.body',
              })}
            </Text>

            <VisuallyHidden>
              <Button onClick={popover.hide}>
                {intl.formatMessage({
                  id: 'global.close',
                })}
              </Button>
            </VisuallyHidden>

            {showRegistrationButton && !loginWithOpenId && (
              <Button
                variant="secondary"
                justifyContent="center"
                onClick={() => {
                  dispatchEvent(new Event(openRegistrationModal))
                }}
              >
                {intl.formatMessage({ id: 'global.registration' })}
              </Button>
            )}

            <Button
              id="login-button"
              variant="primary"
              justifyContent="center"
              aria-label={intl.formatMessage({
                id: 'open.connection_modal',
              })}
              onClick={() => {
                if (loginWithOpenID && byPassLoginModal) {
                  window.location.href = redirectUrl
                } else {
                  dispatchEvent(new Event(openLoginModal))
                }
              }}
            >
              {intl.formatMessage({ id: 'global.login' })}
            </Button>
          </Flex>
        </Box>
      </Popover>
    </>
  )
}

const mapStateToProps = (state: State) => ({
  isAuthenticated: !!state.user.user,
  showRegistrationButton: state.default.features.registration || false,
  loginWithOpenId: loginWithOpenID(state.default.ssoList),
})
// @ts-ignore
export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps)(LoginOverlay)
