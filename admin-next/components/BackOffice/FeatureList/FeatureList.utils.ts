import featureItems from './FeatureItems.json'
import type { IntlShape } from 'react-intl'
import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql'
import { FeatureFlags } from 'types'

export type Item = {
  title: string
  description: string
  onlySuperAdmin: boolean
  dependOf?: FeatureFlagType[]
}

export type Items = {
  [key in FeatureFlagType]?: Item
}

type Group = {
  title: string
  description: string
  onlySuperAdmin: boolean
  featuresRequired?: FeatureFlagType[]
  items: Items
}

type FeatureItem = {
  id: string
  title: string
  groups: Group[]
}

export const getFeatureItemsFiltered = (
  term: string,
  intl: IntlShape,
  allFeatureFlags: FeatureFlags,
  viewerSuperAdmin: boolean,
): FeatureItem[] => {
  const featureItemsTyped = featureItems as unknown as FeatureItem[]

  return featureItemsTyped
    .map(featureItem => {
      const groups = featureItem.groups
        .map(group => {
          const itemsAsArray = Object.entries(group.items) as [keyof Items, Item][]
          const items = itemsAsArray.reduce<Items>((acc, [name, data]) => {
            const containTerm =
              term && intl.formatMessage({ id: data.title }).toLowerCase().includes(term.toLowerCase())

            const hasDependenciesEnabled = data.dependOf
              ? data.dependOf.every(featureFlagDependency => allFeatureFlags[featureFlagDependency])
              : true
            const hasRoleRequired = data.onlySuperAdmin ? viewerSuperAdmin : true

            if ((containTerm || !term) && hasDependenciesEnabled && hasRoleRequired) {
              acc[name] = data
            }

            return acc
          }, {})

          return {
            ...group,
            items,
          }
        })
        .filter(group => {
          const hasRoleRequired = group.onlySuperAdmin ? viewerSuperAdmin : true
          const groupHasDependenciesEnabled = group.featuresRequired
            ? group.featuresRequired.every(featureFlagDependency => allFeatureFlags[featureFlagDependency])
            : true
          if (Object.keys(group.items).length > 0 && hasRoleRequired && groupHasDependenciesEnabled) return group
        })

      return {
        ...featureItem,
        groups,
      }
    })
    .filter(featureItem => featureItem.groups.length > 0)
}
