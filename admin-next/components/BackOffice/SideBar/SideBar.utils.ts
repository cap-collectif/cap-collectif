import sideBarItems from './SideBarItems.json'
import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql'
import { FeatureFlags } from 'types'

const SONATA_URL_BY_ADMIN_NEXT_URL: Record<string, string> = {
  '/admin-next/videos': '/admin/capco/app/video/list',
}

export const getSideBarItemsFiltered = (
  isAdmin: boolean,
  isSuperAdmin: boolean,
  allFeatureFlags: FeatureFlags,
  isAdminOrganization: boolean,
  organization: string | null,
  isOrganizationMember: boolean,
): typeof sideBarItems => {
  const items = sideBarItems.map(sideBarItem => ({
    ...sideBarItem,
    items: sideBarItem.items.map(item => {
      const sonataUrl = SONATA_URL_BY_ADMIN_NEXT_URL[item.href]

      return sonataUrl && !allFeatureFlags.unstable__sonata_migration_to_admin_next
        ? { ...item, href: sonataUrl }
        : item
    }),
  }))

  return items.reduce<typeof sideBarItems>((acc, sideBarItem) => {
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
        sideBarItem.href = `/admin-next/organization-config/${organization}`
      } else if (isOrganizationMember && !isAdminOrganization) {
        return acc
      }
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
        const isNotificationSettingsHidden =
          subItem.title === 'admin.label.settings.notifications' &&
          allFeatureFlags.emailing &&
          allFeatureFlags.emailing_parameters

        if (
          (isSubItemForAdminOnly || isSubItemForSuperAdminOnly || isSubItemForAll) &&
          hasSubItemsFeatureRequired &&
          !isNotificationSettingsHidden
        )
          return subItem
      })

      acc.push(sideBarItem)
    }
    if (isItemForSuperAdminOnly && hasItemFeatureRequired) {
      // Filtering sub items of a menu here
      sideBarItem.items = sideBarItem.items.filter(subItem => {
        const isSubItemForSuperAdminOnly = (subItem.rolesRequired as string[]).includes('superAdmin') && isSuperAdmin
        const isSubItemForAll = subItem.rolesRequired.length === 0
        const hasSubItemsFeatureRequired = (subItem.featuresRequired as FeatureFlagType[]).every(
          featureRequired => allFeatureFlags[featureRequired],
        )
        const isNotificationSettingsHidden =
          subItem.title === 'admin.label.settings.notifications' &&
          allFeatureFlags.emailing &&
          allFeatureFlags.emailing_parameters

        if (
          (isSubItemForSuperAdminOnly || isSubItemForAll) &&
          hasSubItemsFeatureRequired &&
          !isNotificationSettingsHidden
        )
          return subItem
      })

      acc.push(sideBarItem)
    }

    return acc
  }, [])
}
