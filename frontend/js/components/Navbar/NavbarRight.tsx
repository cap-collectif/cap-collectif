import * as React from 'react'
import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import { Menu, MenuItem, MenuButton, MenuSeparator, useMenuState } from 'reakit/Menu'
import { TabsItemContainer, TabsLink } from '../Ui/TabsBar/styles'
import RegistrationButton from '../User/Registration/RegistrationButton'
import LoginButton from '../User/Login/LoginButton'
import UserAvatarDeprecated from '../User/UserAvatarDeprecated'
import type { State, FeatureToggles } from '~/types'
import type { User } from '~/redux/modules/user'
import { loginWithOpenID } from '~/redux/modules/default'
import * as S from '~ui/TabsBar/styles'
import AppBox from '~ui/Primitives/AppBox'
import useIsMobile from '~/utils/hooks/useIsMobile'
import NavbarRightMediator from './NavbarRightMediator'
import { Flex } from '@cap-collectif/ui'

type Props = {
  currentLanguage: string
  user: User | null | undefined
  features: FeatureToggles
  loginWithOpenId: boolean
  instanceName: string
  newHeader?: boolean
}
export const NavbarRight = ({
  user = null,
  features,
  loginWithOpenId,
  currentLanguage,
  instanceName,
  newHeader,
}: Props) => {
  const intl = useIntl()
  const prefix = features.multilangue ? `/${currentLanguage.split('-')[0]}` : ''
  const menu = useMenuState({
    baseId: 'user-profile',
  })

  const logout = () => {
    // We redirect to /logout page to invalidate session on the server
    window.location.href = `${window.location.protocol}//${window.location.host}/logout`
  }

  const isMobile = useIsMobile()
  const showAdminLink = user?.isAdmin || user?.isProjectAdmin || user?.isOrganizationMember
  return (
    <>
      {features.search && (!newHeader || !isMobile) && (
        <TabsItemContainer
          as="div"
          role="search"
          aria-label={intl.formatMessage({
            id: 'search.title',
          })}
        >
          <TabsLink id="global.menu.search" href="/search">
            <i className="cap cap-magnifier" aria-hidden />{' '}
            <span className="visible-xs-inline ml-5">
              {intl.formatMessage({
                id: 'global.menu.search',
              })}
            </span>
          </TabsLink>
        </TabsItemContainer>
      )}

      {user ? (
        <>
          <MenuButton
            {...menu}
            as={S.DropdownToggle}
            isOpen={menu.visible}
            id="navbar-username"
            aria-label={intl.formatMessage(
              {
                id: 'user.account.menu',
              },
              {
                username: user.username,
              },
            )}
          >
            <UserAvatarDeprecated user={user} size={34} anchor={false} />
            <AppBox as="span" ml="8px">
              {user.username}
            </AppBox>
            <span className="caret" />
          </MenuButton>

          <Menu
            {...menu}
            unstable_popoverStyles={isMobile ? null : menu.unstable_popoverStyles}
            as={S.DropdownMenu}
            hideOnClickOutside
            aria-label={intl.formatMessage(
              {
                id: 'user.account.menu',
              },
              {
                username: user.username,
              },
            )}
          >
            {user.roles?.includes('ROLE_MEDIATOR') && (
              <React.Suspense fallback={null}>
                <NavbarRightMediator />
              </React.Suspense>
            )}
            {showAdminLink && (
              <MenuItem {...menu} href={user.isAdmin ? '/admin/' : '/admin-next/projects'} as={S.TabsLink}>
                <i className="cap-setting-gears-1 mr-10" aria-hidden="true" />
                {intl.formatMessage({
                  id: 'global.administration',
                })}
              </MenuItem>
            )}

            {/** TODO: Some SSO users want a profile page, some don't we should add an option, for now let's go with a custom fix */}
            {features.profiles && (!loginWithOpenId || instanceName === 'idf-bp-dedicated') && (
              <MenuItem {...menu} as={S.TabsLink} href={`${prefix}/profile/${user.uniqueId}`}>
                <i className="cap cap-id-8 mr-10" aria-hidden="true" />
                {intl.formatMessage({
                  id: 'user.my.profile',
                })}
              </MenuItem>
            )}

            {!features.profiles && loginWithOpenId && (
              <MenuItem
                {...menu}
                as={S.TabsLink}
                href={`/sso/profile?referrer=${window.location.href}`}
                target="_blank"
                rel="noopener"
              >
                <i className="cap cap-id-8 mr-10" aria-hidden="true" />
                {intl.formatMessage({
                  id: 'user.my.profile',
                })}
                <i className="cap cap-external-link ml-10" aria-hidden="true" />
              </MenuItem>
            )}

            {user.isEvaluerOnNewTool && (
              <MenuItem {...menu} as={S.TabsLink} href="/evaluations">
                <i className="cap cap-edit-write mr-10" aria-hidden="true" />
                {intl.formatMessage({
                  id: 'evaluations.index.page_title',
                })}
              </MenuItem>
            )}

            <MenuItem {...menu} as={S.TabsLink} href={`${prefix}/profile/edit-profile`}>
              <i className="cap cap-setting-adjustment mr-10" aria-hidden="true" />
              {intl.formatMessage({
                id: 'global.params',
              })}
            </MenuItem>

            {features.oauth2_switch_user && (
              <MenuItem {...menu} as={S.TabsLink} href="/logout?ssoSwitchUser=true">
                <i className="cap cap-refresh mr-10" aria-hidden="true" />
                {intl.formatMessage({
                  id: 'change-user',
                })}
              </MenuItem>
            )}

            <MenuSeparator {...menu} as={S.Separator} />

            <MenuItem {...menu} as={S.TabsLink} id="logout-button" onClick={logout}>
              <i className="cap cap-power-1 mr-10" aria-hidden="true" />
              {intl.formatMessage({
                id: 'global.logout',
              })}
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Flex px={4} spacing={1}>
          {/** @ts-ignore */}
          <RegistrationButton className="navbar-btn" />
          <LoginButton className="btn-darkest-gray navbar-btn btn--connection" />
        </Flex>
      )}
    </>
  )
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  instanceName: state.default.instanceName,
  loginWithOpenId: loginWithOpenID(state.default.ssoList),
  user: state.user.user,
})

export default connect(mapStateToProps)(NavbarRight)
