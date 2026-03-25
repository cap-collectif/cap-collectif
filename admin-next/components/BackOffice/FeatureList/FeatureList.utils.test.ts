/* eslint-env jest */

import { defaultFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { getFeatureItemsFiltered } from './FeatureList.utils'

const intl = {
  formatMessage: ({ id }) => id,
} as any

const getVisibleFeatureIds = (viewerSuperAdmin: boolean): string[] =>
  getFeatureItemsFiltered('', intl, { ...defaultFeatureFlags }, viewerSuperAdmin).flatMap(featureItem =>
    featureItem.groups.flatMap(group => Object.keys(group.items)),
  )

describe('FeatureList.utils', () => {
  it('hides new_project_page from non super admins', () => {
    expect(getVisibleFeatureIds(false)).not.toContain('new_project_page')
  })

  it('shows new_project_page to super admins', () => {
    expect(getVisibleFeatureIds(true)).toContain('new_project_page')
  })
})
