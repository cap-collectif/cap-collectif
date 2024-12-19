import * as React from 'react'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { useCookies } from 'next-client-cookies'
import { Box, CapUIIcon, CapUIIconSize, Flex, Icon, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import SiteLanguageChangeButton from '@shared/language/SiteLanguageChangeButton'
import Fetcher from '@utils/fetch'
import { formatCodeToLocale } from '@utils/locale-helper'
import { AnimatePresence, motion } from 'framer-motion'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'

const ChangeLanguageNavBar: React.FC<{ locales: layoutQuery$data['locales'] }> = ({ locales: queryLocales }) => {
  const cookies = useCookies()
  const intl = useIntl()
  const [show, setShow] = React.useState(true)
  const multilangue = useFeatureFlag('multilangue')
  const locale = cookies.get('locale')
  const locales = queryLocales
    .filter(l => l.isEnabled && l.isPublished)
    .map(l => ({ translationKey: l.traductionKey, code: formatCodeToLocale(l.code) }))

  const defaultLocale = queryLocales.find(e => e.isDefault)
  const defaultLanguage = { code: formatCodeToLocale(defaultLocale.code), translationKey: defaultLocale.traductionKey }

  const [currentLanguage, updateLanguage] = React.useState(defaultLanguage)

  if (locale || !multilangue) return null

  const onChange = () => {
    Fetcher.postToJson(`/change-locale/${currentLanguage.code}`, {
      // @ts-ignore the controller needs those params
      routeName: null,
      routeParams: [],
    }).then(() => {
      cookies.set('locale', currentLanguage.code)
      window.location.reload()
    })
  }
  const onClose = () => {
    cookies.set('locale', currentLanguage.code)
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
              <Text fontSize="1.15rem" color="white">
                {intl.formatMessage({ id: 'would-you-like-to-consult-the-site-in-your-own-language' })}
              </Text>
              <Flex spacing={2} pr={[0, 0, 6, 6]} mt={[4, 4, 0]}>
                <SiteLanguageChangeButton
                  id="language-header-change-button"
                  languageList={locales}
                  defaultLanguage={defaultLanguage.code}
                  onChange={updateLanguage}
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
            <Box as="button" onClick={onClose} position="absolute" right={4} top={[2, 7]}>
              <Icon name={CapUIIcon.CrossO} color="white" size={CapUIIconSize.Md} />
            </Box>
          </Box>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default ChangeLanguageNavBar
