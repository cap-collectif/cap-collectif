import React, { useState, useRef } from 'react'
import { useIntl } from 'react-intl'
import { graphql, QueryRenderer } from 'react-relay'
import styled from 'styled-components'
import { connect } from 'react-redux'
import TabsBar from '../Ui/TabsBar/TabsBar'
import NavigationSkip from './NavigationSkip'
import NavbarToggle from './NavbarToggle'
import * as S from './styles'
import LoginModal from '~/components/User/Login/LoginModal'
import RegistrationModal from '~/components/User/Registration/RegistrationModal'
import LanguageHeader from '~/components/Navbar/LanguageHeader'
import type { LocaleMap } from '~ui/Button/SiteLanguageChangeButton'
import type { GlobalState } from '~/types'
import { useBoundingRect } from '~/utils/hooks/useBoundingRect'
import { useEventListener } from '~/utils/hooks/useEventListener'
import type { LocaleChoiceTranslation } from '~/components/Navbar/LanguageHeader'
import environment, { graphqlError } from '~/createRelayEnvironment'
import type { NavbarQueryResponse } from '~relay/NavbarQuery.graphql'
import type { Item } from './Navbar.type'
import Flex from '~ui/Primitives/Layout/Flex'
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
  contentRight: any
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
  contentRight,
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
  const ref = useRef()
  const [rect] = useBoundingRect(ref)

  const setAriaExpanded = () => {
    setExpanded(!expanded)
  }

  const handleResize = () => {
    setDesktop(window.matchMedia('(min-width: 768px)').matches)
  }

  const handleLoading = () => {
    setLogoLoaded(true)
  }

  const renderRegistrationForm = ({
    error,
    props,
  }: ReactRelayReadyState & {
    props: NavbarQueryResponse | null | undefined
  }) => {
    if (error) {
      console.log(error) // eslint-disable-line no-console

      return graphqlError
    }

    // @ts-ignore
    if (props) return <RegistrationModal query={props} locale={currentLanguage} />
    return null
  }

  useEventListener('resize', handleResize)
  return (
    <HeaderContainer isLanguageHeaderVisible={isLocaleHeaderVisible} height={rect.height}>
      <div id="main-navbar" className="navbar-fixed-top">
        <div>
          <React.Fragment>
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
            <div className="container">
              {!isAuthenticated && (
                <>
                  <QueryRenderer
                    environment={environment}
                    query={graphql`
                      query NavbarQuery {
                        ...RegistrationModal_query
                      }
                    `}
                    variables={{}}
                    render={renderRegistrationForm}
                  />
                  {/** @ts-ignore */}
                  <LoginModal />
                </>
              )}

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
                        <img loading="lazy" src={logo} alt={siteName} onLoad={handleLoading} onError={handleLoading} />
                      </a>
                    </S.Brand>
                  )}
                </S.NavigationHeader>
                <NavbarToggle onClick={setAriaExpanded} expanded={expanded} />

                {desktop && (!logo || (logo && logoLoaded)) && (
                  <S.NavigationContentDesktop>
                    {items.length > 0 && <TabsBar items={items} />}

                    <Flex direction="row" pl={4} height="100%" flex="0 0 auto">
                      {contentRight}
                    </Flex>
                  </S.NavigationContentDesktop>
                )}

                {expanded && (
                  <S.NavigationContentMobile>
                    {items.length > 0 && <TabsBar items={items} />}

                    <Flex direction="column" height="100%" flex="0 0 auto" width="100%">
                      {contentRight}
                    </Flex>
                  </S.NavigationContentMobile>
                )}
              </S.NavigationContainer>
            </div>
          </React.Fragment>
        </div>
      </div>
    </HeaderContainer>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  isLocaleHeaderVisible: state.user.showLocaleHeader || true,
  isMultilangueEnabled: state.default.features.multilangue,
  isAuthenticated: !!state.user.user,
})

export default connect<any, any>(mapStateToProps)(Navbar)
