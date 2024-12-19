import React, { FC } from 'react'
import { Box, CapUIIcon, Flex, Heading, Icon, useTheme } from '@cap-collectif/ui'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { useAppContext } from '@components/AppProvider/App.context'
import CookieManager from '@components/Frontend/Cookies/CookieManager'
import { useIntl } from 'react-intl'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import SiteLanguageChangeButton from '@shared/language/SiteLanguageChangeButton'
import { formatCodeToLocale } from '@utils/locale-helper'
import Fetcher from '@utils/fetch'
import { useCookies } from 'next-client-cookies'
import { LOCALE_COOKIE } from '@shared/utils/cookies'

export const LinkSeparator = () => (
  <Box as="span" px={2} display={['none', 'none', 'inline']}>
    |
  </Box>
)

export const Footer: FC<{
  SSRData: layoutQuery$data
}> = ({ SSRData }) => {
  const cookies = useCookies()

  const cookiesLocale = cookies?.get(LOCALE_COOKIE)

  const intl = useIntl()
  const multilangue = useFeatureFlag('multilangue')
  const { footer, footerBody, footerTitle, locales: queryLocales, analytics, ads } = SSRData
  const { colors } = useTheme()
  const { socialNetworks, links, legalPath, legals, cookiesPath, privacyPath } = footer
  const { siteColors } = useAppContext()
  const { footerTextColor, footerTitleColor, footerBackgroundColor, footerLinksColor, footerBottomBackgroundColor } =
    siteColors

  const locales = queryLocales
    .filter(l => l.isEnabled && l.isPublished)
    .map(l => ({ translationKey: l.traductionKey, code: formatCodeToLocale(l.code) }))
  const cookiesLanguage = locales.find(e => e.code === cookiesLocale)
  const defaultLocale = queryLocales.find(e => e.isDefault)
  const defaultLanguage = { code: formatCodeToLocale(defaultLocale.code), translationKey: defaultLocale.traductionKey }

  const onLanguageChange = language => {
    Fetcher.postToJson(`/change-locale/${language.code}`, {
      // @ts-ignore the controller needs those params
      routeName: null,
      routeParams: [],
    }).then(() => {
      cookies.set('locale', language.code)
      window.location.reload()
    })
  }

  return (
    <Box
      as="footer"
      textAlign="center"
      role="contentinfo"
      borderTop={`1px solid ${colors['neutral-gray'][150]}`}
      fontSize={pxToRem(16)}
    >
      <Box
        m={0}
        width="100%"
        py={[4, 8]}
        as="div"
        bg={footerBackgroundColor}
        color={footerTextColor}
        sx={{ a: { color: footerTextColor }, 'a:hover': { color: footerTextColor } }}
      >
        <Box maxWidth={pxToRem(1280)} px={[4, 6]} margin="auto">
          <Box textAlign="center" sx={{ a: { fontWeight: 'bold', cursor: 'pointer', color: 'inherit' } }}>
            <Heading as="h3" color={footerTitleColor} mb={2}>
              {footerTitle?.value}
            </Heading>
            <WYSIWYGRender value={footerBody?.value} />
          </Box>
          {socialNetworks ? (
            <Flex justifyContent="center" mt={4}>
              <Flex
                as="ul"
                alignItems="center"
                sx={{ listStyle: 'none' }}
                gap={2}
                direction={['column', 'column', 'row']}
              >
                {socialNetworks.map(socialNetwork => (
                  <li key={socialNetwork.title}>
                    <Flex>
                      <Icon
                        name={CapUIIcon[socialNetwork.style.charAt(0).toUpperCase() + socialNetwork.style.slice(1)]}
                      />
                      <a href={socialNetwork.link}>
                        <span>{` ${socialNetwork.title}`}</span>
                      </a>
                    </Flex>
                  </li>
                ))}
              </Flex>
            </Flex>
          ) : null}
        </Box>
      </Box>
      <Box
        as="div"
        backgroundColor={footerBottomBackgroundColor}
        color={footerLinksColor}
        sx={{ a: { color: footerLinksColor }, 'a:hover': { color: footerLinksColor } }}
        id="footer-links"
        py={[4, 6]}
      >
        <Flex direction="column" alignItems="center">
          {links ? (
            <Flex
              as="ul"
              sx={{ listStyle: 'none' }}
              direction={['column', 'column', 'row']}
              alignItems="center"
              flexWrap="wrap"
              justifyContent="center"
              mb={4}
            >
              {legals.cookies && (
                <li>
                  <a href={cookiesPath}>{intl.formatMessage({ id: 'cookies' })}</a>
                </li>
              )}
              <li>
                {legals.cookies && (analytics?.value || ads?.value) ? <LinkSeparator /> : null}
                <CookieManager mode="LINK" SSRData={SSRData} display="inline" />
              </li>
              {legals.privacy && (
                <li>
                  {legals.cookies && <LinkSeparator />}
                  <a href={privacyPath}>{intl.formatMessage({ id: 'privacy-policy' })}</a>
                </li>
              )}
              {legals.legal && (
                <li>
                  {(legals.privacy || legals.cookies) && <LinkSeparator />}
                  <a href={legalPath}>{intl.formatMessage({ id: 'legal-mentions' })}</a>
                </li>
              )}
              {links
                .filter(link => !!link)
                .map((link, index) => (
                  <li key={link.name}>
                    {!index && (legals.legal || legals.privacy || legals.cookies) && <LinkSeparator />}
                    <a href={link.url}>{link.name}</a>
                    {index < links.length - 1 && <LinkSeparator />}
                  </li>
                ))}
            </Flex>
          ) : null}
          {multilangue ? (
            <SiteLanguageChangeButton
              onChange={onLanguageChange}
              languageList={locales}
              defaultLanguage={defaultLanguage.code}
              cookiesLanguage={cookiesLanguage}
              backgroundColor={`${footerBottomBackgroundColor} !important`}
              textColor={footerLinksColor}
              borderless
            />
          ) : null}
        </Flex>
        <Box as="hr" mx="auto" my={[4, 6]} borderColor="neutral-gray.500" maxWidth={pxToRem(1280)} />
        <Flex alignItems="center" justifyContent="center">
          {intl.formatMessage({ id: 'powered_by' })}
          <Box as="img" src="/favicon-64x64.png" alt="cap collectif logo" width={5} height={5} mx={2} />
          <Box as="a" color={footerLinksColor} href="https://cap-collectif.com" fontWeight="bold">
            <span>Cap Collectif</span>
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

export default Footer
