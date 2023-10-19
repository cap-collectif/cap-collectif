import React from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import type { FooterLink, Legals } from './Footer'
import './Footer'
import SiteLanguageChangeButton from '../Ui/Button/SiteLanguageChangeButton'
import CapcoPowered from './CapcoPowered'
import FooterLinksRender from './FooterLinksRender'
import type { LocaleMap } from '../Ui/Button/SiteLanguageChangeButton'
import Fetcher from '~/services/Fetcher'
import CookieMonster from '~/CookieMonster'

type Props = {
  currentRouteParams: {}
  currentRouteName: string
  defaultLocale: string
  languageList: Array<LocaleMap>
  links?: Array<FooterLink>
  legals: Legals
  cookiesText: string
  textColor: string
  backgroundColor: string
  multilingual: boolean
  cookiesPath: string
  privacyPath: string
  legalPath: string
}
const Links = styled.div<{
  backgroundColor: string
  textColor: string
}>`
  margin-right: auto;
  margin-left: auto;
  padding: 30px 60px;
  background-color: ${props => props.backgroundColor};
  color: ${props => props.textColor};

  .btn-link {
    color: ${props => props.textColor};
    font-size: 16px;
    margin-top: -4px;
    :hover {
      color: ${props => props.textColor};
    }
  }

  .dropdown-toggle {
    padding: 0;
  }

  @media (max-width: 991px) {
    padding: 30px;
  }

  @media (max-width: 767px) {
    padding: 15px;
    .dropup {
      margin: auto;
      margin-top: 15px;
    }
  }
`
const FlexContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  @media (max-width: 767px) {
    flex-direction: column;
  }

  max-width: 960px;
  margin: auto;
`
const SectionSeparator: StyledComponent<any, {}, HTMLHRElement> = styled.hr`
  border-color: #999;
  margin-top: 25px;
  margin-bottom: 25px;
  @media (max-width: 767px) {
    margin-top: 15px;
    margin-bottom: 15px;
  }

  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
`
export const LinkList: StyledComponent<any, {}, HTMLUListElement> = styled.ul`
  width: 100%;
  text-align: left;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  a {
    color: inherit;
  }
  @media (max-width: 767px) {
    text-align: center;
    flex-direction: column;
    li {
      padding-bottom: 5px;
    }
  }
`

const FooterLinks = ({
  currentRouteParams,
  currentRouteName,
  defaultLocale,
  languageList,
  links,
  legals,
  cookiesText,
  textColor,
  backgroundColor,
  multilingual,
  cookiesPath,
  privacyPath,
  legalPath,
}: Props) => (
  <Links backgroundColor={backgroundColor} textColor={textColor} id="footer-links">
    <FlexContainer>
      {links && (
        <FooterLinksRender
          links={links}
          legals={legals}
          cookiesText={cookiesText}
          cookiesPath={cookiesPath}
          privacyPath={privacyPath}
          legalPath={legalPath} // TODO Deactivate left when multilangue feature enabled & completed
          left={false}
        />
      )}
      {multilingual && (
        <SiteLanguageChangeButton
          languageList={languageList}
          defaultLanguage={defaultLocale}
          onChange={(currentLanguage: LocaleMap) => {
            Fetcher.postToJson(`/change-locale/${currentLanguage.code}`, {
              routeName: currentRouteName,
              routeParams: currentRouteParams,
            }).then(response => {
              CookieMonster.setLocale(currentLanguage.code)
              window.location.href = response.path
            })
          }}
          backgroundColor={`${backgroundColor} !important`}
          textColor={textColor}
          borderless
        />
      )}
    </FlexContainer>
    <SectionSeparator />
    <FlexContainer>
      {/** @ts-ignore */}
      <CapcoPowered textColor={textColor} />
    </FlexContainer>
  </Links>
)

export default FooterLinks
