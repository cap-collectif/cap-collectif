/* eslint-env jest */

import { defaultFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { getSideBarItemsFiltered } from './SideBar.utils'

describe('getSideBarItemsFiltered', () => {
  const getNotificationSettingsItem = (featureFlags = defaultFeatureFlags) => {
    const sideBarItems = getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
    return sideBarItems
      .find(item => item.id === 'settings')
      ?.items.find(item => item.title === 'admin.label.settings.notifications')
  }

  it('uses the Admin Next notification settings route', () => {
    expect(getNotificationSettingsItem()?.href).toBe('/admin-next/notification-settings')
  })

  it('keeps the historical notification settings visibility condition', () => {
    expect(
      getNotificationSettingsItem({ ...defaultFeatureFlags, emailing: true, emailing_parameters: true }),
    ).toBeUndefined()
  })

  const getLoginSettingsItem = (featureFlags = defaultFeatureFlags) => {
    const sideBarItems = getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
    return sideBarItems.find(item => item.id === 'pages')?.items.find(item => item.title === 'admin.label.pages.login')
  }

  it('keeps the Sonata login settings route while the migration is disabled', () => {
    expect(getLoginSettingsItem()?.href).toBe('/admin/settings/pages.login/list')
  })

  it('uses the Admin Next login settings route while the migration is enabled', () => {
    expect(getLoginSettingsItem({ ...defaultFeatureFlags, unstable__sonata_migration_to_admin_next: true })?.href).toBe(
      '/admin-next/login-settings',
    )
  })

  const getCookieSettingsItem = (featureFlags = defaultFeatureFlags) => {
    const sideBarItems = getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
    return sideBarItems
      .find(item => item.id === 'pages')
      ?.items.find(item => item.title === 'admin.label.pages.cookies')
  }

  it('keeps the Sonata cookies settings route while the migration is disabled', () => {
    expect(getCookieSettingsItem()?.href).toBe('/admin/settings/pages.cookies/list')
  })

  it('uses the Admin Next cookies settings route while the migration is enabled', () => {
    expect(
      getCookieSettingsItem({ ...defaultFeatureFlags, unstable__sonata_migration_to_admin_next: true })?.href,
    ).toBe('/admin-next/cookie-settings')
  })

  it('hides the Hub API Green item when its feature flag is disabled', () => {
    const sideBarItems = getSideBarItemsFiltered(
      true,
      true,
      { ...defaultFeatureFlags, hub_api_green: false },
      false,
      null,
      false,
    )

    const settings = sideBarItems.find(item => item.id === 'settings')

    expect(settings?.items.some(item => item.href === '/admin-next/hub-api-green')).toBe(false)
  })
})
