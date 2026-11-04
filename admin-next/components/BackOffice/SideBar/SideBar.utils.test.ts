/* eslint-env jest */

import { defaultFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { getSideBarItemsFiltered, isSideBarSubItemSelected } from './SideBar.utils'

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
 */
describe('getSideBarItemsFiltered', () => {
  it.each([
    [false, '/admin/font/list'],
    [true, '/admin-next/fonts'],
  ] as const)('uses the fonts route for rollout %s', (enabled, href) => {
    const flags = { ...defaultFeatureFlags, unstable__sonata_migration_to_admin_next: enabled }
    const items = getSideBarItemsFiltered(true, false, flags, false, null, false)
    expect(
      items.find(group => group.id === 'settings')?.items.find(item => item.title === 'global-typeface')?.href,
    ).toBe(href)
  })

  it.each([
    [false, '/admin/reporting'],
    [true, '/admin-next/reporting'],
  ] as const)('uses the reporting route for rollout %s', (enabled, href) => {
    const flags = { ...defaultFeatureFlags, reporting: true, unstable__sonata_migration_to_admin_next: enabled }
    const items = getSideBarItemsFiltered(true, false, flags, false, null, false)
    expect(
      items.find(group => group.id === 'contributions')?.items.find(item => item.title === 'admin.label.reporting')
        ?.href,
    ).toBe(href)
  })

  const getNotificationSettingsItem = (featureFlags = defaultFeatureFlags) => {
    const sideBarItems = getSideBarItemsFiltered(true, true, featureFlags, false, null, false)
    return sideBarItems
      .find(item => item.id === 'settings')
      ?.items.find(item => item.title === 'admin.label.settings.notifications')
  }

  it('keeps the historical notification settings visibility condition', () => {
    expect(
      getNotificationSettingsItem({ ...defaultFeatureFlags, emailing: true, emailing_parameters: true }),
    ).toBeUndefined()
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

  it.each([
    [false, '/admin/locale/list'],
    [true, '/admin-next/locales'],
  ] as const)('uses the locales route for rollout %s', (enabled, href) => {
    const flags = { ...defaultFeatureFlags, multilangue: true, unstable__sonata_migration_to_admin_next: enabled }
    const items = getSideBarItemsFiltered(true, false, flags, false, null, false)
    expect(
      items.find(group => group.id === 'settings')?.items.find(item => item.title === 'global-languages')?.href,
    ).toBe(href)
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
