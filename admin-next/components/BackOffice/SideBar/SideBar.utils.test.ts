/* eslint-env jest */

import { defaultFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { getSideBarItemsFiltered } from './SideBar.utils'

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
 */
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

  it('switches the legal settings route with the migration flag', () => {
    const getLegalSettingsItem = (featureFlags = defaultFeatureFlags) =>
      getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
        .find(item => item.id === 'pages')
        ?.items.find(item => item.title === 'admin.label.pages.legal')

    expect(getLegalSettingsItem()?.href).toBe('/admin/settings/pages.legal/list')
    expect(getLegalSettingsItem({ ...defaultFeatureFlags, unstable__sonata_migration_to_admin_next: true })?.href).toBe(
      '/admin-next/legal-settings',
    )
  })

  const getPrivacySettingsItem = (featureFlags = { ...defaultFeatureFlags, privacy_policy: true }) => {
    const sideBarItems = getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
    return sideBarItems
      .find(item => item.id === 'pages')
      ?.items.find(item => item.title === 'admin.label.pages.privacy')
  }

  it('keeps the Sonata privacy settings route while the migration is disabled', () => {
    expect(getPrivacySettingsItem()?.href).toBe('/admin/settings/pages.privacy/list')
  })

  it('uses the Admin Next privacy settings route while the migration is enabled', () => {
    expect(
      getPrivacySettingsItem({
        ...defaultFeatureFlags,
        privacy_policy: true,
        unstable__sonata_migration_to_admin_next: true,
      })?.href,
    ).toBe('/admin-next/privacy-settings')
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
