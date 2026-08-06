/* eslint-env jest */

import { defaultFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { getSideBarItemsFiltered } from './SideBar.utils'

describe('getSideBarItemsFiltered', () => {
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
