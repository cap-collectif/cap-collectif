import * as React from 'react'
import { useIntl } from 'react-intl'
import { useDisclosure } from '@liinkiing/react-hooks'
import {
  Box,
  BoxProps,
  Button,
  CapUIModalSize,
  Flex,
  Heading,
  InfoMessage,
  Modal,
  Switch,
  Text,
  toast,
} from '@cap-collectif/ui'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'
import CookieBanner from './CookieBanner'
import { useCookies } from 'next-client-cookies'
import { ADS_COOKIE, ANALYTICS_COOKIE, FULL_CONSENT_COOKIE } from '@shared/utils/cookies'
import { evalCustomCode } from 'src/app/custom-code'

type Props = {
  SSRData: layoutQuery$data
  cookieTrad?: string | null | undefined
  mode?: 'LINK' | 'BANNER'
}

const isDoNotTrackActive = () => {
  const doNotTrack = navigator.doNotTrack
  return doNotTrack === 'yes' || doNotTrack === '1'
}

type CookieBoolean = 'true' | 'false'

const ToggleCookie: React.FC<{
  id: string
  title: React.ReactNode
  switchId: string
  isEnabled: CookieBoolean
  setIsEnabled: (enable: CookieBoolean) => void
  body: React.ReactNode
}> = ({ isEnabled, setIsEnabled, id, switchId, body, title }) => {
  const intl = useIntl()
  return (
    <div id={id}>
      <Flex justifyContent="space-between" mt={4} gap={1} flexWrap="wrap">
        <strong>{title}</strong>
        <Flex alignItems="center" gap={2}>
          <Text color={isEnabled === 'true' ? 'green.700' : 'red.700'}>
            {intl.formatMessage({
              id: isEnabled === 'true' ? 'list.label_enabled' : 'global.disabled',
            })}
          </Text>
          <Switch
            id={switchId}
            checked={isEnabled === 'true'}
            onChange={() => setIsEnabled(isEnabled === 'true' ? 'false' : 'true')}
          />
        </Flex>
      </Flex>
      <Text my={4}>{body}</Text>
    </div>
  )
}

export const CookieManager: React.FC<BoxProps & Props> = ({
  mode = 'BANNER',
  SSRData,
  cookieTrad,
  display,
  ...rest
}) => {
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const cookies = useCookies()
  const initialIsAnalyticsEnabled = cookies?.get(ANALYTICS_COOKIE)
  const initialIsAdvertisingEnabled = cookies?.get(ADS_COOKIE)
  const [showBanner, setShowBanner] = React.useState(!initialIsAnalyticsEnabled && !initialIsAdvertisingEnabled)
  const [isAnalyticEnabled, setIsAnalyticEnabled] = React.useState(initialIsAnalyticsEnabled)
  const [isAdvertisingEnabled, setIsAdvertisingEnabled] = React.useState(initialIsAdvertisingEnabled)
  const doNotTrack = isDoNotTrackActive()

  const { analytics, ads } = SSRData
  const isLink = mode === 'LINK'

  const onSuccess = () => {
    setShowBanner(false)
    toast({
      content: intl.formatMessage({ id: 'your-settings-have-been-saved-successfully' }),
      variant: 'success',
    })
  }

  const saveCookie = () => {
    cookies?.set(ANALYTICS_COOKIE, isAnalyticEnabled)
    cookies?.set(ADS_COOKIE, isAdvertisingEnabled)
    cookies?.set(
      FULL_CONSENT_COOKIE,
      isAnalyticEnabled === 'true' && isAdvertisingEnabled === 'true' ? 'true' : 'false',
      {
        expires: 395,
      },
    )
    if (analytics.value && isAnalyticEnabled) evalCustomCode(analytics.value)
    if (ads.value && isAdvertisingEnabled) evalCustomCode(ads.value)
    onSuccess()
  }

  const onBannerAction = (choice: CookieBoolean) => {
    cookies?.set(FULL_CONSENT_COOKIE, choice, {
      expires: 395,
    })
    cookies?.set(ANALYTICS_COOKIE, choice)
    cookies?.set(ADS_COOKIE, choice)
    if (choice === 'true') {
      if (analytics.value && !initialIsAnalyticsEnabled) evalCustomCode(analytics.value)
      if (ads.value && !initialIsAdvertisingEnabled) evalCustomCode(ads.value)
    }
    onSuccess()
  }

  if (!analytics?.value && !ads?.value) {
    return null
  }

  return (
    <Box display={display}>
      {isLink ? (
        <Box as="button" type="button" id="cookies-management" onClick={onOpen} {...rest}>
          {intl.formatMessage({ id: cookieTrad || 'cookies-management' })}
        </Box>
      ) : showBanner ? (
        <CookieBanner
          onOpen={onOpen}
          onRefuse={() => onBannerAction('false')}
          onAccept={() => onBannerAction('true')}
        />
      ) : null}

      {isOpen ? (
        <Modal
          size={CapUIModalSize.Lg}
          show={isOpen}
          onClose={onClose}
          ariaLabel={intl.formatMessage({
            id: 'cookies-management',
          })}
          className="modal-cookie-manager"
          alwaysOpenInPortal
        >
          <Modal.Header>
            <Heading>
              {intl.formatMessage({
                id: 'cookies-management',
              })}
            </Heading>
          </Modal.Header>
          <Modal.Body>
            {doNotTrack && (
              <InfoMessage variant="info" id="cookies-alert" mb={5}>
                <InfoMessage.Title>
                  {intl.formatMessage({
                    id: 'cookies-are-disabled-by-default',
                  })}
                </InfoMessage.Title>
              </InfoMessage>
            )}
            {intl.formatMessage({
              id: 'cookies.content.page',
            })}
            {analytics?.value?.length > 1 && (
              <ToggleCookie
                id="cookies-performance"
                title={intl.formatMessage({
                  id: 'performance',
                })}
                isEnabled={isAnalyticEnabled as CookieBoolean}
                setIsEnabled={setIsAnalyticEnabled}
                switchId="cookies-enable-analytic"
                body={intl.formatMessage({
                  id: 'help-text-performance-option',
                })}
              />
            )}
            {ads.value?.length > 1 && (
              <ToggleCookie
                id="cookies-advertising"
                title={intl.formatMessage({
                  id: 'advertising',
                })}
                isEnabled={isAdvertisingEnabled as CookieBoolean}
                setIsEnabled={setIsAdvertisingEnabled}
                switchId="cookies-enable-ads"
                body={intl.formatMessage({
                  id: 'help-text-advertising-option',
                })}
              />
            )}
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <Button variantSize="big" variant="secondary" onClick={onClose}>
              {intl.formatMessage({ id: 'global.close' })}
            </Button>
            <Button
              variantSize="big"
              variant="primary"
              onClick={() => {
                saveCookie()
                onClose()
              }}
            >
              {intl.formatMessage({
                id: 'global.save',
              })}
            </Button>
          </Modal.Footer>
        </Modal>
      ) : null}
    </Box>
  )
}

export default CookieManager
