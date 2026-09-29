import { CustomCodeVersioningPageQuery } from '@relay/CustomCodeVersioningPageQuery.graphql'
import { CommitForm, CustomCodeItem, CustomCodePayload, Version } from './customCodeVersioning.types'

const CUSTOM_CODE_AUTHOR_STORAGE_KEY = 'admin-next.custom-code.author-name'
export const DEFAULT_SELECTED_KEYNAME = 'global.site.embed_js'
export const HISTORY_PAGE_SIZE = 5

export const EMPTY_COMMIT_FORM: CommitForm = { title: '', authorName: '', description: '', referenceUrl: '' }

export const getLineCount = (value: string): number => (value ? value.split(/\r\n|\r|\n/).length : 0)

export const capitalizeAuthorName = (authorName: string): string =>
  authorName
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(^|[\s'-])([A-Za-zÀ-ÖØ-öø-ÿ])/g, (_match, separator: string, letter: string) => {
      return `${separator}${letter.toLocaleUpperCase('fr-FR')}`
    })

export const getStoredAuthorName = (): string => {
  if (typeof window === 'undefined') return ''

  return capitalizeAuthorName(window.localStorage.getItem(CUSTOM_CODE_AUTHOR_STORAGE_KEY) ?? '')
}

export const storeAuthorName = (authorName: string): void => {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(CUSTOM_CODE_AUTHOR_STORAGE_KEY, authorName)
}

export const getErrorMessageKey = (errorCode?: string | null): string => {
  switch (errorCode) {
    case 'INVALID_KEYNAME':
      return 'admin.custom-code.error.invalid-keyname'
    case 'INVALID_CONTENT':
      return 'admin.custom-code.error.invalid-content'
    case 'INVALID_METADATA':
      return 'admin.custom-code.error.invalid-metadata'
    case 'INVALID_REFERENCE_URL':
      return 'admin.custom-code.error.invalid-reference-url'
    case 'NO_CHANGES':
      return 'admin.custom-code.error.no-changes'
    case 'CONFLICT':
      return 'admin.custom-code.error.conflict'
    case 'VERSION_NOT_FOUND':
      return 'admin.custom-code.error.version-not-found'
    default:
      return 'admin.custom-code.error.generic'
  }
}

export const getErrorMessage = getErrorMessageKey

const getConnectionVersions = (
  versionsConnection: CustomCodeItem['versionsConnection'] | CustomCodePayload['versionsConnection'],
): Version[] =>
  versionsConnection.edges?.map(edge => edge?.node).filter((version): version is Version => !!version) ?? []

const normalizeCustomCodeItem = (
  customCode: CustomCodeVersioningPageQuery['response']['customCodeConfiguration'][number] | CustomCodePayload,
): CustomCodeItem => {
  const value = customCode.activeContent ?? ''
  const normalizedValue = value.trim()

  return {
    ...customCode,
    value,
    hasCode: normalizedValue.length > 0,
    lineCount: getLineCount(value),
    characterCount: value.length,
    versions: getConnectionVersions(customCode.versionsConnection),
    hasMoreVersions: customCode.versionsConnection.pageInfo.hasNextPage,
    versionsCount: customCode.versionsConnection.totalCount,
  }
}

export const buildCustomCodeItems = (data: CustomCodeVersioningPageQuery['response']): CustomCodeItem[] =>
  data.customCodeConfiguration.map(normalizeCustomCodeItem)

export const getSelectedCustomCodeItem = (
  items: readonly CustomCodeItem[],
  selectedKeyname: string,
): CustomCodeItem | null => items.find(item => item.keyname === selectedKeyname) ?? items[0] ?? null

export const getPreviousVersion = (versions: readonly Version[], version: Version): Version | null => {
  const versionIndex = versions.findIndex(currentVersion => currentVersion.id === version.id)

  if (versionIndex < 0) return null

  return versions[versionIndex + 1] ?? null
}

export const getRestoreFormDefaults = (version: Version, authorName: string): CommitForm => ({
  title: `Restore: ${version.title}`,
  authorName,
  description: version.description ?? '',
  referenceUrl: version.referenceUrl ?? '',
})
