import React, { FC, ReactNode } from 'react'
import {
  Box,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  Flex,
  Heading,
  Icon,
  Text,
} from '@cap-collectif/ui'
import { layoutQuery$data, TranslationLocale } from '@relay/layoutQuery.graphql'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { LOCALE_COOKIE } from '@shared/utils/cookies'
import { CookieClient } from '@shared/utils/universalCookies'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import SiteLanguageChangeButton from '@shared/language/SiteLanguageChangeButton'
import { useIntl } from 'react-intl'
import { FooterBrand } from './FooterBrand'
import { Cookies } from 'next-client-cookies'
import { pxToRem } from '@shared/utils/pxToRem'

const getIconName = (item: string): string => {
  return item === 'link-1' ? 'SHARE_LINK' : item ? item.toUpperCase() + '_COLORED' : null
}

type FooterProps = layoutQuery$data['footer'] & {
  textTitle: {
    value: string
  }
  textBody: {
    value: string
  }
  textColor: string
  backgroundColor: string
}

export interface Locale {
  code: TranslationLocale
  translationKey: string
}

interface Props {
  cookies: CookieClient | Cookies
  footer: FooterProps
  locales: Locale[]
  onLanguageChange: (language: Locale) => void
  defaultLanguage: Locale
  cookieManager: ReactNode
}

export const Footer: FC<Props> = props => {
  const intl = useIntl()
  const multilangue = useFeatureFlag('multilangue')
  const { cookies, locales, footer, onLanguageChange, defaultLanguage, cookieManager } = props
  const { socialNetworks, links, legalPath, legals, cookiesPath, privacyPath } = footer

  const cookiesLocale = cookies?.get(LOCALE_COOKIE)
  const cookiesLanguage = locales.find(e => e.code === cookiesLocale)

  return (
    <Box
      as="footer"
      role="contentinfo"
      bg={footer.backgroundColor}
      color={footer.textColor}
      justifyItems="center"
      padding="lg"
      fontSize={CapUIFontSize.BodyLarge}
      sx={{ a: { color: `${footer.textColor} !important` } }}
    >
      <Flex gap={['xl', 'xxl']} flexDirection={['column', 'row']} width="100%" maxWidth={pxToRem(1280)}>
        <Flex flexDirection="column" justifyContent="space-between" gap="md" width="100%" maxWidth="500px">
          <Box>
            {footer.textTitle?.value ? (
              <Heading
                as="h3"
                color={`${footer.textColor} !important`}
                lineHeight={CapUILineHeight.M}
                fontSize={CapUIFontSize.BodyLarge}
                fontWeight={CapUIFontWeight.Normal}
                sx={{ wordBreak: 'break-word' }}
              >
                {footer.textTitle?.value}
              </Heading>
            ) : null}
            <Text
              lineHeight="md"
              color={`${footer.textColor} !important`}
              fontSize={CapUIFontSize.BodySmall}
              mt="xs"
              sx={{ a: { textDecoration: 'underline' } }}
            >
              <WYSIWYGRender value={footer.textBody?.value} />
            </Text>
            {socialNetworks?.length ? (
              <Flex mt="md">
                <Flex
                  as="ul"
                  sx={{ listStyle: 'none', a: { fontSize: CapUIFontSize.BodyRegular, textDecoration: 'underline' } }}
                  gap="md"
                  flexWrap="wrap"
                  direction="row"
                >
                  {socialNetworks.map(socialNetwork => (
                    <li key={socialNetwork.title}>
                      <Flex gap="xxs" alignItems="center">
                        <Icon size={CapUIIconSize.Lg} name={getIconName(socialNetwork.style) as CapUIIcon} />
                        <a href={socialNetwork.link} color={footer.textColor}>
                          <span>{`${socialNetwork.title}`}</span>
                        </a>
                      </Flex>
                    </li>
                  ))}
                </Flex>
              </Flex>
            ) : null}
          </Box>
          <Box display={['none', 'block']}>
            <FooterBrand />
          </Box>
        </Flex>
        <Box width="100%">
          <Heading as="h4" color={`${footer.textColor}!important`} fontSize={CapUIFontSize.BodyLarge}>
            {intl.formatMessage({ id: 'other-links' })}
          </Heading>
          <Box
            className="footer-links"
            as="ul"
            sx={{ listStyle: 'none' }}
            mt="xs"
            fontSize={CapUIFontSize.BodyRegular}
            lineHeight={CapUILineHeight.M}
            fontWeight={CapUIFontWeight.Semibold}
            display="grid"
            gridRowGap="xs"
            gridColumnGap="md"
            gridTemplateColumns="repeat(auto-fit, minmax(150px, auto))"
          >
            {legals.cookies && (
              <li>
                <a href={cookiesPath}>{intl.formatMessage({ id: 'cookies' })}</a>
              </li>
            )}
            <Box
              as="li"
              sx={{
                '[class*=LinkSeparator]': { display: 'none' },
                '#cookies-management[type=button]': {
                  border: 'none',
                  color: `${footer.textColor} !important`,
                  fontWeight: CapUIFontWeight.Semibold,
                },
              }}
            >
              {cookieManager}
            </Box>
            {legals.privacy && (
              <li>
                <a href={privacyPath}>{intl.formatMessage({ id: 'privacy-policy' })}</a>
              </li>
            )}
            {legals.legal && (
              <li>
                <a href={legalPath}>{intl.formatMessage({ id: 'legal-mentions' })}</a>
              </li>
            )}
            <li>
              <a href="/pages/charte">{intl.formatMessage({ id: 'charter' })}</a>
            </li>
            {links &&
              links
                .filter(link => !!link)
                .map(link => (
                  <li key={link.name}>
                    <a href={link.url}>{link.name}</a>
                  </li>
                ))}
            {multilangue ? (
              <Box as="li">
                <SiteLanguageChangeButton
                  onChange={onLanguageChange}
                  languageList={locales}
                  defaultLanguage={defaultLanguage.code}
                  cookiesLanguage={cookiesLanguage}
                  backgroundColor={`${footer.textColor} !important`}
                  textColor={footer.backgroundColor}
                  borderless
                  withLabel
                  iconLeft={false}
                />
              </Box>
            ) : null}
          </Box>
        </Box>
        <Box display={['block', 'none']}>
          <FooterBrand />
        </Box>
      </Flex>
    </Box>
  )
}

export default Footer
