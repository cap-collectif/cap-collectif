import * as React from 'react'
import ReactDOM from 'react-dom'
import Providers from '../utils/providers'
import { RelayEnvironmentProvider } from 'react-relay'
import type { FeatureFlags } from '../types'
import { intlMock, features as mockFeatures } from './mocks'
import GlobalCSS from 'styles/GlobalCSS'
import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql'
import { ReactPortal } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { TranslationLocale } from '@relay/layoutQuery.graphql'
import { legacyCookieClient } from '@shared/utils/universalCookies'
import CookieManager from '@components/FrontOffice/Cookies/CookieManager'

export const mockRandomValues = () => {
  global.Math.random = () => 0.5
}

export const enableFeatureFlags = (flags: [FeatureFlagType]) => {
  global.mockFeatureFlag.mockImplementation((flag: FeatureFlagType) => {
    return flags.includes(flag as FeatureFlagType)
  })
}

export const disableFeatureFlags = () => {
  global.mockFeatureFlag.mockImplementation(() => false)
}

export const mockUrl = (url: string) => {
  delete window.location
  // @ts-ignore fixme
  window.location = new URL(url)
}

export const addsSupportForPortals = () => {
  ReactDOM.createPortal = jest.fn(element => {
    return element as ReactPortal
  })
}

export const clearSupportForPortals = () => {
  // @ts-ignore fixme
  ReactDOM.createPortal.mockClear()
}

type Props = {
  children: React.ReactNode
  viewerSession?: null | undefined | any
  features?: FeatureFlags
}

export const MockProviders = ({ children, viewerSession, features }: Props) => {
  return (
    <Providers
      featureFlags={{ ...mockFeatures, ...features }}
      intl={intlMock}
      viewerSession={viewerSession}
      appVersion="test"
      siteColors={mockedGlobalTheme}
    >
      <GlobalCSS />
      {children}
    </Providers>
  )
}

type RelaySuspensFragmentTestProps = { environment: any } & Props

export const RelaySuspensFragmentTest = ({ children, environment, features }: RelaySuspensFragmentTestProps) => {
  return (
    <MockProviders features={features}>
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="">{children}</React.Suspense>
      </RelayEnvironmentProvider>
    </MockProviders>
  )
}

export const FormWrapper = props => {
  const formMethods = useForm()

  return <FormProvider {...formMethods}>{props.children}</FormProvider>
}

export const mockedGlobalTheme = {
  textColor: 'color.main_menu.text',
  menuBackground: 'color.main_menu.bg',
  subMenuBackground: 'color.sub.menu.background',
  menuActiveBackground: 'color.main_menu.bg_active',
  textActiveColor: 'color.main_menu.text_active',
  textHoverColor: 'color.main_menu.text_hover',
  primaryColor: 'color.btn.primary.bg',
  primaryTransparentColor: 'color.btn.ghost.base',
  primaryHoverColor: 'color.btn.ghost.hover',
  primaryLabel: 'color.btn.primary.text',
  pageTitleColor: 'color.header.title',
  pageSubTitleColor: 'color.header.text',
  pageBackgroundHeaderColor: 'color.header.bg',
  sectionBackground: 'color.section.bg',
  sectionTextColor: 'color.body.text',
  bodyColor: 'color.body.text',
  h1Color: 'color.h1',
  h2Color: 'color.h2',
  h3Color: 'color.h3',
  h4Color: 'color.h4',
  h5Color: 'color.h5',
  footerTextColor: 'color.footer.text',
  footerTitleColor: 'color.footer.title',
  footerBackgroundColor: 'color.footer.bg',
  footerLinksColor: 'color.footer2.text',
  footerBottomBackgroundColor: 'color.footer2.bg',
  linkColor: 'color.link',
  linkHoverColor: 'color.link.hover',
}

export const mockedSSRData = {
  shieldImage: { media: { url: 'shield.jpg' } },
  favicon: { media: { url: 'favicon.ico' } },
  ads: { value: '<script>ads</script>' },
  analytics: { value: '<script>analytics</script>' },
  cookiesList: { value: 'blablablabla cookies' },
  customCode: { value: '<style>.flex { display: flex; }</style>' },
  shieldIntroduction: { value: 'Réservé aux inscrits' },
  locales: [
    {
      code: 'FR_FR' as TranslationLocale,
      isDefault: true,
      isEnabled: true,
      isPublished: true,
      traductionKey: 'locale.fr',
    },
    {
      code: 'EN_GB' as TranslationLocale,
      isDefault: false,
      isEnabled: true,
      isPublished: true,
      traductionKey: 'locale.en',
    },
  ],
  fonts: [
    {
      name: 'OpenSans',
      useAsBody: true,
      useAsHeading: false,
      isCustom: false,
      file: { url: null },
    },
    {
      name: 'IDF-font',
      useAsBody: false,
      useAsHeading: true,
      isCustom: true,
      file: { url: '/idf-font.zip' },
    },
  ],
  siteColors: [
    {
      keyname: 'background',
      value: 'white',
    },
    {
      keyname: 'title',
      value: '#333',
    },
  ],
  footer: {
    socialNetworks: [
      {
        title: 'X',
        link: 'x.com/cap-collectif',
        style: 'style',
      },
    ],
    links: [
      {
        name: 'FAQ',
        url: '/faq',
      },
      {
        name: 'Contact',
        url: '/contact',
      },
    ],
    legals: {
      cookies: true,
      privacy: true,
      legal: true,
    },
    cookiesPath: '/cookies',
    legalPath: '/legals',
    privacyPath: '/privacy',
  },
  footerTitle: {
    value: 'À Propos',
  },
  footerBody: {
    value: 'La démocratie et tout et tout',
  },
}

export const mockedFooterData = {
  locales: [
    {
      code: 'FR_FR' as TranslationLocale,
      isDefault: true,
      isEnabled: true,
      isPublished: true,
      traductionKey: 'locale.fr',
    },
    {
      code: 'EN_GB' as TranslationLocale,
      isDefault: false,
      isEnabled: true,
      isPublished: true,
      traductionKey: 'locale.en',
    },
  ],
  fonts: [
    {
      name: 'OpenSans',
      useAsBody: true,
      useAsHeading: false,
      isCustom: false,
      file: { url: null },
    },
    {
      name: 'IDF-font',
      useAsBody: false,
      useAsHeading: true,
      isCustom: true,
      file: { url: '/idf-font.zip' },
    },
  ],
  footer: {
    socialNetworks: [
      {
        title: 'X',
        link: 'x.com/cap-collectif',
        style: 'style',
      },
    ],
    links: [
      {
        name: 'FAQ',
        url: '/faq',
      },
      {
        name: 'Contact',
        url: '/contact',
      },
    ],
    legals: {
      cookies: true,
      privacy: true,
      legal: true,
    },
    cookiesPath: '/cookies',
    legalPath: '/legals',
    privacyPath: '/privacy',
    textTitle: {
      value: 'À Propos',
    },
    textBody: {
      value: 'La démocratie et tout et tout',
    },
    titleColor: 'white',
    textColor: 'white',
    backgroundColor: '#2B2B2B',
    linksColor: 'white',
  },
  cookies: legacyCookieClient(),
  onLanguageChange: () => {},
  defaultLanguage: {
    code: 'FR_FR' as TranslationLocale,
    traductionKey: 'locale.fr',
  },
  /* @ts-ignore only use those 2 */
  cookieManager: <CookieManager SSRData={{ analytics: null, ads: null }} />,
}

export default MockProviders
