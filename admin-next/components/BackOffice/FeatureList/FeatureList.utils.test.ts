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

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
 */
describe('FeatureList.utils', () => {
  it.each([false, true])(
    'keeps the shield-specific restriction out of the feature list (superAdmin=%s)',
    superAdmin => {
      expect(getVisibleFeatureIds(superAdmin)).not.toContain('shield_authorized_users_only')
    },
  )

  it('hides new_project_page from non super admins', () => {
    expect(getVisibleFeatureIds(false)).not.toContain('new_project_page')
  })

  it('shows new_project_page to super admins', () => {
    expect(getVisibleFeatureIds(true)).toContain('new_project_page')
  })
})
