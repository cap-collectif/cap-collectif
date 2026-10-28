/* eslint-env jest */

import { defaultFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { getSideBarItemsFiltered, isSideBarSubItemSelected } from './SideBar.utils'

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

  it('uses the Admin Next login settings route', () => {
    expect(getLoginSettingsItem()?.href).toBe('/admin-next/login-settings')
  })

  const getCookieSettingsItem = (featureFlags = defaultFeatureFlags) => {
    const sideBarItems = getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
    return sideBarItems
      .find(item => item.id === 'pages')
      ?.items.find(item => item.title === 'admin.label.pages.cookies')
  }

  it('uses the Admin Next cookies settings route', () => {
    expect(getCookieSettingsItem()?.href).toBe('/admin-next/cookie-settings')
  })

  const getPrivacySettingsItem = (featureFlags = { ...defaultFeatureFlags, privacy_policy: true }) => {
    const sideBarItems = getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
    return sideBarItems
      .find(item => item.id === 'pages')
      ?.items.find(item => item.title === 'admin.label.pages.privacy')
  }

  it('uses the Admin Next privacy settings route', () => {
    expect(getPrivacySettingsItem()?.href).toBe('/admin-next/privacy-settings')
  })

  const getThemesItem = (featureFlags = defaultFeatureFlags) => {
    const sideBarItems = getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
    return sideBarItems.find(item => item.id === 'content')?.items.find(item => item.title === 'admin.label.theme')
  }

  it('keeps the Sonata themes route while the migration is disabled', () => {
    expect(getThemesItem()?.href).toBe('/admin/capco/app/theme/list')
  })

  it('uses the Admin Next themes route while the migration is enabled', () => {
    expect(getThemesItem({ ...defaultFeatureFlags, unstable__sonata_migration_to_admin_next: true })?.href).toBe(
      '/admin-next/themes',
    )
  })

  it('switches the custom pages route with the migration flag', () => {
    const getCustomPagesItem = (featureFlags = defaultFeatureFlags) =>
      getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
        .find(item => item.id === 'content')
        ?.items.find(item => item.title === 'admin.label.page')

    expect(getCustomPagesItem()?.href).toBe('/admin/capco/app/page/list')
    expect(getCustomPagesItem({ ...defaultFeatureFlags, unstable__sonata_migration_to_admin_next: true })?.href).toBe(
      '/admin-next/custom-pages',
    )
  })

  const getEmailingItem = (title: string, featureFlags = { ...defaultFeatureFlags, emailing: true }) => {
    const sideBarItems = getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
    return sideBarItems.find(item => item.id === 'emailing')?.items.find(item => item.title === title)
  }

  it('keeps the Sonata emailing routes while the migration is disabled', () => {
    expect(getEmailingItem('admin-menu-campaign-list')?.href).toBe('/admin/mailingCampaign/list')
    expect(getEmailingItem('admin-menu-emailing-list')?.href).toBe('/admin/mailingList/list')
  })

  it('uses the Admin Next emailing routes while the migration is enabled', () => {
    const featureFlags = { ...defaultFeatureFlags, emailing: true, unstable__sonata_migration_to_admin_next: true }

    expect(getEmailingItem('admin-menu-campaign-list', featureFlags)?.href).toBe('/admin-next/emailing-campaigns')
    expect(getEmailingItem('admin-menu-emailing-list', featureFlags)?.href).toBe('/admin-next/mailing-lists')
  })

  it('switches the favicon route with the migration flag', () => {
    const getFaviconItem = (featureFlags = defaultFeatureFlags) =>
      getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
        .find(item => item.id === 'settings')
        ?.items.find(item => item.title === 'website-icon')

    expect(getFaviconItem()?.href).toBe('/admin/favicon/list')
    expect(getFaviconItem({ ...defaultFeatureFlags, unstable__sonata_migration_to_admin_next: true })?.href).toBe(
      '/admin-next/favicon',
    )
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

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result using explicit local inputs and expected values.
 */
describe('isSideBarSubItemSelected', () => {
  const userTypes = { href: '/admin-next/user-types' }
  const userList = { href: '/admin/capco/user/user/list', relatedHrefs: ['/admin-next/user'] }

  it('selects an item on its own page', () => {
    expect(isSideBarSubItemSelected(userTypes, '/admin-next/user-types')).toBe(true)
  })

  it('selects an item on one of its related pages', () => {
    expect(isSideBarSubItemSelected(userList, '/admin-next/user')).toBe(true)
  })

  it('does not select an item whose href only starts with the current page', () => {
    expect(isSideBarSubItemSelected(userTypes, '/admin-next/user')).toBe(false)
  })
})
