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
}: Props) => (
  <ChangeLanguageOnWebsiteHeader
    ref={innerRef}
    localeChoiceTranslations={localeChoiceTranslations}
    onChange={(chosenLanguage: LocaleMap) => {
      Fetcher.postToJson(`/change-locale/${chosenLanguage.code}`, {
        routeName: currentRouteName,
        routeParams: currentRouteParams,
      }).then(response => {
        CookieMonster.setLocale(chosenLanguage.code)
        onLocaleChange()
        window.location.href = response.path
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

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLocaleChange: () => dispatch(changeLocaleAction()),
})

export default connect(mapStateToProps, mapDispatchToProps)(LanguageHeader)
