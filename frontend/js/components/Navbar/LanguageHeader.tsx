import React from 'react'
import { connect } from 'react-redux'
import type { Dispatch } from '../../types'
import ChangeLanguageOnWebsiteHeader from '~ui/ChangeLanguageOnWebsiteHeader/ChangeLanguageOnWebsiteHeader'
import type { LocaleMap } from '@shared/language/SiteLanguageChangeButton'
import { changeLocaleAction } from '~/redux/modules/user'
import Fetcher from '~/services/Fetcher'
import CookieMonster from '@shared/utils/CookieMonster'
type ReactRef<T> = {
  current: T | null | undefined
}
export type LocaleChoiceTranslation = {
  code: string
  message: string
  label: string
}
type StateProps = {
  readonly localeChoiceTranslations: Array<LocaleChoiceTranslation>
  currentRouteParams: Record<string, any>
  currentRouteName: string
  currentLanguage: string
  preferredLanguage: string
  languageList: Array<LocaleMap>
  innerRef: ReactRef<any>
  onHeaderClose?: () => void
}
type DispatchProps = {
  readonly onLocaleChange?: () => typeof changeLocaleAction
}
type Props = StateProps & DispatchProps

const getLocalePrefix = (localeCode: string): string => localeCode.split(/[-_]/)[0].toLowerCase()

export const getPrefixedPath = (localeCode: string, pathname: string, localeCodes: string[]): string => {
  const prefixes = new Set(localeCodes.map(getLocalePrefix))
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] && prefixes.has(parts[0])) {
    parts.shift()
  }

  const basePath = parts.length ? `/${parts.join('/')}` : '/'
  const prefix = getLocalePrefix(localeCode)

  return basePath === '/' ? `/${prefix}/` : `/${prefix}${basePath}`
}

const LanguageHeader = ({
  innerRef,
  onLocaleChange,
  onHeaderClose,
  currentLanguage,
  preferredLanguage,
  localeChoiceTranslations,
  languageList,
  currentRouteName,
  currentRouteParams,
}: Props) => {
  const navigateWithReload = (targetPath: string): void => {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (targetPath === currentPath) {
      window.location.reload()
      return
    }

    window.location.href = targetPath
  }

  return (
    <ChangeLanguageOnWebsiteHeader
      ref={innerRef}
      localeChoiceTranslations={localeChoiceTranslations}
      onChange={(chosenLanguage: LocaleMap) => {
        Fetcher.postToJson(`/change-locale/${chosenLanguage.code}`, {
          routeName: currentRouteName,
          routeParams: currentRouteParams,
          currentPath: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        })
          .then(response => {
            CookieMonster.setLocale(chosenLanguage.code)
            if (onLocaleChange) {
              onLocaleChange()
            }
            navigateWithReload(response.path)
          })
          .catch(() => {
            CookieMonster.setLocale(chosenLanguage.code)
            const nextPath = getPrefixedPath(
              chosenLanguage.code,
              window.location.pathname,
              languageList.map(language => language.code),
            )
            navigateWithReload(`${nextPath}${window.location.search}${window.location.hash}`)
          })
      }}
      onClose={() => {
        CookieMonster.setLocale(currentLanguage)

        if (typeof onHeaderClose !== 'undefined') {
          onHeaderClose()
        }
      }}
      defaultLanguage={preferredLanguage}
      languageList={languageList}
    />
  )
}

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLocaleChange: () => dispatch(changeLocaleAction()),
})

export default connect(mapStateToProps, mapDispatchToProps)(LanguageHeader)
