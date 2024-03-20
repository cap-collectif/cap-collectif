import sideBarItems from './SideBarItems.json'
import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql'
import { FeatureFlags } from '../../types'

export const getSideBarItemsFiltered = (
  isAdmin: boolean,
  isSuperAdmin: boolean,
  allFeatureFlags: FeatureFlags,
  isAdminOrganization: boolean,
  organization: string | null,
  isOrganizationMember: boolean,
): typeof sideBarItems => {
  return sideBarItems.reduce<typeof sideBarItems>((acc, sideBarItem) => {
    const isItemForAdminOnly = (sideBarItem.rolesRequired as string[]).includes('admin') && isAdmin
    const isItemForSuperAdminOnly = (sideBarItem.rolesRequired as string[]).includes('superAdmin') && isSuperAdmin
    const isItemForAll = sideBarItem.rolesRequired.length === 0
    const hasItemFeatureRequired = (sideBarItem.featuresRequired as FeatureFlagType[]).every(
      featureRequired => allFeatureFlags[featureRequired],
    )
    // Organization Redirect
    if (sideBarItem.id === 'organizations') {
      if (!isAdmin && !isOrganizationMember) {
        return acc
      }
      if (isAdminOrganization) {
        sideBarItem.href = `/admin-next/organizationConfig/${organization}`
      } else if (isOrganizationMember && !isAdminOrganization) {
        return acc
      }
    }

    // this is temporary
    if (sideBarItem.id === 'analytics' && isOrganizationMember) {
      return acc
    }

    if ((isItemForAdminOnly || isItemForAll) && hasItemFeatureRequired) {
      // Filtering sub items of a menu here
      sideBarItem.items = sideBarItem.items.filter(subItem => {
        const isSubItemForAdminOnly = (subItem.rolesRequired as string[]).includes('admin') && isAdmin
        const isSubItemForSuperAdminOnly = (subItem.rolesRequired as string[]).includes('superAdmin') && isSuperAdmin
        const isSubItemForAll = subItem.rolesRequired.length === 0
        const hasSubItemsFeatureRequired = (subItem.featuresRequired as FeatureFlagType[]).every(
          featureRequired => allFeatureFlags[featureRequired],
        )

        if (isSubItemForAdminOnly || isSubItemForSuperAdminOnly || (isSubItemForAll && hasSubItemsFeatureRequired))
          return subItem
      })

      acc.push(sideBarItem)
    }
    if (isItemForSuperAdminOnly && hasItemFeatureRequired) {
      // Filtering sub items of a menu here
      sideBarItem.items = sideBarItem.items.filter(subItem => {
        const isSubItemForSuperAdminOnly = (subItem.rolesRequired as string[]).includes('admin') && isAdmin
        const isSubItemForAll = subItem.rolesRequired.length === 0
        const hasSubItemsFeatureRequired = (subItem.featuresRequired as FeatureFlagType[]).every(
          featureRequired => allFeatureFlags[featureRequired],
        )

        if (isSubItemForSuperAdminOnly || (isSubItemForAll && hasSubItemsFeatureRequired)) return subItem
      })

      acc.push(sideBarItem)
    }

    return acc
  }, [])
}
