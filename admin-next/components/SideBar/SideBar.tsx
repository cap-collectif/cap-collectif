import { FC, useMemo } from 'react'
import { SideBar as SideBarUI } from '@ui/SideBar'
import LogoCapco from '@ui/LogoCapco/LogoCapco'
import { useRouter } from 'next/router'
import { useIntl } from 'react-intl'
import { Box, CapUIIcon } from '@cap-collectif/ui'
import CookieHelper from '@utils/cookie-helper'
import { useAllFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { getBaseUrlWithAdminNextSupport } from '../../utils/config'
import { useAppContext } from '../AppProvider/App.context'
import { getSideBarItemsFiltered } from './SideBar.utils'
import { useSideBarContext } from '@ui/SideBar/SideBar.context'

interface SideBarProps {}

export const SIDE_BAR_COOKIE = 'SIDE_BAR_OPENED'

export const setSideBarCookie = (fold: boolean): void => {
  CookieHelper.setCookie(SIDE_BAR_COOKIE, fold.toString())
}

const SideBar: FC<SideBarProps> = () => {
  const { pathname } = useRouter()
  const { viewerSession, appVersion } = useAppContext()
  const { fold } = useSideBarContext()
  const intl = useIntl()
  const allFeatureFlags = useAllFeatureFlags()
  const { isAdmin, isSuperAdmin, isAdminOrganization, organization, isOrganizationMember } = viewerSession

  const sideBarItemsFiltered = useMemo(
    () =>
      getSideBarItemsFiltered(
        isAdmin,
        isSuperAdmin,
        allFeatureFlags,
        isAdminOrganization,
        organization,
        isOrganizationMember,
      ),
    [isAdmin, allFeatureFlags],
  )

  return (
    <SideBarUI>
      <SideBarUI.Header>
        <Box as="a" href={getBaseUrlWithAdminNextSupport()} target="_blank">
          <LogoCapco height={6} />
        </Box>
      </SideBarUI.Header>

      {sideBarItemsFiltered.map(sideBarItem =>
        sideBarItem.href ? (
          <SideBarUI.Item
            key={sideBarItem.id}
            id={sideBarItem.id}
            icon={sideBarItem.icon as CapUIIcon}
            href={sideBarItem.href}
            beta={sideBarItem.beta}
            title={intl.formatMessage({ id: sideBarItem.title })}
            onClick={() => {
              setSideBarCookie(false)
              return true
            }}
          />
        ) : (
          <SideBarUI.Menu
            key={sideBarItem.id}
            id={sideBarItem.id}
            icon={sideBarItem.icon as CapUIIcon}
            title={intl.formatMessage({ id: sideBarItem.title })}
          >
            {sideBarItem.items.map((item, idx) => (
              <SideBarUI.Menu.Item
                key={`${sideBarItem.id}-${idx}`}
                href={item.href}
                selected={item.href.includes(pathname)}
              >
                {intl.formatMessage({ id: item.title })}
              </SideBarUI.Menu.Item>
            ))}
          </SideBarUI.Menu>
        ),
      )}

      {fold && (
        <SideBarUI.Version>{`${intl.formatMessage({
          id: 'app-version',
        })} ${appVersion}`}</SideBarUI.Version>
      )}
    </SideBarUI>
  )
}

export default SideBar
