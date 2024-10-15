import React, { useState, useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { connect } from 'react-redux'
import TabsBar from '../Ui/TabsBar/TabsBar'
import NavigationSkip from './NavigationSkip'
import NavbarToggle from './NavbarToggle'
import * as S from './styles'
import LanguageHeader from '~/components/Navbar/LanguageHeader'
import type { LocaleMap } from '~ui/Button/SiteLanguageChangeButton'
import type { GlobalState } from '~/types'
import { useBoundingRect } from '~/utils/hooks/useBoundingRect'
import { useEventListener } from '@shared/hooks/useEventListener'
import type { LocaleChoiceTranslation } from '~/components/Navbar/LanguageHeader'
import type { Item } from './Navbar.type'
import Flex from '~ui/Primitives/Layout/Flex'
import NavBarQuery from '@shared/navbar/NavBarQuery'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import NavbarRight from '~/components/Navbar/NavbarRight'
import NavBarMenu from '@shared/navbar/menu/NavBarMenu'
import { useNavBarContext } from '@shared/navbar/NavBar.context'
import ChartModal from '@shared/register/ChartModal'
import PrivacyModal from '@shared/register/PrivacyModal'

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
const HeaderContainer = styled('div')<{
  isLanguageHeaderVisible: boolean
  height: number
}>`
  margin-bottom: ${props => (props.isLanguageHeaderVisible ? `${props.height}px` : '0')};
`
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
  isMultilangueEnabled,
  localeChoiceTranslations,
  isAuthenticated,
  ...rest
}: Props): JSX.Element => {
  const intl = useIntl()
  const [expanded, setExpanded] = useState<boolean>(false)
  const [desktop, setDesktop] = useState<boolean>(true)
  const [logoLoaded, setLogoLoaded] = useState<boolean>(false)
  const [isLocaleHeaderVisible, setLocaleHeaderVisible] = useState<boolean>(true)
  const newNavbar = useFeatureFlag('new_navbar')
  const ref = useRef()
  const [rect] = useBoundingRect(ref)
  const { setBreadCrumbItems } = useNavBarContext()

  const setAriaExpanded = () => {
    setExpanded(!expanded)
  }

  const handleResize = () => {
    setDesktop(window.matchMedia('(min-width: 768px)').matches)
  }

  const handleLoading = () => {
    setLogoLoaded(true)
  }

  useEventListener('resize', handleResize)

  useEventListener('set-breadcrumb', (e: MessageEvent) => {
    setBreadCrumbItems(e.data)
  })

  useEffect(() => {
    if (!newNavbar) {
      document.querySelector('body')?.classList.add('old-navbar')
    }
  }, [newNavbar])

  return (
    <>
      {isMultilangueEnabled && setLocaleHeaderVisible && preferredLanguage !== currentLanguage ? (
        <LanguageHeader
          innerRef={ref}
          {...rest}
          currentRouteName={currentRouteName}
          currentRouteParams={currentRouteParams}
          onHeaderClose={() => {
            setLocaleHeaderVisible(false)
          }}
          preferredLanguage={preferredLanguage}
          currentLanguage={currentLanguage}
          localeChoiceTranslations={localeChoiceTranslations}
          languageList={languageList}
        />
      ) : null}
      {newNavbar ? (
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
                <NavbarRight currentLanguage={currentLanguage} newHeader />
              )}
            </Flex>
          </NavBarQuery>
        </React.Suspense>
      ) : (
        <HeaderContainer isLanguageHeaderVisible={isLocaleHeaderVisible} height={rect.height}>
          <div id="main-navbar" className="navbar-fixed-top">
            <div>
              <React.Fragment>
                <div className="container">
                  <NavigationSkip />
                  <S.NavigationContainer id="main-navbar" role="navigation">
                    <S.NavigationHeader>
                      {logo && (
                        <S.Brand id="brand">
                          <a
                            href={home}
                            title={intl.formatMessage({
                              id: 'navbar.homepage',
                            })}
                          >
                            <img
                              loading="lazy"
                              src={logo}
                              alt={siteName}
                              onLoad={handleLoading}
                              onError={handleLoading}
                            />
                          </a>
                        </S.Brand>
                      )}
                    </S.NavigationHeader>
                    <NavbarToggle onClick={setAriaExpanded} expanded={expanded} />

                    {desktop && (!logo || (logo && logoLoaded)) && (
                      <S.NavigationContentDesktop>
                        {items.length > 0 && <TabsBar items={items} />}

                        <Flex direction="row" pl={4} height="100%" flex="0 0 auto">
                          <React.Suspense>
                            <ChartModal />
                            <PrivacyModal />
                          </React.Suspense>
                          <NavbarRight currentLanguage={currentLanguage} />
                        </Flex>
                      </S.NavigationContentDesktop>
                    )}

                    <S.NavigationContentMobile style={!expanded ? { maxHeight: 0, overflow: 'hidden' } : undefined}>
                      {items.length > 0 && <TabsBar items={items} />}

                      <Flex direction="column" height="100%" flex="0 0 auto" width="100%">
                        <React.Suspense>
                          <ChartModal />
                          <PrivacyModal />
                        </React.Suspense>
                        <NavbarRight currentLanguage={currentLanguage} />
                      </Flex>
                    </S.NavigationContentMobile>
                  </S.NavigationContainer>
                </div>
              </React.Fragment>
            </div>
          </div>
        </HeaderContainer>
      )}
    </>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  isLocaleHeaderVisible: state.user.showLocaleHeader || true,
  isMultilangueEnabled: state.default.features.multilangue,
  isAuthenticated: !!state.user.user,
})

export default connect(mapStateToProps)(Navbar)
