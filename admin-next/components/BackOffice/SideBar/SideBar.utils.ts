import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql'
import { FeatureFlags } from 'types'
import sideBarItems from './SideBarItems.json'

const SONATA_URL_BY_ADMIN_NEXT_URL: Record<string, string> = {
  '/admin-next/themes': '/admin/capco/app/theme/list',
  '/admin-next/custom-pages': '/admin/capco/app/page/list',
  '/admin-next/emailing-campaigns': '/admin/mailingCampaign/list',
  '/admin-next/mailing-lists': '/admin/mailingList/list',
  '/admin-next/favicon': '/admin/favicon/list',
}

// An exact match: `includes` would also select "/admin-next/user-types" on the "/admin-next/user" page
export const isSideBarSubItemSelected = (item: { href: string; relatedHrefs?: string[] }, pathname: string): boolean =>
  item.href === pathname || (item.relatedHrefs ?? []).includes(pathname)

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
