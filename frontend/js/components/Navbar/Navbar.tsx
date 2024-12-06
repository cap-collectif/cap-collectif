import React, { useState, useRef } from 'react'
import { connect } from 'react-redux'
import LanguageHeader from '~/components/Navbar/LanguageHeader'
import type { LocaleMap } from '~ui/Button/SiteLanguageChangeButton'
import type { GlobalState } from '~/types'
import { useEventListener } from '@shared/hooks/useEventListener'
import type { LocaleChoiceTranslation } from '~/components/Navbar/LanguageHeader'
import type { Item } from './Navbar.type'
import Flex from '~ui/Primitives/Layout/Flex'
import NavBarQuery from '@shared/navbar/NavBarQuery'
import NavbarRight from '~/components/Navbar/NavbarRight'
import NavBarMenu from '@shared/navbar/menu/NavBarMenu'
import { useNavBarContext } from '@shared/navbar/NavBar.context'
import ChartModal from '@shared/register/ChartModal'
import PrivacyModal from '@shared/register/PrivacyModal'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

type LanguageProps = {
  currentRouteParams: []
  currentRouteName: string
  preferredLanguage: string
  currentLanguage: string
  readonly localeChoiceTranslations: Array<LocaleChoiceTranslation>
  languageList: Array<LocaleMap>
}
export type Props = LanguageProps & {
  home: string
  logo?: string | null | undefined
  items: Item[]
  siteName: string | null | undefined
  isMultilangueEnabled: boolean
  isAuthenticated: boolean
}

export const Navbar = ({
  home,
  logo,
  items,
  siteName,
  languageList,
  currentLanguage,
  preferredLanguage,
  currentRouteName,
  currentRouteParams,
  localeChoiceTranslations,
  isAuthenticated,
  ...rest
}: Props): JSX.Element => {
  const isMultilangueEnabled = useFeatureFlag('multilangue')
  const [isLocaleHeaderVisible, setLocaleHeaderVisible] = useState<boolean>(true)
  const ref = useRef()
  const { setBreadCrumbItems } = useNavBarContext()

  useEventListener('set-breadcrumb', (e: MessageEvent) => {
    setBreadCrumbItems(e.data)
  })

  return (
    <>
      {isMultilangueEnabled && isLocaleHeaderVisible && preferredLanguage !== currentLanguage ? (
        <LanguageHeader
          innerRef={ref}
          {...rest}
          currentRouteName={currentRouteName}
          currentRouteParams={currentRouteParams}
          onHeaderClose={() => setLocaleHeaderVisible(false)}
          preferredLanguage={preferredLanguage}
          currentLanguage={currentLanguage}
          localeChoiceTranslations={localeChoiceTranslations}
          languageList={languageList}
        />
      ) : null}
      <React.Suspense fallback={null}>
        <React.Suspense fallback={null}>
          <ChartModal />
          <PrivacyModal />
        </React.Suspense>
        <NavBarQuery>
          <Flex alignItems="center" justifyContent="center">
            {isAuthenticated ? (
              <React.Suspense fallback={null}>
                <NavBarMenu currentLanguage={currentLanguage} />
              </React.Suspense>
            ) : (
              <NavbarRight />
            )}
          </Flex>
        </NavBarQuery>
      </React.Suspense>
    </>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: !!state.user.user,
})

export default connect(mapStateToProps)(Navbar)
