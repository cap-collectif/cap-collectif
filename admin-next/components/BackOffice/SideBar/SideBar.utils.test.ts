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

  it('keeps the Sonata notification settings route while the migration is disabled', () => {
    expect(getNotificationSettingsItem()?.href).toBe('/admin/settings/settings.notifications/list')
  })

  it('uses the Admin Next notification settings route while the migration is enabled', () => {
    expect(
      getNotificationSettingsItem({ ...defaultFeatureFlags, unstable__sonata_migration_to_admin_next: true })?.href,
    ).toBe('/admin-next/notification-settings')
  })

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
})
