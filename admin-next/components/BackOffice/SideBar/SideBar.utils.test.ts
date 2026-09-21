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

})
