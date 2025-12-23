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
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import SiteLanguageChangeButton from '@shared/language/SiteLanguageChangeButton'
import { LOCALE_COOKIE } from '@shared/utils/cookies'
import { pxToRem } from '@shared/utils/pxToRem'
import { CookieClient } from '@shared/utils/universalCookies'
import { Cookies } from 'next-client-cookies'
import React, { FC, ReactNode } from 'react'
import { useIntl } from 'react-intl'
import { FooterBrand } from './FooterBrand'

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
    >
      <Flex gap={['xl', 'xxl']} flexDirection={['column', 'row']} width="100%" maxWidth={pxToRem(1280)}>
        <Flex flexDirection="column" justifyContent="space-between" gap="md" width="100%" maxWidth="500px">
          <Box>
            {footer.textTitle?.value ? (
              <Heading
                as="h3"
                color={footer.textColor}
                lineHeight={CapUILineHeight.M}
                fontSize={CapUIFontSize.BodyLarge}
                fontWeight={CapUIFontWeight.Normal}
                sx={{ wordBreak: 'break-word' }}
              >
                {footer.textTitle?.value}
              </Heading>
            ) : null}
            <Text
              lineHeight="S"
              color={footer.textColor}
              fontSize={CapUIFontSize.BodySmall}
              mt="xs"
              sx={{
                'a:not(.btn)': {
                  color: footer.textColor,
                  textDecoration: 'underline',
                  '&:hover': { color: footer.textColor },
                },
              }}
            >
              <WYSIWYGRender value={footer.textBody?.value} />
            </Text>
            {socialNetworks?.length ? (
              <Flex mt="md">
                <Flex as="ul" gap="md" flexWrap="wrap" direction="row" sx={{ listStyle: 'none' }}>
                  {socialNetworks.map(socialNetwork => (
                    <li key={socialNetwork.title}>
                      <Flex gap="xxs" alignItems="center">
                        <Icon size={CapUIIconSize.Lg} name={getIconName(socialNetwork.style) as CapUIIcon} />
                        <Box
                          as="a"
                          color={footer.textColor}
                          fontSize={CapUIFontSize.BodyRegular}
                          sx={{ textDecoration: 'underline' }}
                          href={socialNetwork.link}
                        >
                          <span>{`${socialNetwork.title}`}</span>
                        </Box>
                      </Flex>
                    </li>
                  ))}
                </Flex>
              </Flex>
            ) : null}
          </Box>
          <Box display={['none', 'block']} sx={{ a: { color: footer.textColor } }}>
            <FooterBrand />
          </Box>
        </Flex>
        <Box width="100%">
          <Heading as="h4" color={footer.textColor} fontSize={CapUIFontSize.BodyLarge}>
            {intl.formatMessage({ id: 'other-links' })}
          </Heading>
          <Box
            className="footer-links"
            as="ul"
            mt="xs"
            fontSize={CapUIFontSize.BodyRegular}
            lineHeight={CapUILineHeight.M}
            fontWeight={CapUIFontWeight.Semibold}
            display="grid"
            gridRowGap="xs"
            gridColumnGap="md"
            gridTemplateColumns="repeat(auto-fit, minmax(150px, auto))"
            sx={{ listStyle: 'none', a: { color: footer.textColor } }}
          >
            {legals.cookies && (
              <li>
                <a href={cookiesPath}>{intl.formatMessage({ id: 'cookies' })}</a>
              </li>
            )}
            {cookieManager}
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
                  backgroundColor={footer.textColor}
                  textColor={footer.backgroundColor}
                  borderless
                  withLabel
                  iconLeft={false}
                />
              </Box>
            ) : null}
          </Box>
        </Box>
        <Box display={['block', 'none']} sx={{ a: { color: footer.textColor } }}>
          <FooterBrand />
        </Box>
      </Flex>
    </Box>
  )
}

export default Footer
