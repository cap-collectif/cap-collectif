import * as React from 'react'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { useCookies } from 'next-client-cookies'
import { Box, CapUIFontSize, CapUIIcon, CapUIIconSize, Flex, Icon, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import SiteLanguageChangeButton from '@shared/language/SiteLanguageChangeButton'
import Fetcher from '@utils/fetch'
import { formatCodeToLocale, setLocaleCookie } from '@utils/locale-helper'
import { AnimatePresence, motion } from 'framer-motion'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'
import { usePathname } from 'next/navigation'

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

const ChangeLanguageNavBar: React.FC<{ locales: layoutQuery$data['locales'] }> = ({ locales: queryLocales }) => {
  const cookies = useCookies()
  const intl = useIntl()
  const [show, setShow] = React.useState(true)
  const multilangue = useFeatureFlag('multilangue')
  const locale = cookies.get('locale')
  const pathname = usePathname()
  const locales = queryLocales
    .filter(l => l.isEnabled && l.isPublished)
    .map(l => ({ translationKey: l.traductionKey, code: formatCodeToLocale(l.code) }))

  const defaultLocale = queryLocales.find(e => e.isDefault)
  const defaultLanguage = { code: formatCodeToLocale(defaultLocale.code), translationKey: defaultLocale.traductionKey }

  const [currentLanguage, updateLanguage] = React.useState(defaultLanguage)
  const currentLanguageRef = React.useRef(currentLanguage)

  React.useEffect(() => {
    currentLanguageRef.current = currentLanguage
  }, [currentLanguage])

  const pathPrefix = pathname?.split('/').filter(Boolean)[0]?.toLowerCase() ?? ''
  const pathLocale = locales.find(language => getLocalePrefix(language.code) === pathPrefix)?.code

  if (locale || pathLocale || !multilangue) return null

  const stripLocalePrefix = (pathname: string): string => {
    const prefixes = new Set(locales.map(l => getLocalePrefix(l.code)))
    const parts = pathname.split('/').filter(Boolean)
    if (parts[0] && prefixes.has(parts[0])) {
      parts.shift()
    }

    return parts.length ? `/${parts.join('/')}` : '/'
  }

  const buildTargetPath = (localeCode: string): string => {
    const normalizedPath = stripLocalePrefix(window.location.pathname)

    if (normalizedPath === '/admin-next' || normalizedPath.startsWith('/admin-next/')) {
      return `${normalizedPath}${window.location.search}${window.location.hash}`
    }

    const nextPath = getPrefixedPath(
      localeCode,
      window.location.pathname,
      locales.map(locale => locale.code),
    )
    return `${nextPath}${window.location.search}${window.location.hash}`
  }

  const onLanguageSelect = (language: typeof defaultLanguage) => {
    updateLanguage(language)
    currentLanguageRef.current = language
  }

  const navigateWithReload = (targetPath: string) => {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (targetPath === currentPath) {
      window.location.reload()
      return
    }

    window.location.href = targetPath
  }

  const persistLocaleCookie = (localeCode: string): void => {
    setLocaleCookie(
      localeCode,
      locales.map(locale => locale.code),
    )
  }

  const navigateAfterCookieWrite = (targetPath: string): void => {
    window.setTimeout(() => {
      navigateWithReload(targetPath)
    }, 0)
  }

  const onChange = () => {
    const selectedLanguage = currentLanguageRef.current

    Fetcher.postToJson(`/change-locale/${selectedLanguage.code}`, {
      // @ts-ignore the controller needs those params
      routeName: null,
      routeParams: [],
      currentPath: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    })
      .then(() => {
        persistLocaleCookie(selectedLanguage.code)
        navigateAfterCookieWrite(buildTargetPath(selectedLanguage.code))
      })
      .catch(() => {
        persistLocaleCookie(selectedLanguage.code)
        navigateAfterCookieWrite(buildTargetPath(selectedLanguage.code))
      })
  }
  const onClose = () => {
    persistLocaleCookie(currentLanguageRef.current.code)
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show ? (
        <motion.div exit={{ opacity: 0 }} transition={{ delay: 0.2 }}>
          <Box bg="neutral-gray.800" position="relative" p={[4, 0]} id="change-language-navBar">
            <Flex
              flexDirection={['column', 'column', 'row']}
              maxWidth="91.43rem"
              width="100%"
              margin="auto"
              justifyContent="space-between"
              alignItems="center"
              p={6}
            >
              <Text fontSize={CapUIFontSize.BodyLarge} color="white">
                {intl.formatMessage({ id: 'would-you-like-to-consult-the-site-in-your-own-language' })}
              </Text>
              <Flex spacing={2} pr={[0, 0, 6, 6]} mt={[4, 4, 0]}>
                <SiteLanguageChangeButton
                  id="language-header-change-button"
                  languageList={locales}
                  defaultLanguage={defaultLanguage.code}
                  onChange={onLanguageSelect}
                  backgroundColor="neutral-gray.600"
                  textColor="white"
                />
                <Box
                  as="button"
                  type="button"
                  color="white"
                  bg="gray.600"
                  borderRadius="normal"
                  px={2}
                  py={1}
                  fontWeight={600}
                  onClick={onChange}
                >
                  {intl.formatMessage({ id: 'global.continue' })}
                </Box>
              </Flex>
            </Flex>
            <Box
              as="button"
              onClick={onClose}
              position="absolute"
              right={4}
              top={[2, 7]}
              aria-label={intl.formatMessage(
                { id: 'close-multilangue-band' },
                { locale: intl.formatMessage({ id: defaultLanguage.translationKey }) },
              )}
            >
              <Icon name={CapUIIcon.CrossO} color="white" size={CapUIIconSize.Md} />
            </Box>
          </Box>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default ChangeLanguageNavBar
